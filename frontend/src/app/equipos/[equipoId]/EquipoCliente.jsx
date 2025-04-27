"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJugadoresByEquipoId } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function EquipoCliente({ equipoId }) {
  const [jugadores, setJugadores] = useState([]);
  const [equipo, setEquipo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [equipoData, jugadoresData] = await Promise.all([
        getEquiposById(equipoId),
        getJugadoresByEquipoId(equipoId),
      ]);

      const jugadoresConPos = jugadoresData.map((jugador) => ({
        ...jugador,
        posicionCompleta: convertirPosicion(jugador.posicion),
      }));

      setEquipo(equipoData);
      setJugadores(jugadoresConPos);
    }

    fetchData();
  }, [equipoId]);

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
    <div>
      {/* Encabezado del equipo */}
<div
  style={{
    background: "linear-gradient(135deg, #000 0%, #f00 100%)",
    color: "#fff",
    padding: "1.5rem 2rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    maxWidth: "800px", // Mantenemos el mismo ancho
    marginLeft: "0", // <-- Pegado a la izquierda
    marginRight: "auto", // <-- Solo "auto" a la derecha para que no se centre
    display: "flex",
    alignItems: "center",
    gap: "2rem",
  }}
>
  {equipo && (
    <div style={{ flexShrink: 0 }}>
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
          e.target.src = "/placeholder-logo.svg"; // fallback si falla
        }}
      />
    </div>
  )}
  <div style={{ textAlign: "left" }}>
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


      <DataTable columns={columns} data={jugadores} onRowClick={handleRowClick} />
    </div>
  );
}
