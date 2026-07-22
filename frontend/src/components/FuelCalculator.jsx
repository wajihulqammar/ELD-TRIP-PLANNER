import React, { useState } from 'react';
import { Fuel, DollarSign, Gauge, Calculator, Info } from 'lucide-react';

export default function FuelCalculator({ totalMiles }) {
  const [mpg, setMpg] = useState(6.5);
  const [pricePerGallon, setPricePerGallon] = useState(3.85);

  if (!totalMiles || totalMiles <= 0) return null;

  const totalGallons = totalMiles / (mpg || 6.5);
  const totalCost = totalGallons * (pricePerGallon || 3.85);
  const costPerMile = totalCost / totalMiles;

  return (
    <div className="card">
      <div className="card-title-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Fuel size={18} style={{ color: '#d97706' }} />
          <h2>Fuel Consumption &amp; Cost Estimator</h2>
        </div>
        <span className="tag" style={{ fontSize: '0.75rem' }}>
          Semi-Truck Class 8
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
        {/* MPG Input */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>
            Average Truck MPG
          </label>
          <div className="input-wrapper">
            <Gauge size={15} className="input-icon" />
            <input
              type="number"
              step="0.1"
              min="3"
              max="15"
              className="form-input"
              value={mpg}
              onChange={(e) => setMpg(parseFloat(e.target.value) || 6.5)}
              style={{ paddingLeft: '34px' }}
            />
          </div>
        </div>

        {/* Diesel Price Input */}
        <div>
          <label className="form-label" style={{ fontSize: '0.75rem' }}>
            Diesel Price ($ / Gal)
          </label>
          <div className="input-wrapper">
            <DollarSign size={15} className="input-icon" />
            <input
              type="number"
              step="0.05"
              min="1"
              max="10"
              className="form-input"
              value={pricePerGallon}
              onChange={(e) => setPricePerGallon(parseFloat(e.target.value) || 3.85)}
              style={{ paddingLeft: '34px' }}
            />
          </div>
        </div>
      </div>

      {/* Calculated Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Gallons Needed
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
            {totalGallons.toFixed(1)} gal
          </div>
        </div>

        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>
            Est. Fuel Cost
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
            ${totalCost.toFixed(2)}
          </div>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Cost per Mile
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#4f46e5', fontFamily: 'JetBrains Mono, monospace' }}>
            ${costPerMile.toFixed(2)}/mi
          </div>
        </div>
      </div>
    </div>
  );
}
