import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Función para obtener enfrentamientos
export async function getEnfrentamientos(filters = {}) {
  const { equipo1, equipo2, fecha } = filters;
  const params = {};
  if (equipo1) params.equipo1 = equipo1;
  if (equipo2) params.equipo2 = equipo2;
  if (fecha) params.fecha = fecha; // Formato YYYY-MM-DD

  const response = await axios.get(`${API_URL}/api/enfrentamientos`, { params });
  return response.data;
}

export async function getEnfrentamientoByEnfrentamientoId (enfrentamiento_id) {
  const response = await axios.get(`${API_URL}/api/enfrentamientos/${enfrentamiento_id}`);
  return response.data;
}