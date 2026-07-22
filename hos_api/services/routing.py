"""
Routing service: Geocoding via Nominatim & route calculation via OSRM.
"""
import requests


NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"


def geocode_location(location_str: str) -> dict:
    """
    Convert a location string to lat/lon coordinates using Nominatim.
    Returns dict with 'lat', 'lon', 'display_name'.
    """
    params = {
        "q": location_str,
        "format": "json",
        "limit": 1,
    }
    headers = {"User-Agent": "ELD-HOS-Planner/1.0 (contact@eldplanner.com)"}
    resp = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
    resp.raise_for_status()
    results = resp.json()
    if not results:
        raise ValueError(f"Could not geocode location: '{location_str}'")
    result = results[0]
    return {
        "lat": float(result["lat"]),
        "lon": float(result["lon"]),
        "display_name": result["display_name"],
    }


def get_route(origin: dict, destination: dict) -> dict:
    """
    Get driving route between two lat/lon points using OSRM.
    Returns dict with 'distance_miles', 'duration_hours', 'geometry' (GeoJSON LineString coords).
    """
    coords = f"{origin['lon']},{origin['lat']};{destination['lon']},{destination['lat']}"
    url = f"{OSRM_URL}/{coords}"
    params = {
        "overview": "full",
        "geometries": "geojson",
        "steps": "false",
    }
    resp = requests.get(url, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    if data.get("code") != "Ok" or not data.get("routes"):
        raise ValueError("OSRM could not find a route between the given locations.")

    route = data["routes"][0]
    distance_meters = route["distance"]
    duration_seconds = route["duration"]

    return {
        "distance_miles": distance_meters / 1609.344,
        "duration_hours": duration_seconds / 3600,
        "geometry": route["geometry"]["coordinates"],  # list of [lon, lat]
    }


def get_full_route(current: dict, pickup: dict, dropoff: dict) -> dict:
    """
    Get routes for the full trip: current -> pickup -> dropoff.
    Returns combined route info.
    """
    leg1 = get_route(current, pickup)
    leg2 = get_route(pickup, dropoff)

    # Combine geometry (avoid duplicating the shared point)
    combined_geometry = leg1["geometry"] + leg2["geometry"][1:]

    return {
        "leg1": leg1,
        "leg2": leg2,
        "total_distance_miles": leg1["distance_miles"] + leg2["distance_miles"],
        "total_driving_hours": leg1["duration_hours"] + leg2["duration_hours"],
        "geometry": combined_geometry,
    }
