"""
FMCSA Hours of Service (HOS) Engine
Property-carrying driver, 70hr/8-day rule.

Key Rules Implemented:
  - 11-Hour Driving Limit: Max 11h driving after 10h off-duty
  - 14-Hour Duty Window: 14h window from shift start (on-duty or driving)
  - 30-Minute Rest Break: Required after 8 cumulative driving hours
  - 10-Hour Off-Duty Rest: Required between shifts
  - 70-Hour/8-Day Cycle: Rolling 8-day total; cannot drive if >= 70h
  - Fueling: At least every 1,000 miles (30-min on-duty stop)
  - Pickup: 1-hour on-duty stop at pickup
  - Dropoff: 1-hour on-duty stop at dropoff

Status types:
  OFF_DUTY = "off_duty"
  SLEEPER  = "sleeper"
  DRIVING  = "driving"
  ON_DUTY  = "on_duty"  (not driving - pickup, dropoff, fueling, pre-trip)
"""

from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime, timedelta

OFF_DUTY = "off_duty"
SLEEPER = "sleeper"
DRIVING = "driving"
ON_DUTY = "on_duty"


@dataclass
class StatusChange:
    """Represents a status change event in the trip."""
    start_hour: float       # hours since trip start
    end_hour: float
    status: str             # OFF_DUTY, SLEEPER, DRIVING, ON_DUTY
    description: str
    location: Optional[str] = None
    day: int = 0            # which day (0-indexed) this event falls on


@dataclass
class DailyLog:
    """Represents one 24-hour ELD daily log sheet."""
    day_number: int         # 1-indexed
    date_label: str         # e.g. "Day 1"
    events: List[StatusChange] = field(default_factory=list)
    total_off_duty: float = 0.0
    total_sleeper: float = 0.0
    total_driving: float = 0.0
    total_on_duty: float = 0.0
    remarks: List[str] = field(default_factory=list)
    starting_location: str = ""
    ending_location: str = ""


@dataclass
class TripStop:
    """A notable stop shown on the map."""
    name: str
    type: str           # 'pickup', 'dropoff', 'fuel', 'rest_30min', 'rest_10hr', 'start'
    lat: float
    lon: float
    trip_hour: float    # hours since trip start
    description: str


def _interpolate_coords(geometry: list, fraction: float) -> tuple:
    """Interpolate a lat/lon from a GeoJSON coordinate list at a fraction [0,1]."""
    if not geometry:
        return (0.0, 0.0)
    if fraction <= 0:
        return (geometry[0][1], geometry[0][0])
    if fraction >= 1:
        return (geometry[-1][1], geometry[-1][0])

    total_segments = len(geometry) - 1
    target = fraction * total_segments
    idx = int(target)
    frac = target - idx

    if idx >= total_segments:
        idx = total_segments - 1
        frac = 1.0

    lon1, lat1 = geometry[idx]
    lon2, lat2 = geometry[idx + 1]
    lat = lat1 + (lat2 - lat1) * frac
    lon = lon1 + (lon2 - lon1) * frac
    return (lat, lon)


