  import axios from "axios";

  const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

  export async function getLesiones() {
  const response = await axios.get(`${API_URL}/api/lesiones_jugador`);
  const data = response.data;
  // Si la respuesta es un array de dos elementos y el segundo es un número, extrae el primer elemento.
  if (Array.isArray(data) && data.length === 2 && typeof data[1] === "number") {
    return data[0];
  }
  return data;
}

// Función para crear una nueva lesión
export async function createLesion(data, token) {
  const response = await axios.post(`${API_URL}/api/lesiones_jugador`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Eliminar una lesión individual
export async function deleteLesion(lesionId, token) {
  const response = await axios.delete(`${API_URL}/api/lesiones_jugador/${lesionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Limpiar lesiones antiguas automáticamente
export async function limpiarLesiones(token) {
  const response = await axios.delete(`${API_URL}/api/lesiones_jugador/limpiar`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

// Función para obtener una lesión por su ID
export async function getLesionById(lesionId) {
  const response = await axios.get(`${API_URL}/api/lesiones_jugador/${lesionId}`);
  return response.data;
}

// Función para editar una lesión a partir de su id
export async function editarLesion(lesion_id, data, token) {
  console.log("Datos que se van a enviar a editarLesion:", data);

  const response = await axios.put(`${API_URL}/api/lesiones_jugador/editar/${lesion_id}`, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getLesionActiva(jugadorId) {
  const response = await axios.get(`${API_URL}/api/lesiones_jugador/activa/${jugadorId}`);
  return response.data;
}