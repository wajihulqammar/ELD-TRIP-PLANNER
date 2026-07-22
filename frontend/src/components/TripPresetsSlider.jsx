import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Navigation, Clock, Route, ArrowRight } from 'lucide-react';

const PRESET_TRIPS = [
  {
    id: 1,
    title: 'Chicago → Dallas',
    tag: 'Long Haul',
    tagColor: '#4f46e5',
    distance: '925 mi',
    estTime: '~17h driving',
    current_location: 'Chicago, IL',
    pickup_location: 'St. Louis, MO',
    dropoff_location: 'Dallas, TX',
    current_cycle_used: 20,
    desc: 'Passes through Illinois, Missouri, Oklahoma & Texas',
  },
  {
    id: 2,
    title: 'NYC → Boston',
    tag: 'Short Regional',
    tagColor: '#059669',
    distance: '215 mi',
    estTime: '~4.5h driving',
    current_location: 'New York, NY',
    pickup_location: 'Hartford, CT',
    dropoff_location: 'Boston, MA',
    current_cycle_used: 5,
    desc: 'Quick East Coast regional corridor route',
  },
  {
    id: 3,
    title: 'LA → Seattle',
    tag: 'Multi-Day Interstate',
    tagColor: '#d97706',
    distance: '1,135 mi',
    estTime: '~21.5h driving',
    current_location: 'Los Angeles, CA',
    pickup_location: 'Sacramento, CA',
    dropoff_location: 'Seattle, WA',
    current_cycle_used: 35,
    desc: 'West Coast corridor requiring fueling & 10h rest stops',
  },
  {
    id: 4,
    title: 'Miami → Atlanta',
    tag: 'Southeast Corridor',
    tagColor: '#0284c7',
    distance: '660 mi',
    estTime: '~11h driving',
    current_location: 'Miami, FL',
    pickup_location: 'Orlando, FL',
    dropoff_location: 'Atlanta, GA',
    current_cycle_used: 15,
    desc: 'Florida to Georgia I-75 Northbound freight route',
  },
];

export default function TripPresetsSlider({ onSelectPreset }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? PRESET_TRIPS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === PRESET_TRIPS.length - 1 ? 0 : prev + 1));
  };

  const trip = PRESET_TRIPS[currentIndex];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Navigation size={14} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Sample Routes Slider
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={prevSlide}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, padding: '0 4px', fontFamily: 'JetBrains Mono, monospace' }}>
            {currentIndex + 1}/{PRESET_TRIPS.length}
          </span>
          <button
            type="button"
            onClick={nextSlide}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Slide Card */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
            {trip.title}
          </span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              background: `${trip.tagColor}15`,
              color: trip.tagColor,
            }}
          >
            {trip.tag}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: '#475569', marginBottom: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Route size={12} style={{ color: 'var(--primary)' }} /> {trip.distance}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} style={{ color: 'var(--success)' }} /> {trip.estTime}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>
          {trip.desc}
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{
            width: '100%',
            justifyContent: 'center',
            fontSize: '0.78rem',
            padding: '6px 12px',
            borderColor: '#4f46e5',
            color: '#4f46e5',
            background: '#ffffff',
          }}
          onClick={() => onSelectPreset(trip)}
        >
          Load This Route into Planner <ArrowRight size={13} />
        </button>
      </div>

      {/* Dots Indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
        {PRESET_TRIPS.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? '16px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: idx === currentIndex ? 'var(--primary)' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