def calculate_trip(
    current_location: str,
    pickup_location: str,
    dropoff_location: str,
    current_cycle_used: float,
    route_info: dict,
    current_coords: tuple,
    pickup_coords: tuple,
    dropoff_coords: tuple,
) -> dict:
    """
    Main HOS trip planning function. Returns a dict with:
      - stops: list of TripStop dicts (for map markers)
      - daily_logs: list of DailyLog dicts (for ELD log sheets)
      - total_trip_hours: float
      - total_distance_miles: float
      - summary: dict with key stats
    """
    leg1_miles = route_info["leg1"]["distance_miles"]
    leg2_miles = route_info["leg2"]["distance_miles"]
    leg1_drive_hours = route_info["leg1"]["duration_hours"]
    leg2_drive_hours = route_info["leg2"]["duration_hours"]
    total_miles = leg1_miles + leg2_miles
    geometry = route_info["geometry"]

    # Pre-trip inspection: 15 minutes on-duty not driving
    PRE_TRIP_HOURS = 0.25
    PICKUP_HOURS = 1.0
    DROPOFF_HOURS = 1.0
    FUEL_STOP_HOURS = 0.5  # 30 min
    REST_30MIN = 0.5
    REST_10HR = 10.0

    # State tracking
    clock = 0.0             # hours since trip started (wall clock offset from midnight Day 1)
    cycle_used = current_cycle_used   # hours used in 8-day cycle
    driving_since_break = 0.0        # cumulative driving since last 30-min break
    shift_start = None               # when current shift started (for 14h window)
    shift_driving = 0.0              # driving hours in current shift
    miles_since_fuel = 0.0

    stops: List[TripStop] = []
    status_changes: List[StatusChange] = []
    daily_logs_events = {}  # day_index -> list of StatusChange

    def add_status(start: float, end: float, status: str, desc: str, location: str = ""):
        sc = StatusChange(
            start_hour=start,
            end_hour=end,
            status=status,
            description=desc,
            location=location,
        )
        status_changes.append(sc)

    def add_stop(name: str, stop_type: str, coords: tuple, trip_hour: float, desc: str):
        stops.append(TripStop(
            name=name, type=stop_type,
            lat=coords[0], lon=coords[1],
            trip_hour=trip_hour, description=desc
        ))

    def check_10hr_cycle():
        """Check if cycle is used up - if so, 34-hour restart."""
        nonlocal cycle_used, clock
        if cycle_used >= 70.0:
            add_status(clock, clock + 34, OFF_DUTY, "34-Hour Restart (Cycle Reset)")
            add_stop("34-Hr Restart", "rest_10hr", _interpolate_coords(geometry, min(clock / max(total_miles, 1), 1)), clock, "34-hour cycle restart")
            clock += 34
            cycle_used = 0.0
            return True
        return False

    def do_10hr_rest(location: str = ""):
        """Force a 10-hour rest break."""
        nonlocal clock, shift_start, shift_driving, driving_since_break
        add_status(clock, clock + REST_10HR, OFF_DUTY, "10-Hour Rest (Required)", location)
        add_stop("10-Hr Rest", "rest_10hr", _interpolate_coords(geometry, min(miles_since_fuel / max(total_miles, 1), 1)), clock, "Mandatory 10-hour rest period")
        clock += REST_10HR
        shift_start = None
        shift_driving = 0.0
        driving_since_break = 0.0

    def do_drive_segment(drive_hours: float, miles: float, start_loc: str, end_loc: str):
        """
        Drive a segment, inserting mandatory breaks/rests as needed.
        Returns the actual clock time consumed.
        """
        nonlocal clock, cycle_used, driving_since_break, shift_start, shift_driving, miles_since_fuel

        remaining_drive = drive_hours
        remaining_miles = miles

        while remaining_drive > 0:
            # Initialize shift if needed
            if shift_start is None:
                shift_start = clock

            window_used = clock - shift_start
            window_remaining = 14.0 - window_used     # 14-hr window
            shift_drive_remaining = 11.0 - shift_driving  # 11-hr drive limit
            break_before = max(0, 8.0 - driving_since_break)  # hours until mandatory break needed

            # Cycle hours check
            cycle_remaining = 70.0 - cycle_used
            if cycle_remaining <= 0:
                check_10hr_cycle()
                shift_start = clock
                shift_driving = 0.0
                driving_since_break = 0.0
                window_used = 0
                window_remaining = 14.0
                shift_drive_remaining = 11.0
                cycle_remaining = 70.0

            # How much can we drive before something forces a stop?
            # 1. Shift drive limit (11h)
            # 2. Shift window limit (14h)
            # 3. 30-min break (8h cumulative driving)
            # 4. Fuel stop every 1000 miles
            # 5. Remaining segment

            # Compute miles/hour ratio for this segment
            mph_equiv = miles / drive_hours if drive_hours > 0 else 55  # approx speed

            # Miles until next fuel stop
            miles_to_fuel = 1000.0 - miles_since_fuel
            hours_to_fuel = miles_to_fuel / mph_equiv if mph_equiv > 0 else 999

            # Constraints on this drive chunk
            can_drive = min(
                remaining_drive,
                shift_drive_remaining,
                window_remaining,
                break_before if driving_since_break < 8.0 else 0.001,
                hours_to_fuel,
                cycle_remaining,
            )

            # Enforce 30-min break takes priority
            if driving_since_break >= 8.0:
                # Must take 30-min break NOW
                add_status(clock, clock + REST_30MIN, OFF_DUTY, "30-Minute Rest Break (Required)")
                add_stop("30-Min Break", "rest_30min",
                         _interpolate_coords(geometry, (total_miles - remaining_miles) / max(total_miles, 1)),
                         clock, "Mandatory 30-minute rest break")
                clock += REST_30MIN
                driving_since_break = 0.0
                continue

            if can_drive <= 0:
                # Window or shift limit reached - take 10-hr rest
                do_10hr_rest()
                shift_start = clock
                shift_driving = 0.0
                driving_since_break = 0.0
                continue

            # Drive this chunk
            drive_miles_chunk = can_drive * mph_equiv
            add_status(clock, clock + can_drive, DRIVING, f"Driving ({can_drive:.2f}h)")
            clock += can_drive
            shift_driving += can_drive
            driving_since_break += can_drive
            cycle_used += can_drive
            miles_since_fuel += drive_miles_chunk
            remaining_drive -= can_drive
            remaining_miles -= drive_miles_chunk

            # After drive chunk, check what constraint was hit
            if miles_since_fuel >= 1000.0:
                # Fuel stop
                add_status(clock, clock + FUEL_STOP_HOURS, ON_DUTY, "Fueling Stop")
                add_stop("Fuel Stop", "fuel",
                         _interpolate_coords(geometry, (total_miles - remaining_miles) / max(total_miles, 1)),
                         clock, f"Required fueling stop (~{int(total_miles - remaining_miles)} miles)")
                clock += FUEL_STOP_HOURS
                cycle_used += FUEL_STOP_HOURS
                miles_since_fuel = 0.0

            # Check 30-min break needed after driving
            if driving_since_break >= 8.0 and remaining_drive > 0:
                add_status(clock, clock + REST_30MIN, OFF_DUTY, "30-Minute Rest Break (Required)")
                add_stop("30-Min Break", "rest_30min",
                         _interpolate_coords(geometry, (total_miles - remaining_miles) / max(total_miles, 1)),
                         clock, "Mandatory 30-minute rest break")
                clock += REST_30MIN
                driving_since_break = 0.0

            # Check shift limits
            if shift_start is not None:
                window_used = clock - shift_start
                if window_used >= 14.0 or shift_driving >= 11.0:
                    if remaining_drive > 0:
                        do_10hr_rest()
                        shift_start = clock
                        shift_driving = 0.0
                        driving_since_break = 0.0

    # ---- START TRIP ----

    # Pre-trip inspection
    shift_start = clock
    add_status(clock, clock + PRE_TRIP_HOURS, ON_DUTY, "Pre-Trip Inspection", current_location)
    clock += PRE_TRIP_HOURS
    cycle_used += PRE_TRIP_HOURS

    # Add start stop
    add_stop("Start (Current)", "start", current_coords, 0.0, f"Trip begins at {current_location}")

    # Leg 1: Drive to pickup
    if leg1_miles > 0:
        do_drive_segment(leg1_drive_hours, leg1_miles, current_location, pickup_location)
    else:
        # Pickup is same as current - just post-trip to pickup
        pass

    # Arrival at pickup
    add_status(clock, clock + PICKUP_HOURS, ON_DUTY, "Pickup (On-Duty)", pickup_location)
    add_stop("Pickup", "pickup", pickup_coords, clock, f"1-hour pickup at {pickup_location}")
    clock += PICKUP_HOURS
    cycle_used += PICKUP_HOURS

    # Leg 2: Drive to dropoff
    do_drive_segment(leg2_drive_hours, leg2_miles, pickup_location, dropoff_location)

    # Arrival at dropoff
    add_status(clock, clock + DROPOFF_HOURS, ON_DUTY, "Dropoff (On-Duty)", dropoff_location)
    add_stop("Dropoff", "dropoff", dropoff_coords, clock, f"1-hour dropoff at {dropoff_location}")
    clock += DROPOFF_HOURS
    cycle_used += DROPOFF_HOURS

    # Final off-duty
    add_status(clock, clock + 10, OFF_DUTY, "End of Trip - Off Duty", dropoff_location)

    total_trip_hours = clock

    # ---- BUILD DAILY LOGS ----
    num_days = max(1, int(total_trip_hours / 24) + 1)
    daily_logs = []

    for day_idx in range(num_days):
        day_start = day_idx * 24.0
        day_end = day_start + 24.0

        log = DailyLog(
            day_number=day_idx + 1,
            date_label=f"Day {day_idx + 1}",
        )

        # Filter status changes that overlap this day
        day_events = []
        for sc in status_changes:
            # Clip event to this day's window
            ev_start = max(sc.start_hour, day_start)
            ev_end = min(sc.end_hour, day_end)
            if ev_end <= ev_start:
                continue

            clipped = StatusChange(
                start_hour=ev_start - day_start,  # relative to this day's midnight
                end_hour=ev_end - day_start,
                status=sc.status,
                description=sc.description,
                location=sc.location,
                day=day_idx,
            )
            day_events.append(clipped)

            # Accumulate totals
            duration = ev_end - ev_start
            if sc.status == OFF_DUTY:
                log.total_off_duty += duration
            elif sc.status == SLEEPER:
                log.total_sleeper += duration
            elif sc.status == DRIVING:
                log.total_driving += duration
            elif sc.status == ON_DUTY:
                log.total_on_duty += duration

        # Fill gaps with off_duty (if any exist between events or at start/end)
        filled_events = []
        cursor = 0.0
        sorted_events = sorted(day_events, key=lambda e: e.start_hour)

        for ev in sorted_events:
            if ev.start_hour > cursor + 0.01:
                gap = StatusChange(
                    start_hour=cursor,
                    end_hour=ev.start_hour,
                    status=OFF_DUTY,
                    description="Off Duty",
                    day=day_idx,
                )
                filled_events.append(gap)
                log.total_off_duty += (ev.start_hour - cursor)
            filled_events.append(ev)
            cursor = ev.end_hour

        if cursor < 24.0 - 0.01:
            filled_events.append(StatusChange(
                start_hour=cursor,
                end_hour=24.0,
                status=OFF_DUTY,
                description="Off Duty",
                day=day_idx,
            ))
            log.total_off_duty += (24.0 - cursor)

        log.events = filled_events

        # Remarks
        for ev in filled_events:
            if ev.description and ev.description not in ("Off Duty", "Driving"):
                log.remarks.append(f"{_hours_to_hhmm(ev.start_hour)} - {ev.description}")

        daily_logs.append(log)

    # ---- SERIALIZE RESULT ----
    return {
        "stops": [
            {
                "name": s.name,
                "type": s.type,
                "lat": s.lat,
                "lon": s.lon,
                "trip_hour": s.trip_hour,
                "description": s.description,
            }
            for s in stops
        ],
        "daily_logs": [
            {
                "day_number": log.day_number,
                "date_label": log.date_label,
                "total_off_duty": round(log.total_off_duty, 2),
                "total_sleeper": round(log.total_sleeper, 2),
                "total_driving": round(log.total_driving, 2),
                "total_on_duty": round(log.total_on_duty, 2),
                "remarks": log.remarks[:10],
                "events": [
                    {
                        "start_hour": round(e.start_hour, 4),
                        "end_hour": round(e.end_hour, 4),
                        "status": e.status,
                        "description": e.description,
                        "location": e.location or "",
                    }
                    for e in log.events
                ],
            }
            for log in daily_logs
        ],
        "total_trip_hours": round(total_trip_hours, 2),
        "total_distance_miles": round(total_miles, 1),
        "summary": {
            "current_location": current_location,
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location,
            "cycle_hours_used_at_start": current_cycle_used,
            "cycle_hours_used_at_end": round(min(cycle_used, 70.0), 2),
            "total_driving_hours": round(sum(
                e.end_hour - e.start_hour
                for sc in status_changes if sc.status == DRIVING
                for e in [sc]
            ), 2),
            "num_days": num_days,
            "num_fuel_stops": sum(1 for s in stops if s.type == "fuel"),
            "num_rest_stops": sum(1 for s in stops if "rest" in s.type),
        },
        "route_geometry": route_info["geometry"],
    }


def _hours_to_hhmm(hours: float) -> str:
    """Convert decimal hours to HH:MM string."""
    h = int(hours)
    m = int((hours - h) * 60)
    return f"{h:02d}:{m:02d}"
