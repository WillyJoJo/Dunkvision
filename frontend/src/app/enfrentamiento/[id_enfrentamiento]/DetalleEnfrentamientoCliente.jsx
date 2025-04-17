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

  return (
    <main style={{ padding: "2rem", color: "#fff" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          padding: "2rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          maxWidth: "800px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold" }}>
          {nombreEquipoLocal} vs {nombreEquipoVisitante}
        </h1>
        <p style={{ marginTop: "0.5rem" }}>
          <strong>Fecha:</strong> {format(new Date(enfrentamiento.fecha), "dd/MM/yyyy")}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          maxWidth: "800px",
          marginBottom: "2rem",
        }}
      >
        <p>
          <strong>Equipo Local:</strong> {nombreEquipoLocal}
        </p>
        <p>
          <strong>Equipo Visitante:</strong> {nombreEquipoVisitante}
        </p>
        <p>
          <strong>Puntos Local:</strong> {enfrentamiento.puntos_local}
        </p>
        <p>
          <strong>Puntos Visitante:</strong> {enfrentamiento.puntos_visitante}
        </p>
      </div>

      {jugadoresPartido.length > 0 && (
        <DataTable data={jugadoresPartido} />
      )}
    </main>
  );
}