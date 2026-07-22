import React, { useState } from 'react';
import LocationInput from './LocationInput';
import TripPresetsSlider from './TripPresetsSlider';
import { Navigation, ArrowRight, ShieldCheck } from 'lucide-react';

export default function TripForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    current_cycle_used: 0,
  });

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, current_cycle_used: parseFloat(form.current_cycle_used) });
  };

  const handleSelectPreset = (preset) => {
    setForm({
      current_location: preset.current_location,
      pickup_location: preset.pickup_location,
      dropoff_location: preset.dropoff_location,
      current_cycle_used: preset.current_cycle_used,
    });
  };

  const cycleVal = parseFloat(form.current_cycle_used) || 0;
  const canSubmit = form.current_location && form.pickup_location && form.dropoff_location;

  return (
    <div className="card">
      <div className="card-title-bar">
        <Navigation size={18} style={{ color: 'var(--primary)' }} />
        <h2>Trip Parameters</h2>
      </div>

      {/* Interactive Trip Preset Slider */}
      <TripPresetsSlider onSelectPreset={handleSelectPreset} />

      <form onSubmit={handleSubmit}>
        {/* Current Location with Auto-Detect GPS */}
        <LocationInput
          label="Current Location"
          value={form.current_location}
          onChange={(val) => handleChange('current_location', val)}
          placeholder="Type city or click 'Detect My Location'"
          disabled={loading}
          required
          showCurrentLocButton={true}
          iconColor="#4f46e5"
          id="input-current-location"
        />

        {/* Pickup Location */}
        <LocationInput
          label="Pickup Location"
          value={form.pickup_location}
          onChange={(val) => handleChange('pickup_location', val)}
          placeholder="Search pickup city or address..."
          disabled={loading}
          required
          iconColor="#059669"
          id="input-pickup-location"
        />

        {/* Dropoff Location */}
        <LocationInput
          label="Dropoff Location"
          value={form.dropoff_location}
          onChange={(val) => handleChange('dropoff_location', val)}
          placeholder="Search dropoff destination..."
          disabled={loading}
          required
          iconColor="#6366f1"
          id="input-dropoff-location"
        />

        {/* Cycle Slider */}
        <div className="form-field">
          <label className="form-label">Current Cycle Used (Hours)</label>
          <div className="slider-container">
            <div className="slider-header">
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>70-Hour / 8-Day Rule</span>
              <span className="slider-val">{cycleVal.toFixed(1)} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="0.5"
              value={form.current_cycle_used}
              onChange={(e) => handleChange('current_cycle_used', e.target.value)}
              disabled={loading}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>0h</span>
              <span>Available: {(70 - cycleVal).toFixed(1)}h</span>
              <span>70h</span>
            </div>
          </div>
        </div>

        {/* HOS Rule Note */}
        <div
          style={{
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '1.25rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>Applies 11h driving, 14h window, 30m break, 10h rest &amp; 1000mi fueling rules</span>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !canSubmit}
          id="btn-submit-trip"
        >
          {loading ? (
            <>
              <div className="spinner-sm" />
              Calculating Route &amp; Logs...
            </>
          ) : (
            <>
              Calculate Trip &amp; Generate Logs
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
