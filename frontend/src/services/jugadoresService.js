import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

/**
 * Obtiene la lista de jugadores con filtros opcionales.
 * Luego, para cada jugador, hace una llamada adicional para obtener el nombre del equipo.
 */
export async function getJugadores(filters = {}) {
  const { letra_apellido, equipo, posicion } = filters;
  const params = {};

  if (letra_apellido) params.letra_apellido = letra_apellido;
  if (equipo) params.equipo = equipo;         // ID numérico del equipo
  if (posicion) params.posicion = posicion;

  // 1. Llamada principal a /api/jugadores
  const response = await axios.get(`${API_URL}/api/jugadores`, { params });
  const data = response.data; // Array de jugadores, cada uno con { id, nombre, equipo_id, posicion, ... }

  // 2. Para cada jugador, obtener el nombre del equipo llamando a /api/equipos/:id_equipo
  const jugadoresConEquipo = await Promise.all(
    data.map(async (jugador) => {
      if (jugador.equipo_id) {
        try {
          const respEquipo = await axios.get(`${API_URL}/api/equipos/${jugador.equipo_id}`);
          // Se asume que respEquipo.data = { id, nombre, conferencia, division, ... }
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
