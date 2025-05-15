"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getEnfrentamientoByEnfrentamientoId } from "@/services/enfrentamientosService";
import { getEquiposById } from "@/services/equiposService";
import { getJugadoresPartidoByEnfrentamientoId } from "@/services/jugadorPartidoService";
import { getJugadoresById } from "@/services/jugadoresService";
import { format } from "date-fns";
import { DataTable } from "./data-table";
import Marcador from "@/components/ui/Marcador";

export default function DetalleEnfrentamientoCliente() {
  const { id_enfrentamiento } = useParams();
  const [enfrentamiento, setEnfrentamiento] = useState(null);
  const [nombreEquipoLocal, setNombreEquipoLocal] = useState("");
  const [nombreEquipoVisitante, setNombreEquipoVisitante] = useState("");
  const [jugadoresPartido, setJugadoresPartido] = useState([]);

  useEffect(() => {
    async function fetchDatos() {
      try {
        const enfr = await getEnfrentamientoByEnfrentamientoId(id_enfrentamiento);
        setEnfrentamiento(enfr);

        const [equipoLocal, equipoVisitante] = await Promise.all([
          getEquiposById(enfr.equipo_local),
          getEquiposById(enfr.equipo_visitante),
        ]);

        setNombreEquipoLocal(equipoLocal?.nombre ?? `Equipo ${enfr.equipo_local}`);
        setNombreEquipoVisitante(equipoVisitante?.nombre ?? `Equipo ${enfr.equipo_visitante}`);
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
        const equipoCache = {};

        const jugadoresConNombre = await Promise.all(
          datos.map(async (jugador) => {
            const infoJugador = await getJugadoresById(jugador.jugador_id);

            let equipoNombre = "Desconocido";
            if (jugador.equipo_id) {
              if (!equipoCache[jugador.equipo_id]) {
                equipoCache[jugador.equipo_id] = await getEquiposById(jugador.equipo_id);
              }
              equipoNombre = equipoCache[jugador.equipo_id]?.nombre ?? "Desconocido";
            }

            return {
              ...jugador,
              nombre: infoJugador.nombre,
              equipo: equipoNombre,
              equipo_id: jugador.equipo_id,
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

  if (!enfrentamiento) {
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>
        <p>Cargando detalles del enfrentamiento...</p>
      </div>
    );
  }

  const { puntos_local, puntos_visitante, equipo_local, equipo_visitante, fecha } = enfrentamiento;

  return (
    <main style={{ padding: "2rem", color: "#fff" }}>
      <Marcador
        equipoLocal={equipo_local}
        equipoVisitante={equipo_visitante}
        nombreEquipoLocal={nombreEquipoLocal}
        nombreEquipoVisitante={nombreEquipoVisitante}
        puntosLocal={puntos_local}
        puntosVisitante={puntos_visitante}
        fecha={format(new Date(fecha), "dd/MM/yyyy")}
      />

      {jugadoresPartido.length > 0 && (
        <DataTable data={jugadoresPartido} />
      )}
    </main>
  );
}