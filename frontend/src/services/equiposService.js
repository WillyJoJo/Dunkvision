import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

// Función para obtener equipos con filtros opcionales y ordenamiento
export async function getEquipos(filters = {}) {
  const { conferencia, division, orden } = filters;
  const params = {};
  if (conferencia) params.conferencia = conferencia;
  if (division) params.division = division;
  if (orden) params.orden = orden; // "asc" o "desc", según se requiera

  const response = await axios.get(`${API_URL}/api/equipos`, { params });
  return response.data;
}

export async function getEquiposById(id) {
  const response = await axios.get(`${API_URL}/api/equipos/${id}`);
  return response.data; /*{
    "id": equipo.id_equipo,
    "nombre": equipo.nombre,
    "conferencia": equipo.conferencia,
    "division": equipo.division
  }*/
}