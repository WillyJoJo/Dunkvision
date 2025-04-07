"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getJugadoresById } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import { getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId } from "@/services/estadisticasAvanzadasJugadorService";
import { getTemporadas } from "@/services/temporadasService";
import BotonLesionConEstado from "@/components/ui/BotonLesionConEstado";

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

// Diccionario de abreviaciones + nombres completos (para tooltip)
const columnasAbreviadas = {
  asistencias: "AST",
  box_plus_minus: "BPM",
  faltas_cometidas: "FAL",
  minutos_jugados: "MIN",
  partidos_jugados: "PJ",
  perdidas_balon: "PERD",
  player_efficiency_rating: "PER",
  porcentaje_efectivo_tiros_de_campo: "eFG%",
  porcentaje_tiros_de_campo: "FG%",
  porcentaje_triples: "3P%",
  porcentaje_tiros_de_dos: "2P%",
  porcentaje_tiros_libres: "FT%",
  puntos: "PTS",
  rating_defensivo: "DRtg",
  rating_ofensivo: "ORtg",
  rebotes_defensivos: "RD",
  rebotes_ofensivos: "RO",
  rebotes_totales: "RT",
  robos: "STL",
  tapones: "BLK",
  tiros_de_campo_intentados: "FGA",
  tiros_libres_intentados: "FTA",
  triples_intentados: "3PA",
  tiros_de_dos_intentados: "2PA",
  usage_porcentage: "USG%",
  win_share_ofensivo: "WSO",
  win_share_defensivo: "WSD",
  win_share_total: "WST",
};

export default function JugadorPage({ params }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === "admin";

  const [jugador, setJugador] = useState(null);
  const [equipo, setEquipo] = useState(null);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaId, setTemporadaId] = useState(24);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    const fetchJugadorYEquipo = async () => {
      const jugadorData = await getJugadoresById(params.jugadorId);
      const equipoData = await getEquiposById(jugadorData.equipo_id);
      setJugador(jugadorData);
      setEquipo(equipoData);
    };

    const fetchTemporadas = async () => {
      const data = await getTemporadas();
      setTemporadas(data);
    };

    fetchJugadorYEquipo();
    fetchTemporadas();
  }, [params.jugadorId]);

  useEffect(() => {
    const fetchEstadisticas = async () => {
      const data = await getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId(
        params.jugadorId,
        temporadaId
      );
      setEstadisticas(data);
    };

    fetchEstadisticas();
  }, [params.jugadorId, temporadaId]);

  if (!jugador || !equipo) return <div style={{ color: "#fff" }}>Cargando...</div>;

  return (
    <main style={{ padding: "2rem", color: "#fff" }}>
      {/* Encabezado jugador */}
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

      {/* Info básica */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          maxWidth: "600px",
          marginBottom: "2rem",
        }}
      >
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

        <p style={{ marginBottom: "1.5rem" }}>
          <strong>Equipo:</strong> {equipo.nombre}
        </p>

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

        {isAdmin && <BotonLesionConEstado jugadorId={params.jugadorId} />}
      </div>

      {/* Tabla de estadísticas */}
      <div
        style={{
          backgroundColor: "#0d0d0d",
          padding: "1rem 1.5rem",
          borderRadius: "10px",
          maxWidth: "100%",
          overflowX: "auto",
          border: "1px solid #444",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Estadísticas avanzadas</h2>

        {estadisticas ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", color: "#fff" }}>
            <thead>
              <tr>
                {Object.keys(estadisticas).map((key) => (
                  <th
                    key={key}
                    title={key.replaceAll("_", " ")}
                    style={{
                      textAlign: "left",
                      padding: "0.5rem",
                      borderBottom: "1px solid #444",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {columnasAbreviadas[key] || key.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(estadisticas).map((value, idx) => (
                  <td
                    key={idx}
                    style={{
                      padding: "0.5rem",
                      borderBottom: "1px solid #333",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#ccc" }}>No hay estadísticas disponibles para esta temporada.</p>
        )}
      </div>
    </main>
  );
}
