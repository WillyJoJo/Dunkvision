import axios from "axios";
import { getJugadoresById } from "./jugadoresService"; // Asegúrate de que esta ruta es correcta

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

/**
 * Obtiene las estadísticas avanzadas de un jugador en una temporada.
 * @param {number} jugadorId 
 * @param {number} temporadaId 
 * @param {number} equipoId 
 * @returns {Promise<object>} Objeto formateado como jugador fichado.
 */
export async function getJugadorFichado(jugadorId, temporadaId, equipoId) {
  const { data: stats } = await axios.get(`${API_URL}/api/estadisticas_avanzadas/${jugadorId}/${temporadaId}`);
  const jugador = await getJugadoresById(jugadorId); // trae nombre, equipo, posición...

  return {
    id_jugador: jugadorId,
    nombre: jugador.nombre,
    equipo_id: equipoId,
    minutos_jugados: stats.minutos_jugados,
    win_share_total: stats.win_share_total,
    win_share_ofensivo: stats.win_share_ofensivo,
    win_share_defensivo: stats.win_share_defensivo,
    player_efficiency_rating: stats.player_efficiency_rating,
    usage_porcentage: stats.usage_porcentage,
    box_plus_minus: stats.box_plus_minus,
    rating_ofensivo: stats.rating_ofensivo,
    rating_defensivo: stats.rating_defensivo,
    puntos: stats.puntos,
    asistencias: stats.asistencias,
    rebotes_totales: stats.rebotes_totales,
    rebotes_defensivos: stats.rebotes_defensivos,
    robos: stats.robos,
    tapones: stats.tapones,
    porcentaje_efectivo_tiros_de_campo: stats.porcentaje_efectivo_tiros_de_campo,
    porcentaje_tiros_libres: stats.porcentaje_tiros_libres,
    faltas_cometidas: stats.faltas_cometidas,
    perdidas_balon: stats.perdidas_balon
  };
}

/**
 * Envía la predicción de un partido al backend.
 * @param {number} equipo1Id 
 * @param {number} equipo2Id 
 * @param {number[]} jugadoresLesionados 
 * @param {object[]} jugadoresFichados 
 * @returns {Promise<object>} Resultado de la predicción
 */
export async function predecirPartido(equipo1Id, equipo2Id, jugadoresLesionados = [], jugadoresFichados = []) {
  const { data } = await axios.post(`${API_URL}/api/prediccion/equipos`, {
    equipo1_id: equipo1Id,
    equipo2_id: equipo2Id,
    jugadores_lesionados: jugadoresLesionados,
    jugadores_fichados: jugadoresFichados
  });

  return data;
}