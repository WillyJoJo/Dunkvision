"use client";

import Link from "next/link";

// columns.jsx
// Array con las definiciones de columnas para jugadores
export const columns = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const jugador = row.original;
      return (
        <Link href={`/jugadores/${jugador.id}`}>
          <span style={{ color: "#2563eb", cursor: "pointer" }}>
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
    accessorKey: "posicion",
    header: "Posición",
  },
];
