import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, Fuel, Clock, FileText, Sparkles } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    badge: 'FMCSA 49 CFR Part 395 Compliance',
    badgeColor: '#4f46e5',
    title: 'Trip Planner & ELD Log Sheet Generator',
    subtitle: 'Calculate optimized commercial truck routes and auto-generate FMCSA-compliant 24-hour Daily Log Sheets with paper-log grid rendering, rest break scheduling, and high-resolution PDF export.',
    tags: [
      { text: '11h Max Driving', type: 'primary' },
      { text: '14h Duty Window', type: 'primary' },
      { text: '30m Mandatory Break', type: 'success' },
      { text: '10h Daily Rest', type: 'success' },
      { text: '1,000mi Fueling Stops', type: 'default' },
      { text: '70h / 8-Day Cycle', type: 'default' },
    ],
    bgGradient: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
    borderColor: '#bbf7d0',
    icon: <Truck size={36} style={{ color: '#4f46e5' }} />,
  },
  {
    id: 2,
    badge: 'Automated Compliance Engine',
    badgeColor: '#059669',
    title: 'Instant HOS Audit & Safety Inspection Report',
    subtitle: 'Automatically audit every trip against 6 core Federal Motor Carrier Safety rules. Verify zero violations before dispatch, track 70-hour cycle usage, and download DOT inspection CSV logs.',
    tags: [
      { text: 'Zero Violation Auditor', type: 'success' },
      { text: 'DOT CSV Inspection Log', type: 'primary' },
      { text: 'Cycle Reset Warning', type: 'default' },
      { text: 'Co-Driver Support', type: 'default' },
    ],
    bgGradient: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
    borderColor: '#bfdbfe',
    icon: <ShieldCheck size={36} style={{ color: '#059669' }} />,
  },
  {
    id: 3,
    badge: 'Fleet Intelligence Tools',
    badgeColor: '#d97706',
    title: 'Live Route Weather & Fuel Cost Estimator',
    subtitle: 'Real-time Open-Meteo weather forecasts along origin, pickup, and destination waypoints plus Class-8 semi-truck fuel consumption, estimated diesel gallons, and cost-per-mile calculator.',
    tags: [
      { text: 'Live Route Forecast', type: 'primary' },
      { text: 'Fuel Cost per Mile', type: 'success' },
      { text: 'GPS Auto-Detection', type: 'default' },
      { text: 'Interactive Drive Simulator', type: 'default' },
    ],
    bgGradient: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
    borderColor: '#fde68a',
    icon: <Fuel size={36} style={{ color: '#d97706' }} />,
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-scroll interval (4 seconds)
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
      }, 4000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const slide = SLIDES[currentSlide];

  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '3rem 2.5rem',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between',
          position: 'relative',
          background: slide.bgGradient,
          transition: 'background 0.4s ease',
        }}
      >
        {/* Top Badge & Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: '16px',
              background: '#ffffff',
              border: `1px solid ${slide.borderColor}`,
              color: slide.badgeColor,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Sparkles size={14} /> {slide.badge}
          </span>

          {/* Navigation Arrows & Slide Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              Slide {currentSlide + 1} of {SLIDES.length}
            </span>
            <button
              type="button"
              onClick={prevSlide}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#334155',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Slide Main Content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', margin: '0.5rem 0 1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#ffffff',
              border: `1.5px solid ${slide.borderColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 6px rgba(0,0,0,0.03)',
            }}
          >
            {slide.icon}
          </div>

          <div style={{ flex: 1 }}>
            <h1
              style={{
                fontSize: '1.95rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                marginBottom: '8px',
                lineHeight: 1.2,
              }}
            >
              {slide.title}
            </h1>
            <p
              style={{
                fontSize: '1.02rem',
                color: '#475569',
                maxWidth: '920px',
                marginBottom: '16px',
                lineHeight: 1.55,
              }}
            >
              {slide.subtitle}
            </p>

            {/* Rule Tags */}
            <div className="rule-tags">
              {slide.tags.map((t, idx) => (
                <span
                  key={idx}
                  className={`tag ${t.type}`}
                  style={{
                    fontSize: '0.82rem',
                    padding: '5px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {t.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Pagination Dots Indicator */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '1rem',
          }}
        >
          {SLIDES.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: idx === currentSlide ? '32px' : '10px',
                height: '10px',
                borderRadius: '5px',
                background: idx === currentSlide ? slide.badgeColor : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
