import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export async function recuperar_contrasena(email) {
  try {
    const response = await axios.post(`${API_URL}/api/recuperar-contrasena`, { email });
    return response.data;
  } catch (error) {
    console.error("Error al recuperar la contraseña:", error);
    throw error;
  }
}

export async function restablecer_contrasena(token, nueva_contrasena) {
  try {
    const response = await axios.post(
      `${API_URL}/api/restablecer-contrasena/${token}`,
      { password: nueva_contrasena }  // <- esto debe llamarse `password`, como espera el backend
    );
    return response.data;
  } catch (error) {
    console.error("Error al restablecer la contraseña:", error);
    throw error;
  }
}