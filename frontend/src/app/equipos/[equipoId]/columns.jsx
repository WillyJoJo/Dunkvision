"use client";

export const columns = [
  {
    accessorKey: "nombre",
    header: "Nombre",
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
              e.target.src = "/placeholder-player.png"; // Fallback si no hay foto
            }}
          />
          <span>{jugador.nombre}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "posicionCompleta",
    header: "Posición",
  },
];
