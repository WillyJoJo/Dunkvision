import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
export async function actualizarContextoPartido() {
  const response = await axios.post(`${API_URL}/api/contexto_partido`);
  return response.data;
}
