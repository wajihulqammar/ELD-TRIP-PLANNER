import React, { useEffect } from 'react';
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
  pickup: { color: '#059669', emoji: '📦', label: 'Pickup' },
  dropoff: { color: '#4f46e5', emoji: '🏁', label: 'Dropoff' },
  fuel: { color: '#d97706', emoji: '⛽', label: 'Fuel Stop' },
  rest_30min: { color: '#0284c7', emoji: '☕', label: '30-Min Break' },
  rest_10hr: { color: '#64748b', emoji: '🛌', label: '10-Hr Rest' },
};

function createCustomIcon(stopType) {
  const config = STOP_CONFIG[stopType] || STOP_CONFIG.start;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 46" width="36" height="46">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.25"/>
        </filter>
      </defs>
      <path d="M18 0 C8.06 0 0 8.06 0 18 C0 31.5 18 46 18 46 C18 46 36 31.5 36 18 C36 8.06 27.94 0 18 0Z" 
            fill="${config.color}" filter="url(#shadow)"/>
      <circle cx="18" cy="17" r="11" fill="white"/>
      <text x="18" y="22" text-anchor="middle" font-size="12" font-family="Arial">${config.emoji}</text>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -48],
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
  if (h === 0) return `${m}m into trip`;
  if (m === 0) return `${h}h into trip`;
  return `${h}h ${m}m into trip`;
}

export default function RouteMap({ tripData }) {
  if (!tripData) return null;

  const { route_geometry, stops, locations } = tripData;
  const polylineCoords = route_geometry.map(([lon, lat]) => [lat, lon]);
  const center = polylineCoords[Math.floor(polylineCoords.length / 2)] || [39.5, -98.35];

  return (
    <div className="map-card-wrapper">
      <div style={{ padding: '12px 16px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🗺️</span> Interactive Route Map
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
            {locations.current.display_name.split(',')[0]} → {locations.pickup.display_name.split(',')[0]} → {locations.dropoff.display_name.split(',')[0]}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {Object.entries(STOP_CONFIG).map(([type, cfg]) => {
            const count = stops.filter((s) => s.type === type).length;
            if (!count) return null;
            return (
              <span
                key={type}
                className="tag"
                style={{ fontSize: '0.72rem', padding: '2px 8px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155' }}
              >
                {cfg.emoji} {cfg.label}: {count}
              </span>
            );
          })}
        </div>
      </div>

      <div style={{ height: '460px', width: '100%', position: 'relative', background: '#e2e8f0' }}>
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '460px', width: '100%', background: '#e2e8f0' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          />

          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#4f46e5',
              weight: 5,
              opacity: 0.85,
            }}
          />

          {stops.map((stop, idx) => (
            <Marker
              key={`${stop.type}-${idx}`}
              position={[stop.lat, stop.lon]}
              icon={createCustomIcon(stop.type)}
            >
              <Popup>
                <div style={{ minWidth: '170px', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px' }}>
                    {STOP_CONFIG[stop.type]?.emoji} {stop.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '4px' }}>
                    {stop.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    ⏱ {hoursToLabel(stop.trip_hour)}
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
