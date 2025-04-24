"use client";

import Link from "next/link";

export const columns = [
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