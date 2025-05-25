"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getJugadoresById } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import {
  getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId,
  getMediaEstadisticasAvanzadasJugadorByTemporadaId,
} from "@/services/estadisticasAvanzadasJugadorService";
import { getTemporadas } from "@/services/temporadasService";
import { getJugadorPartidoByJugadorId } from "@/services/jugadorPartidoService";
import { getEnfrentamientoByEnfrentamientoId } from "@/services/enfrentamientosService";
import BotonLesionConEstado from "@/components/ui/BotonLesionConEstado";
import { DataTableJugador } from "./data-table";
import { DataTablePartido } from "./data-table-partido";
import GraficoComparativoJugadorMedia from "@/components/ui/GraficoComparativoJugadorMedia";
import Link from "next/link";

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
  const [media, setMedia] = useState(null);
  const [partidos, setPartidos] = useState([]);

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
      try {
        const data = await getEstadisticasAvanzadasJugadorByJugadorIdTemporadaId(
          jugadorId,
          temporadaId
        );
        setEstadisticas(data);
      } catch (error) {
        if (error.response?.status === 404) {
          setEstadisticas(null);
        } else {
          console.error("Error al cargar estadísticas avanzadas:", error);
        }
      }
    };

    if (jugadorId) fetchEstadisticas();
  }, [jugadorId, temporadaId]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const mediaData = await getMediaEstadisticasAvanzadasJugadorByTemporadaId(temporadaId);
        setMedia(mediaData);
      } catch (err) {
        console.error("Error cargando media:", err);
      }
    };

    if (temporadaId) fetchMedia();
  }, [temporadaId]);

  useEffect(() => {
    const fetchPartidos = async () => {
      try {
        const registros = await getJugadorPartidoByJugadorId(jugadorId, temporadaId);

        const partidosEnriquecidos = await Promise.all(
          registros.map(async (partido) => {
            const enfrentamiento = await getEnfrentamientoByEnfrentamientoId(partido.enfrentamiento_id);
            const equipoLocal = await getEquiposById(enfrentamiento.equipo_local);
            const equipoVisitante = await getEquiposById(enfrentamiento.equipo_visitante);

            return {
              ...partido,
              fecha: enfrentamiento.fecha,
              equipoLocal: equipoLocal.nombre,
              equipoVisitante: equipoVisitante.nombre,
              puntosLocal: enfrentamiento.puntos_local,
              puntosVisitante: enfrentamiento.puntos_visitante,
              equipoLocalId: enfrentamiento.equipo_local,
              equipoVisitanteId: enfrentamiento.equipo_visitante,
            };
          })
        );

        setPartidos(partidosEnriquecidos);
      } catch (err) {
        console.error("Error cargando partidos del jugador:", err);
      }
    };

    if (jugadorId && temporadaId) fetchPartidos();
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
      <div style={{ display: "flex", gap: "2rem", alignItems: "stretch", flexWrap: "wrap" }}>
        {/* DATOS DEL JUGADOR */}
        <div
          style={{
            background: "linear-gradient(135deg, #000 0%, #f00 100%)",
            color: "#fff",
            padding: "2rem",
            borderRadius: "8px",
            maxWidth: "400px",
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold", lineHeight: "1.2", textAlign: "center" }}>
            {jugador.nombre}
          </h1>
          <div style={{ marginTop: "1.5rem", width: "100%", maxWidth: "300px" }}>
            <img
              src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${jugador.id}.png`}
              alt={jugador.nombre}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "12px",
                objectFit: "cover",
                border: "2px solid #fff",
                display: "block",
              }}
              onError={(e) => {
                e.target.src = "/placeholder-player.png";
              }}
            />
          </div>
        </div>

        {/* INFORMACIÓN */}
        <div
          style={{
            backgroundColor: "#1a1a1a",
            padding: "1.5rem 2rem",
            borderRadius: "10px",
            maxWidth: "400px",
            flex: "1",
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

          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="equipo-link" style={{ display: "block", marginBottom: "0.5rem" }}>
              <strong>Equipo:</strong>
            </label>
            <div id="equipo-link" style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <Link href={`/equipos/${equipo.id}`} style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "white", gap: "0.75rem" }}>
                <img
                  src={`https://cdn.nba.com/logos/nba/${equipo.id}/global/L/logo.svg`}
                  alt={`Logo de ${equipo.nombre}`}
                  style={{
                    width: "45px",
                    height: "45px",
                    objectFit: "contain",
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #444",
                  }}
                  onError={(e) => {
                    e.target.src = "/placeholder-team.png";
                  }}
                />
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#fff", transition: "color 0.3s" }}>
                  {equipo.nombre}
                </span>
              </Link>
            </div>

            <label htmlFor="temporada-select" style={{ display: "block", marginBottom: "0.5rem" }}>
              <strong>Temporada:</strong>
            </label>
            <select
              id="temporada-select"
              value={temporadaId}
              onChange={(e) => setTemporadaId(parseInt(e.target.value))}
              style={{
                width: "150px",
                backgroundColor: "#222",
                color: "#fff",
                padding: "0.4rem 0.6rem",
                borderRadius: "6px",
                border: "1px solid #555",
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              {temporadas.map((temp) => (
                <option key={temp.id} value={temp.id}>
                  {temp.nombre}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div style={{ marginTop: "1rem" }}>
              <BotonLesionConEstado jugadorId={jugadorId} />
            </div>
          )}
        </div>
      </div>

      {/* ESTADÍSTICAS Y PARTIDOS */}
      <div style={{ marginTop: "3rem" }}>
        {estadisticas ? (
          <>
            <DataTableJugador data={[estadisticas]} />
            {media && (
              <GraficoComparativoJugadorMedia estadisticas={estadisticas} media={media} />
            )}
          </>
        ) : (
          <div style={{ padding: "2rem", backgroundColor: "#1a1a1a", color: "#fff", borderRadius: "10px", textAlign: "center", marginBottom: "2rem" }}>
            <p style={{ fontSize: "1.1rem", margin: 0 }}>
              No se encontraron estadísticas avanzadas para el jugador y temporada seleccionados.
            </p>
          </div>
        )}

        {partidos.length > 0 ? (
          <DataTablePartido data={partidos} />
        ) : (
          <div style={{ padding: "2rem", backgroundColor: "#1a1a1a", color: "#fff", borderRadius: "10px", textAlign: "center", marginTop: "1rem" }}>
            <p style={{ fontSize: "1.1rem", margin: 0 }}>
              No se encontraron partidos para esta temporada.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}