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
  AlertTriangle,
  Truck,
  Route,
  Clock,
  Fuel,
} from 'lucide-react';

const LOADING_STEPS = [
  'Geocoding locations...',
  'Fetching route from OpenStreetMap...',
  'Running HOS calculation engine...',
  'Generating ELD log sheets...',
];

export default function App() {
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [loadingStep, setLoadingStep] = useState(0);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setTripData(null);
    setLoadingStep(0);

    // Animate loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 1200);

    try {
      const data = await planTrip(formData);
      setTripData(data);
      setActiveTab('map');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'An unexpected error occurred. Please check your inputs and try again.';
      setError(msg);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const summary = tripData?.summary;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header" role="banner">
        <div className="header-logo">
          <div className="logo-icon">🚛</div>
          <div>
            <div className="logo-text">ELD Planner</div>
            <div className="logo-subtitle">FMCSA Compliant · 70-Hr/8-Day Rule</div>
          </div>
        </div>
        <div className="header-badge">Property Carrier · HOS 2022</div>
      </header>

      {/* Hero */}
      <section className="hero" aria-label="App introduction">
        <h1 className="hero-title">
          <span className="highlight">ELD Trip Planner</span>
          <br />& Daily Log Generator
        </h1>
        <p className="hero-subtitle">
          Enter your trip details and get an interactive route map with FMCSA-compliant
          Hours of Service daily log sheets — automatically calculated and ready to print.
        </p>
        <div className="hero-badges">
          <div className="badge green">✅ 11-Hr Driving Limit</div>
          <div className="badge orange">⏰ 14-Hr Duty Window</div>
          <div className="badge">☕ 30-Min Break Rule</div>
          <div className="badge purple">🛌 10-Hr Rest Required</div>
          <div className="badge">⛽ Auto Fueling Stops</div>
          <div className="badge green">📋 70-Hr Cycle Tracking</div>
        </div>
      </section>

      {/* Main */}
      <main className="main-content" role="main">
        <div className="content-grid">
          {/* Left: Form */}
          <div>
            <TripForm onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Right: Results */}
          <div className="right-panel">
            {/* Loading state */}
            {loading && (
              <div className="card loading-state">
                <div className="spinner" />
                <div className="loading-text">Planning your trip...</div>
                <div className="loading-steps">
                  {LOADING_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`loading-step ${
                        i < loadingStep ? 'done' : i === loadingStep ? 'active' : ''
                      }`}
                    >
                      <div className="step-dot" />
                      {i < loadingStep ? '✓ ' : ''}{step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="error-state fade-in">
                <div className="error-icon">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="error-title">Error Planning Trip</div>
                  <div className="error-msg">{error}</div>
                </div>
              </div>
            )}

            {/* Welcome state */}
            {!loading && !error && !tripData && (
              <div className="card welcome-state">
                <div className="welcome-icon">🗺️</div>
                <div className="welcome-title">Ready to Plan Your Trip</div>
                <div className="welcome-text">
                  Fill in your current location, pickup, and dropoff points on the left.
                  We'll calculate your FMCSA-compliant route and generate all required ELD log sheets.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem', width: '100%', maxWidth: '320px' }}>
                  {[
                    { icon: <Route size={16} />, text: 'Interactive route map with stop markers' },
                    { icon: <FileText size={16} />, text: 'Day-by-day ELD daily log sheets' },
                    { icon: <Clock size={16} />, text: 'HOS-compliant trip timeline' },
                    { icon: <Fuel size={16} />, text: 'Auto-scheduled fuel & rest stops' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span style={{ color: 'var(--accent-blue)' }}>{item.icon}</span>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {tripData && !loading && (
              <div className="fade-in">
                {/* Summary Stats */}
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="stat-card">
                    <div className="stat-label">Total Distance</div>
                    <div className="stat-value blue">{tripData.total_distance_miles.toFixed(0)}</div>
                    <div className="stat-sub">miles</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Trip Duration</div>
                    <div className="stat-value cyan">{tripData.total_trip_hours.toFixed(1)}</div>
                    <div className="stat-sub">total hours</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Driving Hours</div>
                    <div className="stat-value green">{summary.total_driving_hours.toFixed(1)}</div>
                    <div className="stat-sub">actual driving</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Log Sheets</div>
                    <div className="stat-value orange">{tripData.daily_logs.length}</div>
                    <div className="stat-sub">days generated</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Fuel Stops</div>
                    <div className="stat-value">{summary.num_fuel_stops}</div>
                    <div className="stat-sub">scheduled</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Cycle Used</div>
                    <div className={`stat-value ${summary.cycle_hours_used_at_end >= 60 ? 'orange' : 'green'}`}>
                      {summary.cycle_hours_used_at_end.toFixed(1)}
                    </div>
                    <div className="stat-sub">/ 70 hrs</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="results-tabs" role="tablist">
                  <button
                    className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
                    onClick={() => setActiveTab('map')}
                    role="tab"
                    id="tab-map"
                    aria-selected={activeTab === 'map'}
                  >
                    <Map size={15} /> Route Map
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
                    onClick={() => setActiveTab('timeline')}
                    role="tab"
                    id="tab-timeline"
                    aria-selected={activeTab === 'timeline'}
                  >
                    <List size={15} /> Timeline
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                    role="tab"
                    id="tab-logs"
                    aria-selected={activeTab === 'logs'}
                  >
                    <FileText size={15} /> ELD Logs
                    <span
                      style={{
                        background: 'var(--accent-blue)',
                        color: 'white',
                        borderRadius: '10px',
                        padding: '1px 6px',
                        fontSize: '0.7rem',
                        marginLeft: '2px',
                      }}
                    >
                      {tripData.daily_logs.length}
                    </span>
                  </button>
                </div>

                {/* Tab content */}
                <div style={{ marginTop: '1rem' }}>
                  {activeTab === 'map' && (
                    <RouteMap tripData={tripData} />
                  )}
                  {activeTab === 'timeline' && (
                    <TripTimeline stops={tripData.stops} summary={summary} />
                  )}
                  {activeTab === 'logs' && (
                    <LogSheetViewer
                      dailyLogs={tripData.daily_logs}
                      tripData={tripData}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <p>
          ELD Planner — Built per FMCSA HOS Regulations (49 CFR Part 395) · 70-Hour/8-Day Property Carrier Rule · April 2022
        </p>
        <p style={{ marginTop: '4px', opacity: 0.6 }}>
          For assessment purposes. Not a substitute for official ELD hardware.
        </p>
      </footer>
    </div>
  );
}
