import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, Thermometer, AlertCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

function getWeatherIcon(code) {
  if (code === 0) return <Sun size={20} style={{ color: '#f59e0b' }} />;
  if (code >= 1 && code <= 3) return <Cloud size={20} style={{ color: '#0284c7' }} />;
  if (code >= 51 && code <= 99) return <CloudRain size={20} style={{ color: '#3b82f6' }} />;
  return <Cloud size={20} style={{ color: '#64748b' }} />;
}

function getWeatherDesc(code) {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code >= 51 && code <= 67) return 'Rain / Drizzle';
  if (code >= 71 && code <= 77) return 'Snow Flurries';
  if (code >= 80 && code <= 99) return 'Rain Showers / Thunder';
  return 'Fair Weather';
}

export default function RouteWeather({ locations }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locations) return;

    async function fetchWeather() {
      setLoading(true);
      try {
        const points = [
          { name: 'Current', data: locations.current },
          { name: 'Pickup', data: locations.pickup },
          { name: 'Dropoff', data: locations.dropoff },
        ];

        const results = await Promise.all(
          points.map(async (p) => {
            const resp = await axios.get('https://api.open-meteo.com/v1/forecast', {
              params: {
                latitude: p.data.lat,
                longitude: p.data.lon,
                current_weather: true,
                temperature_unit: 'fahrenheit',
                windspeed_unit: 'mph',
              },
            });
            return {
              name: p.name,
              label: p.data.display_name.split(',')[0],
              weather: resp.data.current_weather,
            };
          })
        );

        setWeatherData(results);
      } catch (err) {
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [locations]);

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
        <div className="spinner-sm" style={{ margin: '0 auto 8px' }} />
        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Loading live route weather forecast...</div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="card">
      <div className="card-title-bar" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={18} style={{ color: '#f59e0b' }} />
          <h2>Live Route Weather &amp; Road Conditions</h2>
        </div>
        <span className="tag success" style={{ fontSize: '0.72rem' }}>
          <ShieldCheck size={12} /> Open-Meteo Live API
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {weatherData.map((item, idx) => (
          <div
            key={idx}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
              {item.name} Location
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', marginBottom: '8px' }}>
              {item.label}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {getWeatherIcon(item.weather.weathercode)}
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', fontFamily: 'JetBrains Mono, monospace' }}>
                {Math.round(item.weather.temperature)}°F
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500, marginBottom: '6px' }}>
              {getWeatherDesc(item.weather.weathercode)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
              <Wind size={12} /> Wind: {item.weather.windspeed} mph
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
