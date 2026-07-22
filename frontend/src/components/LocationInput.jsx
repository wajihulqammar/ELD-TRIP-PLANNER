import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Locate, Loader2, Check } from 'lucide-react';
import axios from 'axios';

export default function LocationInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  showCurrentLocButton = false,
  iconColor = '#64748b',
  id,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [fetchingGeo, setFetchingGeo] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const timerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (val.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce 350ms
    timerRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const resp = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: val,
            format: 'json',
            addressdetails: 1,
            limit: 5,
          },
          headers: { 'User-Agent': 'ELD-HOS-Planner/1.0' },
        });
        setSuggestions(resp.data || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Autocomplete error:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 350);
  };

  const selectSuggestion = (item) => {
    onChange(item.display_name);
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setFetchingGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
            },
            headers: { 'User-Agent': 'ELD-HOS-Planner/1.0' },
          });
          if (resp.data && resp.data.display_name) {
            onChange(resp.data.display_name);
          } else {
            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (err) {
          console.error('Reverse geocode error:', err);
          alert('Could not reverse geocode your location. Please type manually.');
        } finally {
          setFetchingGeo(false);
        }
      },
      (err) => {
        console.error('GPS error:', err);
        setFetchingGeo(false);
        alert('Location access denied or unavailable. Please type your location manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="form-field" ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ marginBottom: 0 }}>
          {label}
        </label>
        {showCurrentLocButton && (
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={disabled || fetchingGeo}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0,
            }}
          >
            {fetchingGeo ? (
              <>
                <Loader2 size={13} className="spinner-icon" /> Detecting...
              </>
            ) : (
              <>
                <Locate size={13} /> Detect My Location
              </>
            )}
          </button>
        )}
      </div>

      <div className="input-wrapper">
        <MapPin size={16} className="input-icon" style={{ color: iconColor }} />
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          disabled={disabled}
          required={required}
          id={id}
          autoComplete="off"
        />
        {loadingSuggestions && (
          <Loader2
            size={16}
            style={{
              position: 'absolute',
              right: '12px',
              color: 'var(--text-muted)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        )}
      </div>

      {/* Autocomplete Dropdown Menu */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1000,
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => selectSuggestion(item)}
              style={{
                padding: '10px 14px',
                fontSize: '0.85rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-light)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <MapPin size={14} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1, lineHeight: 1.3 }}>
                <div style={{ fontWeight: 600 }}>{item.display_name.split(',')[0]}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.display_name.split(',').slice(1).join(',')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
