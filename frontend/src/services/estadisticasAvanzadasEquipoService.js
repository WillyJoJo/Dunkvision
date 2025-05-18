import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export const getEstadisticasAvanzadasEquipo = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/estadisticas_avanzadas_equipo`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las estadísticas avanzadas de los equipos');
  }
};

export const getEstadisticasAvanzadasEquipoByEquipoId = async (equipoId) => {
  try {
    const response = await axios.get(`${API_URL}/api/estadisticas_avanzadas_equipo/${equipoId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw new Error('Error al obtener las estadísticas del equipo para la temporada');
  }
};