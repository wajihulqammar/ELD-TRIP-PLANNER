import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services.routing import geocode_location, get_full_route
from .services.hos_engine import calculate_trip


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    return JsonResponse({"status": "ok", "message": "ELD HOS Planner API is running."})


@csrf_exempt
@require_http_methods(["POST"])
def plan_trip(request):
    """
    POST /api/plan-trip/
    Body (JSON):
      {
        "current_location": "Chicago, IL",
        "pickup_location": "St. Louis, MO",
        "dropoff_location": "Dallas, TX",
        "current_cycle_used": 20.0
      }

    Returns:
      {
        "stops": [...],
        "daily_logs": [...],
        "total_trip_hours": ...,
        "total_distance_miles": ...,
        "summary": {...},
        "route_geometry": [...],
        "locations": {
          "current": {"lat": ..., "lon": ..., "display_name": ...},
          "pickup": {...},
          "dropoff": {...}
        }
      }
    """
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    current_location = body.get("current_location", "").strip()
    pickup_location = body.get("pickup_location", "").strip()
    dropoff_location = body.get("dropoff_location", "").strip()

    try:
        current_cycle_used = float(body.get("current_cycle_used", 0))
    except (ValueError, TypeError):
        current_cycle_used = 0.0

    if not all([current_location, pickup_location, dropoff_location]):
        return JsonResponse(
            {"error": "Please provide current_location, pickup_location, and dropoff_location."},
            status=400
        )

    if current_cycle_used < 0 or current_cycle_used > 70:
        return JsonResponse(
            {"error": "current_cycle_used must be between 0 and 70 hours."},
            status=400
        )

    # Geocode all three locations
    try:
        current_geo = geocode_location(current_location)
        pickup_geo = geocode_location(pickup_location)
        dropoff_geo = geocode_location(dropoff_location)
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Geocoding failed: {str(e)}"}, status=500)

    # Get route
    try:
        route_info = get_full_route(
            {"lat": current_geo["lat"], "lon": current_geo["lon"]},
            {"lat": pickup_geo["lat"], "lon": pickup_geo["lon"]},
            {"lat": dropoff_geo["lat"], "lon": dropoff_geo["lon"]},
        )
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Routing failed: {str(e)}"}, status=500)

    # Run HOS engine
    try:
        trip_result = calculate_trip(
            current_location=current_geo["display_name"],
            pickup_location=pickup_geo["display_name"],
            dropoff_location=dropoff_geo["display_name"],
            current_cycle_used=current_cycle_used,
            route_info=route_info,
            current_coords=(current_geo["lat"], current_geo["lon"]),
            pickup_coords=(pickup_geo["lat"], pickup_geo["lon"]),
            dropoff_coords=(dropoff_geo["lat"], dropoff_geo["lon"]),
        )
    except Exception as e:
        return JsonResponse({"error": f"HOS calculation failed: {str(e)}"}, status=500)

    result = {
        **trip_result,
        "locations": {
            "current": current_geo,
            "pickup": pickup_geo,
            "dropoff": dropoff_geo,
        }
    }

    return JsonResponse(result)
