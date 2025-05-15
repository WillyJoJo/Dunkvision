"use client";

import Link from "next/link";

export const columns = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    tooltip: "Nombre del Jugador",
    cell: ({ row }) => {
      const jugador = row.original;
      return (
        <div className="flex items-center gap-2">
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/260x190/${jugador.jugador_id}.png`}
            alt={jugador.nombre}
            className="w-10 h-10 object-cover rounded bg-white"
            onError={(e) => {
              e.target.src = "/placeholder-player.png";
            }}
          />
          <Link href={`/jugadores/${jugador.jugador_id}`}>
            <span className="text-blue-500 underline hover:font-bold">
              {jugador.nombre}
            </span>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "equipo",
    header: "Equipo",
    tooltip: "Equipo del Jugador",
    cell: ({ row }) => {
      const { equipo, equipo_id } = row.original;

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img
            src={`https://cdn.nba.com/logos/nba/${equipo_id}/global/L/logo.svg`}
            alt="Logo Equipo"
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              borderRadius: "6px",
              backgroundColor: "#fff",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-logo.svg";
            }}
          />
          <span>{equipo}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "minutos_jugados",
    header: "MIN",
    tooltip: "Minutos Jugados",
    numeric: true,
  },
  {
    accessorKey: "puntos",
    header: "PTS",
    tooltip: "Puntos",
    numeric: true,
  },
  {
    accessorKey: "asistencias",
    header: "AST",
    tooltip: "Asistencias",
    numeric: true,
  },
  {
    accessorKey: "rebotes_ofensivos",
    header: "RO",
    tooltip: "Rebotes Ofensivos",
    numeric: true,
  },
  {
    accessorKey: "rebotes_defensivos",
    header: "RD",
    tooltip: "Rebotes Defensivos",
    numeric: true,
  },
  {
    accessorKey: "robos",
    header: "STL",
    tooltip: "Robos",
    numeric: true,
  },
  {
    accessorKey: "tapones",
    header: "BLK",
    tooltip: "Tapones",
    numeric: true,
  },
  {
    accessorKey: "perdidas_balon",
    header: "PERD",
    tooltip: "Pérdidas de Balón",
    numeric: true,
  },
  {
    accessorKey: "faltas_cometidas",
    header: "FAL",
    tooltip: "Faltas Cometidas",
    numeric: true,
  },
  {
    accessorKey: "porcentaje_tiros_de_campo",
    header: "FG%",
    tooltip: "Porcentaje de Tiros de Campo",
    numeric: true,
    cell: ({ row }) => {
      const value = row.original.porcentaje_tiros_de_campo;
      return value !== undefined && value !== null
        ? `${(value * 100).toFixed(1)}%`
        : "N/A";
    },
  },
  {
    accessorKey: "porcentaje_triples",
    header: "3P%",
    tooltip: "Porcentaje de Triples",
    numeric: true,
    cell: ({ row }) => {
      const value = row.original.porcentaje_triples;
      return value !== undefined && value !== null
        ? `${(value * 100).toFixed(1)}%`
        : "N/A";
    },
  },
  {
    accessorKey: "porcentaje_tiros_libres",
    header: "FT%",
    tooltip: "Porcentaje de Tiros Libres",
    numeric: true,
    cell: ({ row }) => {
      const value = row.original.porcentaje_tiros_libres;
      return value !== undefined && value !== null
        ? `${(value * 100).toFixed(1)}%`
        : "N/A";
    },
  },
];