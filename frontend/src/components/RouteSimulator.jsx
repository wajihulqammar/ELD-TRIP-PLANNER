import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Truck, Navigation, Gauge } from 'lucide-react';

export default function RouteSimulator({ tripData, onSimulateStep }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const timerRef = useRef(null);

  if (!tripData) return null;

  const totalMiles = tripData.total_distance_miles;
  const currentMiles = (progress / 100) * totalMiles;
  const currentHour = (progress / 100) * tripData.total_trip_hours;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 150);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="card">
      <div className="card-title-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} style={{ color: 'var(--primary)' }} />
          <h2>Interactive Trip Simulator</h2>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`btn btn-sm ${isPlaying ? 'btn-outline' : 'btn-primary'}`}
            style={{ width: 'auto', padding: '5px 12px' }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Simulate Drive</>}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleReset}
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '6px' }}>
          <span>Departure</span>
          <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
            {currentMiles.toFixed(0)} / {totalMiles.toFixed(0)} miles ({progress}%)
          </span>
          <span>Destination</span>
        </div>

        <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: '#4f46e5',
              borderRadius: '4px',
              transition: 'width 0.15s linear',
            }}
          />
        </div>
      </div>

      {/* Realtime Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Simulated Speed</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
            {isPlaying ? '60 mph' : '0 mph'}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Elapsed Time</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4f46e5', fontFamily: 'JetBrains Mono, monospace' }}>
            {currentHour.toFixed(1)} hrs
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Driver Status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
            {isPlaying ? 'DRIVING' : progress === 100 ? 'ARRIVED' : 'STOPPED'}
          </div>
        </div>
      </div>
    </div>
  );
}
