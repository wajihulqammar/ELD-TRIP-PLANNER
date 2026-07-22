# ELD Trip Planner — FMCSA HOS Daily Log Generator

A full-stack web application for FMCSA-compliant Hours of Service trip planning and ELD daily log generation.

## Quick Start

### Backend (Django)
```bash
# From project root (working folder)
python manage.py runserver 8000
```

### Frontend (React/Vite)
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

## Project Structure
```
working folder/
├── manage.py              # Django manage
├── backend/               # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── hos_api/               # Django HOS API app
│   ├── views.py           # REST endpoints
│   ├── urls.py
│   └── services/
│       ├── routing.py     # Nominatim geocoding + OSRM routing
│       └── hos_engine.py  # Full FMCSA HOS calculation engine
├── requirements.txt
├── Procfile               # Railway deployment
└── frontend/              # React + Vite app
    ├── src/
    │   ├── App.jsx        # Main layout + tabs
    │   ├── api.js         # Axios client
    │   ├── index.css      # Design system
    │   └── components/
    │       ├── TripForm.jsx        # Input form
    │       ├── RouteMap.jsx        # Leaflet map
    │       ├── TripTimeline.jsx    # Stop timeline
    │       ├── LogSheet.jsx        # Canvas ELD grid
    │       └── LogSheetViewer.jsx  # Multi-day viewer + PDF export
    └── vercel.json        # Vercel deployment config
```

## HOS Rules Implemented
- **11-Hour Driving Limit**: Max 11h driving per shift
- **14-Hour Duty Window**: 14h window from shift start
- **30-Minute Rest Break**: After 8 cumulative driving hours
- **10-Hour Rest**: Between daily shifts
- **70-Hour/8-Day Cycle**: Rolling cycle tracking
- **Fueling**: Every 1,000 miles (30-min stop)
- **Pickup**: 1-hour on-duty at pickup
- **Dropoff**: 1-hour on-duty at dropoff

## API Endpoints
- `GET /api/health/` — Health check
- `POST /api/plan-trip/` — Trip planning

```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "St. Louis, MO",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 20.0
}
```

## Deployment

### Backend → Railway
1. Push to GitHub
2. Connect Railway to your repo
3. Railway auto-detects `Procfile` and `requirements.txt`

### Frontend → Vercel
1. Set Root Directory to `frontend`
2. Set `VITE_API_URL` to your Railway backend URL
3. Build command: `npm run build`, Output: `dist`
