"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getEnfrentamientoByEnfrentamientoId } from "@/services/enfrentamientosService";
import { getEquiposById } from "@/services/equiposService";
import { getJugadoresPartidoByEnfrentamientoId } from "@/services/jugadorPartidoService";
import { getJugadoresById } from "@/services/jugadoresService";
import { format } from "date-fns";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function DetalleEnfrentamientoCliente() {
  const { id_enfrentamiento } = useParams();
  const [enfrentamiento, setEnfrentamiento] = useState(null);
  const [jugadoresPartido, setJugadoresPartido] = useState([]);

  useEffect(() => {
    async function fetchDatos() {
      try {
        const enfr = await getEnfrentamientoByEnfrentamientoId(id_enfrentamiento);
        setEnfrentamiento(enfr);
      } catch (error) {
        console.error("Error cargando el enfrentamiento:", error);
      }
    }

    if (id_enfrentamiento) fetchDatos();
  }, [id_enfrentamiento]);

  useEffect(() => {
    async function fetchJugadoresPartido() {
      if (!id_enfrentamiento) return;

      try {
        const datos = await getJugadoresPartidoByEnfrentamientoId(id_enfrentamiento);

        // Cache para no pedir el mismo equipo varias veces
        const equipoCache = {};

        const jugadoresConNombre = await Promise.all(
          datos.map(async (jugador) => {
            const infoJugador = await getJugadoresById(jugador.jugador_id);

            let equipoNombre = "Desconocido";

            if (infoJugador.equipo_id) {
              if (!equipoCache[infoJugador.equipo_id]) {
                equipoCache[infoJugador.equipo_id] = await getEquiposById(infoJugador.equipo_id);
              }
              equipoNombre = equipoCache[infoJugador.equipo_id]?.nombre ?? "Desconocido";
            }

            return {
              ...jugador,
              nombre: infoJugador.nombre,
              equipo: equipoNombre,
            };
          })
        );

        setJugadoresPartido(jugadoresConNombre);
      } catch (err) {
        console.error("Error cargando jugadores:", err);
      }
    }

    fetchJugadoresPartido();
  }, [id_enfrentamiento]);

  if (!enfrentamiento) return <div className="p-4">Cargando enfrentamiento...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-black text-white p-4 rounded-lg mb-6">
        <h1 className="text-2xl font-bold mb-1">Detalle del Enfrentamiento</h1>
        <p className="text-sm text-gray-300">ID: {id_enfrentamiento}</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4 mb-8">
        <p><strong>Fecha:</strong> {format(new Date(enfrentamiento.fecha), "dd/MM/yyyy")}</p>
        <p><strong>Equipo Local:</strong> {enfrentamiento.equipo_local}</p>
        <p><strong>Equipo Visitante:</strong> {enfrentamiento.equipo_visitante}</p>
        <p><strong>Puntos Local:</strong> {enfrentamiento.puntos_local}</p>
        <p><strong>Puntos Visitante:</strong> {enfrentamiento.puntos_visitante}</p>
      </div>

      {jugadoresPartido.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Estadísticas de los Jugadores</h2>
          <DataTable columns={columns} data={jugadoresPartido} />
        </div>
      )}
    </div>
  );
}