import React from 'react';
import { Clock, Navigation, MapPin, Package, Fuel, Coffee, Bed, Flag } from 'lucide-react';

const STOP_CONFIG = {
  start: { icon: <Navigation size={15} />, color: '#3b82f6', bg: '#eff6ff', label: 'Trip Start' },
  pickup: { icon: <Package size={15} />, color: '#059669', bg: '#ecfdf5', label: 'Pickup' },
  dropoff: { icon: <Flag size={15} />, color: '#4f46e5', bg: '#e0e7ff', label: 'Dropoff' },
  fuel: { icon: <Fuel size={15} />, color: '#d97706', bg: '#fffbeb', label: 'Fuel Stop' },
  rest_30min: { icon: <Coffee size={15} />, color: '#0284c7', bg: '#f0f9ff', label: '30-Min Break' },
  rest_10hr: { icon: <Bed size={15} />, color: '#64748b', bg: '#f8fafc', label: '10-Hr Rest' },
};

function hoursToTime(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm} (Day ${Math.floor(hours / 24) + 1})`;
}

export default function TripTimeline({ stops, summary }) {
  if (!stops || stops.length === 0) return null;

  return (
    <div className="card">
      <div className="card-title-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} />
          <h2>Trip Itinerary &amp; Timeline</h2>
        </div>
        <span className="tag" style={{ fontSize: '0.75rem' }}>
          {stops.length} Stops · {summary.num_days} Day(s)
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {stops.map((stop, idx) => {
          const cfg = STOP_CONFIG[stop.type] || STOP_CONFIG.start;
          const isLast = idx === stops.length - 1;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '14px',
                position: 'relative',
                paddingBottom: isLast ? '0px' : '16px',
              }}
            >
              {/* Vertical Connecting Line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '17px',
                    top: '34px',
                    bottom: '0px',
                    width: '2px',
                    background: '#e2e8f0',
                    zIndex: 1,
                  }}
                />
              )}

              {/* Round Icon Badge */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: cfg.bg,
                  border: `1.5px solid ${cfg.color}`,
                  color: cfg.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 2,
                }}
              >
                {cfg.icon}
              </div>

              {/* Details Content */}
              <div style={{ flex: 1, paddingTop: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: cfg.color }}>
                    {stop.name}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    ⏱ {hoursToTime(stop.trip_hour)}
                  </span>
                </div>

                <div style={{ fontSize: '0.83rem', color: '#334155', marginTop: '2px', lineHeight: 1.4 }}>
                  {stop.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div
        style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4f46e5', fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.num_fuel_stops}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fuel Stops</div>
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0284c7', fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.num_rest_stops}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rest Stops</div>
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.num_days}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Days Total</div>
        </div>
      </div>
    </div>
  );
}
