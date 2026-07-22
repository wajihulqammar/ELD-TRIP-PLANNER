import React from 'react';

const STOP_ICONS = {
  start: { emoji: '🚛', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Trip Start' },
  pickup: { emoji: '📦', color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Pickup' },
  dropoff: { emoji: '🏁', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Dropoff' },
  fuel: { emoji: '⛽', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Fuel Stop' },
  rest_30min: { emoji: '☕', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', label: '30-Min Break' },
  rest_10hr: { emoji: '🛌', color: '#64748b', bg: 'rgba(100,116,139,0.15)', label: '10-Hr Rest' },
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
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-icon orange">
          <span style={{ fontSize: '16px' }}>📋</span>
        </div>
        <div>
          <div className="card-title">Trip Timeline</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {stops.length} stops over {summary.num_days} day{summary.num_days !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="timeline">
        {stops.map((stop, idx) => {
          const cfg = STOP_ICONS[stop.type] || STOP_ICONS.start;
          return (
            <div key={idx} className="timeline-item">
              <div
                className={`timeline-dot ${stop.type}`}
                style={{
                  background: cfg.bg,
                  border: `2px solid ${cfg.color}`,
                }}
              >
                <span style={{ fontSize: '14px' }}>{cfg.emoji}</span>
              </div>
              <div className="timeline-content">
                <div className="timeline-name" style={{ color: cfg.color }}>
                  {stop.name}
                </div>
                <div className="timeline-desc">{stop.description}</div>
                <div className="timeline-time">
                  ⏱ {hoursToTime(stop.trip_hour)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div
        style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-green)', fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.num_fuel_stops}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Fuel Stops</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.num_rest_stops}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rest Stops</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-orange)', fontFamily: 'JetBrains Mono, monospace' }}>
            {summary.num_days}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Days</div>
        </div>
      </div>
    </div>
  );
}
