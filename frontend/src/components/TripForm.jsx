import React, { useState } from 'react';
import { MapPin, Navigation, Package, Gauge, Clock, Truck, Info } from 'lucide-react';

const EXAMPLE_TRIPS = [
  {
    label: 'Chicago → Dallas (Long haul)',
    current_location: 'Chicago, IL',
    pickup_location: 'St. Louis, MO',
    dropoff_location: 'Dallas, TX',
    current_cycle_used: 20,
  },
  {
    label: 'NYC → Boston (Short)',
    current_location: 'New York, NY',
    pickup_location: 'Hartford, CT',
    dropoff_location: 'Boston, MA',
    current_cycle_used: 5,
  },
  {
    label: 'LA → Seattle (Multi-day)',
    current_location: 'Los Angeles, CA',
    pickup_location: 'Sacramento, CA',
    dropoff_location: 'Seattle, WA',
    current_cycle_used: 35,
  },
];

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: 0,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, current_cycle_used: parseFloat(form.current_cycle_used) });
  };

  const loadExample = (example) => {
    setForm({
      current_location: example.current_location,
      pickup_location: example.pickup_location,
      dropoff_location: example.dropoff_location,
      current_cycle_used: example.current_cycle_used,
    });
  };

  const cycleVal = parseFloat(form.current_cycle_used) || 0;
  const cycleClass =
    cycleVal >= 60 ? 'danger' : cycleVal >= 45 ? 'caution' : 'safe';
  const cycleWarning =
    cycleVal >= 60
      ? '⚠️ High cycle usage — 34-hr restart may be required mid-trip'
      : cycleVal >= 45
      ? '⚡ Approaching cycle limit — monitor driving hours closely'
      : '✅ Cycle hours within normal range';

  const canSubmit =
    form.current_location && form.pickup_location && form.dropoff_location;

  return (
    <div className="card slide-in-left">
      <div className="card-header">
        <div className="card-icon blue">
          <Truck size={18} color="#3b82f6" />
        </div>
        <div>
          <div className="card-title">Trip Planner</div>
        </div>
      </div>

      {/* Quick Examples */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div className="form-label" style={{ marginBottom: '8px' }}>
          Quick Examples
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {EXAMPLE_TRIPS.map((ex) => (
            <button
              key={ex.label}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', textAlign: 'left', fontSize: '0.78rem' }}
              onClick={() => loadExample(ex)}
              type="button"
            >
              <Navigation size={13} />
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Current Location */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Navigation size={12} />
              Current Location
            </span>
          </label>
          <div className="form-input-with-icon">
            <MapPin size={16} className="input-icon" />
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Chicago, IL"
              value={form.current_location}
              onChange={(e) => handleChange('current_location', e.target.value)}
              disabled={loading}
              required
              id="input-current-location"
            />
          </div>
        </div>

        {/* Pickup Location */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Package size={12} />
              Pickup Location
            </span>
          </label>
          <div className="form-input-with-icon">
            <MapPin size={16} className="input-icon" style={{ color: '#10b981' }} />
            <input
              className="form-input"
              type="text"
              placeholder="e.g. St. Louis, MO"
              value={form.pickup_location}
              onChange={(e) => handleChange('pickup_location', e.target.value)}
              disabled={loading}
              required
              id="input-pickup-location"
            />
          </div>
        </div>

        {/* Dropoff Location */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={12} />
              Dropoff Location
            </span>
          </label>
          <div className="form-input-with-icon">
            <MapPin size={16} className="input-icon" style={{ color: '#8b5cf6' }} />
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Dallas, TX"
              value={form.dropoff_location}
              onChange={(e) => handleChange('dropoff_location', e.target.value)}
              disabled={loading}
              required
              id="input-dropoff-location"
            />
          </div>
        </div>

        {/* Current Cycle Used */}
        <div className="form-group">
          <div className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={12} />
              Current Cycle Used (Hrs)
            </div>
          </div>
          <div className="slider-group">
            <div className="slider-header">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                0 hrs
              </span>
              <span className={`slider-value ${cycleClass}`}>
                {cycleVal.toFixed(1)} / 70 hrs
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                70 hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="0.5"
              value={form.current_cycle_used}
              onChange={(e) => handleChange('current_cycle_used', e.target.value)}
              disabled={loading}
              id="slider-cycle-used"
            />
            {/* Cycle bar fill */}
            <div
              style={{
                height: '4px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '-4px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(cycleVal / 70) * 100}%`,
                  background:
                    cycleVal >= 60
                      ? 'var(--accent-red)'
                      : cycleVal >= 45
                      ? 'var(--accent-orange)'
                      : 'var(--accent-green)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <input
                className="form-input"
                type="number"
                min="0"
                max="70"
                step="0.5"
                value={form.current_cycle_used}
                onChange={(e) => handleChange('current_cycle_used', e.target.value)}
                disabled={loading}
                style={{ width: '90px', textAlign: 'center', padding: '8px' }}
                id="input-cycle-used"
              />
              <div className={`cycle-warning ${cycleClass}`} style={{ flex: 1 }}>
                {cycleWarning}
              </div>
            </div>
          </div>
        </div>

        {/* HOS Rules Info */}
        <div
          style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '1.25rem',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--accent-blue)' }}>
            <Info size={13} />
            <strong>FMCSA HOS Rules Applied (70-Hr/8-Day)</strong>
          </div>
          <ul style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <li>11-Hour driving limit per shift</li>
            <li>14-Hour duty window per shift</li>
            <li>30-Min break after 8 cumulative driving hrs</li>
            <li>10-Hour mandatory rest between shifts</li>
            <li>Fueling stop every 1,000 miles (30 min)</li>
            <li>1 hour for pickup &amp; 1 hour for dropoff</li>
          </ul>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !canSubmit}
          id="btn-plan-trip"
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Calculating Route...
            </>
          ) : (
            <>
              <Gauge size={18} />
              Plan My Trip
            </>
          )}
        </button>
      </form>
    </div>
  );
}
