import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Función para obtener equipos con filtros opcionales
export async function getEquipos(filters = {}) {
  const { conferencia, division } = filters;
  const params = {};
  if (conferencia) params.conferencia = conferencia;
  if (division) params.division = division;
  
  const response = await axios.get(`${API_URL}/api/equipos`, { params });
  // Aquí podrías manejar la data de forma más específica si lo deseas
  return response.data;
}
