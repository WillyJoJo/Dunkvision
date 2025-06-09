import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
export async function actualizarHistorialEnfrentamientos() {
  const response = await axios.post(`${API_URL}/api/historial_enfrentamientos/actualizar`);
  return response.data;
}
