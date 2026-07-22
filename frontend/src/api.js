import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export async function planTrip(data) {
  const response = await api.post('/api/plan-trip/', data);
  return response.data;
}

export default api;
