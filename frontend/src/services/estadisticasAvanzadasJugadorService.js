import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export async function getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId(jugadorId, temporadaId) {
  const response = await axios.get(`${API_URL}/api/estadisticas_avanzadas/${jugadorId}/${temporadaId}`);
  return response.data;
}

export async function getMediaEstadisticasAvanzadasJugadorByTemporadaId(temporadaId) {
  try {
    const response = await axios.get(`${API_URL}/api/estadisticas_avanzadas/media/${temporadaId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener la media de estadísticas avanzadas de los jugadores');
  }
}