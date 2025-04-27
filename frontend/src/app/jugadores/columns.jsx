"use client";

import Link from "next/link";

export const columns = [
  {
    accessorKey: "foto",
    header: "Foto",
    cell: ({ row }) => {
      const jugador = row.original;
      return (
        <img
          src={`https://cdn.nba.com/headshots/nba/latest/260x190/${jugador.id}.png`}
          alt={jugador.nombre}
          style={{ width: "50px", height: "auto", borderRadius: "8px" }}
          onError={(e) => {
            e.target.src = "/placeholder-player.png";
          }}
        />
      );
    },
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const jugador = row.original;
      return (
        <Link href={`/jugadores/${jugador.id}`}>
          <span
            style={{
              color: "#2563eb",
              cursor: "pointer",
              textDecoration: "underline",
              fontWeight: "normal",
            }}
            onMouseEnter={(e) => {
              e.target.style.fontWeight = "bold";
            }}
            onMouseLeave={(e) => {
              e.target.style.fontWeight = "normal";
            }}
          >
            {jugador.nombre}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "nombre_equipo",
    header: "Equipo",
  },
  {
    accessorKey: "posicionCompleta",
    header: "Posición",
    cell: ({ row }) => <div>{row.getValue("posicionCompleta")}</div>,
  },
];