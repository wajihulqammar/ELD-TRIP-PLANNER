import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STOP_CONFIG = {
  start: { color: '#3b82f6', emoji: '🚛', label: 'Start' },
  pickup: { color: '#10b981', emoji: '📦', label: 'Pickup' },
  dropoff: { color: '#8b5cf6', emoji: '🏁', label: 'Dropoff' },
  fuel: { color: '#f59e0b', emoji: '⛽', label: 'Fuel Stop' },
  rest_30min: { color: '#06b6d4', emoji: '☕', label: '30-Min Break' },
  rest_10hr: { color: '#64748b', emoji: '🛌', label: '10-Hr Rest' },
};

function createCustomIcon(stopType) {
  const config = STOP_CONFIG[stopType] || STOP_CONFIG.start;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${config.color}" flood-opacity="0.4"/>
      </filter>
      <path d="M20 0 C9 0 0 9 0 20 C0 35 20 50 20 50 C20 50 40 35 40 20 C40 9 31 0 20 0Z" 
            fill="${config.color}" filter="url(#shadow)"/>
      <circle cx="20" cy="20" r="12" fill="white" opacity="0.95"/>
      <text x="20" y="26" text-anchor="middle" font-size="13" font-family="Arial">${config.emoji}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [40, 50],
    iconAnchor: [20, 50],
    popupAnchor: [0, -52],
    className: '',
  });
}

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords.map(([lon, lat]) => [lat, lon]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [coords, map]);
  return null;
}

function hoursToLabel(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}min into trip`;
  if (m === 0) return `${h}h into trip`;
  return `${h}h ${m}min into trip`;
}

export default function RouteMap({ tripData }) {
  if (!tripData) return null;

  const { route_geometry, stops, locations, summary } = tripData;

  // Convert [lon, lat] -> [lat, lon] for Leaflet
  const polylineCoords = route_geometry.map(([lon, lat]) => [lat, lon]);

  const center = polylineCoords[Math.floor(polylineCoords.length / 2)] || [39.5, -98.35];

  return (
    <div className="map-container fade-in">
      <div className="card-header" style={{ padding: '1rem 1.25rem 0', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 0 0.75rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🗺️</span>
          <div>
            <div className="card-title">Route Map</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {locations.current.display_name.split(',').slice(0, 2).join(',')} →{' '}
              {locations.pickup.display_name.split(',').slice(0, 2).join(',')} →{' '}
              {locations.dropoff.display_name.split(',').slice(0, 2).join(',')}
            </div>
          </div>
        </div>

        {/* Route legend */}
        <div className="route-info" style={{ padding: '0 0 0.75rem' }}>
          {Object.entries(STOP_CONFIG).map(([type, cfg]) => {
            const count = stops.filter(s => s.type === type).length;
            if (!count) return null;
            return (
              <div key={type} className="route-pill">
                <span>{cfg.emoji}</span>
                <span>{cfg.label}: {count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%', background: '#1a2035' }}
          zoomControl={true}
          id="trip-route-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          />

          {/* Route polyline */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.85,
              dashArray: null,
            }}
          />

          {/* Stop markers */}
          {stops.map((stop, idx) => (
            <Marker
              key={`${stop.type}-${idx}`}
              position={[stop.lat, stop.lon]}
              icon={createCustomIcon(stop.type)}
            >
              <Popup>
                <div style={{ minWidth: '180px', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px' }}>
                    {STOP_CONFIG[stop.type]?.emoji} {stop.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#666', marginBottom: '4px' }}>
                    {stop.description}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#999' }}>
                    ⏱ {hoursToLabel(stop.trip_hour)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#999' }}>
                    📍 {stop.lat.toFixed(4)}°, {stop.lon.toFixed(4)}°
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          <FitBounds coords={route_geometry} />
        </MapContainer>
      </div>
    </div>
  );
}
