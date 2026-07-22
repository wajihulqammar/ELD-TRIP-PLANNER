import React, { useState } from 'react';
import './index.css';
import TripForm from './components/TripForm';
import RouteMap from './components/RouteMap';
import TripTimeline from './components/TripTimeline';
import LogSheetViewer from './components/LogSheetViewer';
import { planTrip } from './api';
import {
  Map,
  FileText,
  List,
  AlertCircle,
  Truck,
  Compass,
  MapPin,
  Clock,
  Printer,
} from 'lucide-react';

export default function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setTripData(null);

    try {
      const data = await planTrip(formData);
      setTripData(data);
      setActiveTab('map');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'An error occurred. Please check your inputs and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const summary = tripData?.summary;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header" role="banner">
        <div className="header-logo">
          <div className="logo-icon">
            <Truck size={22} />
          </div>
          <div>
            <div className="logo-text">ELD HOS Planner</div>
            <div className="logo-subtitle">FMCSA 70-Hour / 8-Day Rule</div>
          </div>
        </div>
        <div className="header-badge">
          Property Carrier Compliance
        </div>
      </header>

      {/* Page Banner */}
      <div className="page-banner">
        <div className="banner-content">
          <h1 className="page-title">Trip Planner &amp; ELD Log Sheet Generator</h1>
          <p className="page-description">
            Calculate optimized routes and auto-generate FMCSA-compliant 24-hour Daily Log Sheets with mandatory 11h driving, 14h window, 30m break, 10h rest, and 1,000mi fueling stops.
          </p>
          <div className="rule-tags">
            <span className="tag primary">11h Max Driving</span>
            <span className="tag primary">14h Duty Window</span>
            <span className="tag success">30m Mandatory Break</span>
            <span className="tag success">10h Daily Rest</span>
            <span className="tag">1,000mi Fueling</span>
            <span className="tag">70h / 8-Day Cycle</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content" role="main">
        <div className="dashboard-grid">
          {/* Left: Input Form */}
          <div>
            <TripForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Right: Output / Results Panel */}
          <div>
            {/* Loading State */}
            {loading && (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <div className="spinner-sm" style={{ width: 32, height: 32, borderColor: 'var(--border-strong)', borderTopColor: 'var(--primary)', margin: '0 auto 1rem' }} />
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Calculating Route &amp; HOS Daily Logs...
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Fetching OpenStreetMap route geometry &amp; computing FMCSA 70-hr compliance schedule
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="card" style={{ borderLeft: '4px solid var(--danger)', background: 'var(--danger-light)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <AlertCircle size={20} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.95rem' }}>
                      Calculation Error
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Interactive Feature Highlights Empty State */}
            {!loading && !error && !tripData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Feature Highlight Banner */}
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      <Compass size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                        Ready to Plan Your Trip
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Select a sample route from the slider or use GPS auto-detect to generate your trip plan
                      </p>
                    </div>
                  </div>

                  {/* 3 Feature Cards Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      marginTop: '1.5rem',
                    }}
                  >
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ color: '#4f46e5', marginBottom: '8px' }}>
                        <MapPin size={20} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px' }}>
                        1. Interactive Route Map
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        Displays complete driving polyline with pickup, dropoff, fuel, and mandatory rest stop markers.
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ color: '#059669', marginBottom: '8px' }}>
                        <Clock size={20} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px' }}>
                        2. FMCSA HOS Engine
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        Enforces 11h driving, 14h window, 30m break, 10h daily rest, and 1,000mi fueling schedules.
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ color: '#d97706', marginBottom: '8px' }}>
                        <Printer size={20} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '4px' }}>
                        3. Print &amp; PDF Logs
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        Auto-generates 24-hour paper-log format grid sheets ready to export as high-res PDF or print.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {tripData && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Metrics Summary */}
                <div className="stats-row">
                  <div className="stat-box">
                    <div className="stat-box-label">Total Distance</div>
                    <div className="stat-box-num">{tripData.total_distance_miles.toFixed(0)}</div>
                    <div className="stat-box-sub">miles</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-label">Trip Duration</div>
                    <div className="stat-box-num">{tripData.total_trip_hours.toFixed(1)}</div>
                    <div className="stat-box-sub">hours total</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-label">Driving Time</div>
                    <div className="stat-box-num" style={{ color: 'var(--success)' }}>
                      {summary.total_driving_hours.toFixed(1)}
                    </div>
                    <div className="stat-box-sub">actual driving</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-label">Daily Logs</div>
                    <div className="stat-box-num" style={{ color: 'var(--primary)' }}>
                      {tripData.daily_logs.length}
                    </div>
                    <div className="stat-box-sub">sheets generated</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-box-label">Cycle End</div>
                    <div className="stat-box-num" style={{ fontSize: '1.25rem' }}>
                      {summary.cycle_hours_used_at_end.toFixed(1)}h
                    </div>
                    <div className="stat-box-sub">of 70h used</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="segmented-tabs" role="tablist">
                  <button
                    className={`tab-item ${activeTab === 'map' ? 'active' : ''}`}
                    onClick={() => setActiveTab('map')}
                  >
                    <Compass size={15} /> Route Map
                  </button>
                  <button
                    className={`tab-item ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                  >
                    <List size={15} /> Itinerary Timeline
                  </button>
                  <button
                    className={`tab-item ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                  >
                    <FileText size={15} /> ELD Daily Logs ({tripData.daily_logs.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'map' && <RouteMap tripData={tripData} />}
                  {activeTab === 'timeline' && <TripTimeline stops={tripData.stops} summary={summary} />}
                  {activeTab === 'logs' && (
                    <LogSheetViewer dailyLogs={tripData.daily_logs} tripData={tripData} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="footer" role="contentinfo">
        <div>
          ELD HOS Planner · Property Carrying Driver Regulations (FMCSA 49 CFR Part 395) · 70-Hour / 8-Day Rule
        </div>
      </footer>
    </div>
  );
}
