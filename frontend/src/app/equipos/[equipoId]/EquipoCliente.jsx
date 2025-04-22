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
          textAlign: "center",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "2rem" }}>
          {equipo ? equipo.nombre : "Cargando equipo..."}
        </h2>
        {equipo && (
          <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
            {equipo.conferencia} | División {equipo.division}
          </p>
        )}
      </div>

      <DataTable columns={columns} data={jugadores} onRowClick={handleRowClick} />
    </div>
  );
}
