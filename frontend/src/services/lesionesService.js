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

/**
 * Obtiene el nombre del jugador por su ID.
 * Se asume que el endpoint /api/jugadores/<id_jugador> devuelve un objeto con { nombre, ... }
 */
export async function getNombreJugador(id_jugador) {
  const response = await axios.get(`${API_URL}/api/jugadores/${id_jugador}`);
  console.log("getNombreJugador response", response);
  return response.data.nombre;
}

// Función para crear una nueva lesión
export async function createLesion(data) {
  const response = await axios.post(`${API_URL}/api/lesiones_jugador`, data);
  return response.data;
}

// Función para actualizar una lesión (se espera que en 'data' se incluya el id de la lesión)
// Ahora apunta a la ruta de "administrar" la lesión
export async function updateLesion(data) {
  const response = await axios.put(`${API_URL}/api/lesiones_jugador/administrar`, data);
  return response.data;
}

// Función para eliminar una lesión a partir de su id, ahora incluyendo el token
export async function deleteLesion(lesionId, token) {
  const response = await axios.delete(`${API_URL}/api/lesiones_jugador/${lesionId}`, {
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


