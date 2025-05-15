"use client";

import Link from "next/link";

export const columns = [
  {
    accessorKey: "nombre",
    header: "Jugador",
    cell: ({ row }) => {
      const jugador = row.original;
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/260x190/${jugador.id}.png`}
            alt={jugador.nombre}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              borderRadius: "8px",
              backgroundColor: "#fff",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-player.png";
            }}
          />
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
        </div>
      );
    },
  },
  {
    accessorKey: "nombre_equipo",
    header: "Equipo",
    cell: ({ row }) => {
      const equipoId = row.original.equipo_id;
      const nombreEquipo = row.original.nombre_equipo;

      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, width: "36px", height: "36px" }}>
            <img
              src={`https://cdn.nba.com/logos/nba/${equipoId}/global/L/logo.svg`}
              alt="Logo Equipo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src = "/placeholder-logo.svg";
              }}
            />
          </div>
          <div style={{ paddingLeft: "0.75rem" }}>
            <Link href={`/equipos/${equipoId}`}>
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
                {nombreEquipo}
              </span>
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "posicionCompleta",
    header: "Posición",
    cell: ({ row }) => <div>{row.getValue("posicionCompleta")}</div>,
  },
];