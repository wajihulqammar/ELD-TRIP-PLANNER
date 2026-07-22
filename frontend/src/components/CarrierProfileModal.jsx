import React, { useState } from 'react';
import { User, Truck, Building, FileText, Check, Settings } from 'lucide-react';

export default function CarrierProfileModal({ driverInfo, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(driverInfo);

  const handleSave = (e) => {
    e.preventDefault();
    onSave(profile);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        onClick={() => setIsOpen(true)}
        style={{ gap: '6px' }}
      >
        <Settings size={14} /> Custom Carrier &amp; Driver Info
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div className="card-title-bar" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <h2>Carrier &amp; Driver Profile</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Driver Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.driver_name || ''}
                    onChange={(e) => setProfile({ ...profile, driver_name: e.target.value })}
                    placeholder="e.g. John Doe"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
                <div>
                  <label className="form-label">Carrier Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.carrier_name || ''}
                    onChange={(e) => setProfile({ ...profile, carrier_name: e.target.value })}
                    placeholder="e.g. Swift Logistics"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="form-label">Truck / Tractor #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.truck_number || ''}
                    onChange={(e) => setProfile({ ...profile, truck_number: e.target.value })}
                    placeholder="e.g. TK-8802"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
                <div>
                  <label className="form-label">Shipping Manifest #</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.shipping_manifest || ''}
                    onChange={(e) => setProfile({ ...profile, shipping_manifest: e.target.value })}
                    placeholder="e.g. MAN-9941"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label className="form-label">Main Office Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.main_office || ''}
                  onChange={(e) => setProfile({ ...profile, main_office: e.target.value })}
                  placeholder="e.g. 100 Logistics Way, Chicago, IL"
                  style={{ paddingLeft: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Home Terminal Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={profile.home_terminal || ''}
                  onChange={(e) => setProfile({ ...profile, home_terminal: e.target.value })}
                  placeholder="e.g. Terminal #4, St. Louis, MO"
                  style={{ paddingLeft: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto' }}
                >
                  <Check size={16} /> Apply to ELD Logs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
