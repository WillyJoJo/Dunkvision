import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

/**
 * Obtiene la lista de jugadores con filtros opcionales.
 * Luego, para cada jugador, hace una llamada adicional para obtener el nombre del equipo.
 */
export async function getJugadores(filters = {}) {
  const { busqueda, equipo, posicion } = filters;
  const params = {};

  if (busqueda) params.busqueda = busqueda;   
  if (equipo) params.equipo = equipo;
  if (posicion) params.posicion = posicion;

  // 1. Llamada principal a /api/jugadores
  const response = await axios.get(`${API_URL}/api/jugadores`, { params });
  const data = response.data; // Array de jugadores: { id, nombre, equipo_id, posicion }

  // 2. Para cada jugador, obtener el nombre del equipo llamando a /api/equipos/:id_equipo
  const jugadoresConEquipo = await Promise.all(
    data.map(async (jugador) => {
      if (jugador.equipo_id) {
        try {
          const respEquipo = await axios.get(`${API_URL}/api/equipos/${jugador.equipo_id}`);
          jugador.nombre_equipo = respEquipo.data.nombre;
        } catch {
          jugador.nombre_equipo = "Equipo desconocido";
        }
      } else {
        jugador.nombre_equipo = "Sin equipo";
      }
      return jugador;
    })
  );

  return jugadoresConEquipo;
}

export async function getJugadoresById(id) {
  const response = await axios.get(`${API_URL}/api/jugadores/${id}`);
  return response.data; /*{
    "id": jugador.id_jugador,
    "nombre": jugador.nombre,
    "equipo_id": jugador.equipo_id,
    "posicion": jugador.posicion
}*/
}

export async function getJugadoresByEquipoId(id) {
  const response = await axios.get(`${API_URL}/api/jugadores/equipo/${id}`);
  const data = response.data;

  return data.map(j => ({
    ...j,
    id_jugador: j.id_jugador || j.id,  // normaliza la clave
    nombre: j.nombre,
    equipo_id: j.equipo_id,
    posicion: j.posicion
  }));
}

//Obtiene el nombre del jugador por su ID.
export async function getNombreJugador(id_jugador) {
  const response = await axios.get(`${API_URL}/api/jugadores/${id_jugador}`);
  console.log("getNombreJugador response", response);
  return response.data.nombre;
}