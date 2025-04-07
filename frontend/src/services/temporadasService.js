import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export async function getTemporadas() {
  const response = await axios.get(`${API_URL}/api/temporadas`);
  return response.data;
}