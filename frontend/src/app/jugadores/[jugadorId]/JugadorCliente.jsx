"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getJugadoresById } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import { getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId } from "@/services/estadisticasAvanzadasJugadorService";
import { getTemporadas } from "@/services/temporadasService";
import BotonLesionConEstado from "@/components/ui/BotonLesionConEstado";
import { DataTableJugador } from "./data-table";

const transformarPosiciones = (abreviacion) => {
  const mapping = {
    G: "Base, Escolta",
    F: "Alero, Ala-Pívot",
    C: "Pívot",
  };

  if (!abreviacion) return [];

  return abreviacion
    .split("-")
    .map((pos) => mapping[pos] || "")
    .filter((p) => p !== "");
};

export default function JugadorCliente({ jugadorId }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === "admin";

  const [jugador, setJugador] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaId, setTemporadaId] = useState(24);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jugadorData = await getJugadoresById(jugadorId);
        const equipoData = await getEquiposById(jugadorData.equipo_id);
        const temporadasData = await getTemporadas();

        setJugador(jugadorData);
        setEquipo(equipoData);
        setTemporadas(temporadasData);
      } catch (err) {
        console.error("Error cargando jugador o equipo:", err);
      }
    };

    if (jugadorId) fetchData();
  }, [jugadorId]);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      const data = await getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId(
        jugadorId,
        temporadaId
      );
      setEstadisticas(data);
    };

    if (jugadorId) fetchEstadisticas();
  }, [jugadorId, temporadaId]);

  if (!jugador || !equipo) {
    return (
      <div style={{ color: "#fff", padding: "2rem" }}>
        <p>Cargando datos del jugador...</p>
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
          maxWidth: "600px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold" }}>
          {jugador.nombre}
        </h1>
      </div>

      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          maxWidth: "600px",
          marginBottom: "2rem",
        }}
      >
        {/* Posición */}
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>Posición:</strong>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {transformarPosiciones(jugador.posicion).map((texto, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: "#333",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                {texto}
              </span>
            ))}
          </div>
        </div>

        {/* Equipo */}
        <p style={{ marginBottom: "1.5rem" }}>
          <strong>Equipo:</strong> {equipo.nombre}
        </p>

        {/* Temporada */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="temporada-select"><strong>Temporada:</strong></label>
          <select
            id="temporada-select"
            value={temporadaId}
            onChange={(e) => setTemporadaId(parseInt(e.target.value))}
            style={{
              marginLeft: "1rem",
              backgroundColor: "#222",
              color: "#fff",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #555",
            }}
          >
            {temporadas.map((temp) => (
              <option key={temp.id} value={temp.id}>
                {temp.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Botón añadir lesión */}
        {isAdmin && (
          <div style={{ marginTop: "1rem" }}>
            <BotonLesionConEstado jugadorId={jugadorId} />
          </div>
        )}
      </div>

      <DataTableJugador data={estadisticas ? [estadisticas] : []} />
    </main>
  );
}
