import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export async function getJugadoresPartidoByEnfrentamientoId(enfrentamiento_id) {
    const response = await axios.get(`${API_URL}/api/jugador_partido/enfrentamiento/${enfrentamiento_id}`);
    return response.data;
    }

export async function getJugadorPartidoByJugadorId(jugador_id) {
    const response = await axios.get(`${API_URL}/api/jugador_partido/jugador/${jugador_id}`);
    return response.data;
}