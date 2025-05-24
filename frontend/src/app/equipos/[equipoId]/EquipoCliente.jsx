"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJugadoresByEquipoId } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import {
  getEstadisticasAvanzadasEquipoByEquipoIdTemporadaId,
  getMediaEstadisticasAvanzadasEquipoByTemporadaId,
} from "@/services/estadisticasAvanzadasEquipoService";
import { getTemporadas } from "@/services/temporadasService";
import { DataTable } from "./data-table";
import { DataTableEquipo } from "./data-table-equipo";
import { columns } from "./columns";
import GraficoComparativoEquipoMedia from "@/components/ui/GraficoComparativoEquipoMedia";

export default function EquipoCliente({ equipoId }) {
  const [jugadores, setJugadores] = useState([]);
  const [equipo, setEquipo] = useState(null);
  const [estadisticas, setEstadisticas] = useState([]);
  const [media, setMedia] = useState(null);
  const [temporadas, setTemporadas] = useState([]);
  const [temporadaId, setTemporadaId] = useState(24);
  const router = useRouter();

  useEffect(() => {
    async function fetchInicial() {
      const [equipoData, jugadoresData, temporadasData] = await Promise.all([
        getEquiposById(equipoId),
        getJugadoresByEquipoId(equipoId),
        getTemporadas(),
      ]);

      const jugadoresConPos = jugadoresData.map((jugador) => ({
        ...jugador,
        posicionCompleta: convertirPosicion(jugador.posicion),
      }));

      setEquipo(equipoData);
      setJugadores(jugadoresConPos);
      setTemporadas(temporadasData);
    }

    fetchInicial();
  }, [equipoId]);

  useEffect(() => {
    async function fetchEstadisticas() {
      const [equipoStats, mediaStats] = await Promise.all([
        getEstadisticasAvanzadasEquipoByEquipoIdTemporadaId(equipoId, temporadaId),
        getMediaEstadisticasAvanzadasEquipoByTemporadaId(temporadaId),
      ]);
      setEstadisticas(equipoStats ? [equipoStats] : []);
      setMedia(mediaStats);
    }

    if (temporadaId && equipoId) {
      fetchEstadisticas();
    }
  }, [equipoId, temporadaId]);

  const convertirPosicion = (pos) => {
    if (!pos) return "Desconocida";

    const mapaPosiciones = {
      G: "Base / Escolta",
      F: "Alero / Ala-Pívot",
      C: "Pívot",
    };

    const posicionesTraducidas = pos
      .split("-")
      .map((letra) => mapaPosiciones[letra] || "Desconocida");

    return posicionesTraducidas.join(" - ");
  };

  const handleRowClick = (row) => {
    const jugadorId = row.original.id;
    router.push(`/jugadores/${jugadorId}`);
  };

  return (
    <div style={{ padding: "2rem", color: "#fff" }}>
      {/* Encabezado del equipo */}
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          padding: "1.5rem 2rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          maxWidth: "800px",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {equipo && (
          <img
            src={`https://cdn.nba.com/logos/nba/${equipo.id}/global/L/logo.svg`}
            alt="Logo Equipo"
            style={{
              width: "90px",
              height: "90px",
              objectFit: "contain",
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "0.5rem",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-logo.svg";
            }}
          />
        )}
        <div>
          <h2 style={{ margin: 0, fontSize: "2.2rem" }}>
            {equipo ? equipo.nombre : "Cargando equipo..."}
          </h2>
          {equipo && (
            <p style={{ margin: "0.5rem 0 0 0", fontSize: "1.2rem" }}>
              {equipo.conferencia} | División {equipo.division}
            </p>
          )}
        </div>
      </div>

      {/* Selector de temporada */}
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <label
          htmlFor="temporada-select"
          style={{
            fontSize: "1rem",
            color: "#888",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Temporada:
        </label>
        <select
          id="temporada-select"
          value={temporadaId}
          onChange={(e) => setTemporadaId(parseInt(e.target.value))}
          style={{
            backgroundColor: "#111",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #333",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            outline: "none",
            appearance: "none",
            backgroundImage: "url('/icons/dropdown-icon.svg')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px top 50%",
            backgroundSize: "12px",
          }}
        >
          {temporadas.map((temp) => (
            <option key={temp.id} value={temp.id}>
              {temp.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de estadísticas */}
      {estadisticas.length > 0 ? (
        <div style={{ marginBottom: "3rem" }}>
          <DataTableEquipo data={estadisticas} />
          <GraficoComparativoEquipoMedia estadisticas={estadisticas[0]} media={media} />
        </div>
      ) : (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#1a1a1a",
            borderRadius: "10px",
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          <p style={{ fontSize: "1.1rem", margin: 0 }}>
            No se encontraron estadísticas avanzadas para este equipo en la temporada seleccionada.
          </p>
        </div>
      )}

      {/* Tabla de jugadores */}
      <DataTable columns={columns} data={jugadores} onRowClick={handleRowClick} />
    </div>
  );
}