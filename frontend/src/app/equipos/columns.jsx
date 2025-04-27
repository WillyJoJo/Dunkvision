"use client";

export const columns = [
  {
    accessorKey: "nombre",
    header: "Equipo",
    cell: ({ row }) => {
      const id = row.original.id;
      const nombre = row.original.nombre;
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flexShrink: 0, width: "40px", height: "40px" }}>
            <img
              src={`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`}
              alt="Logo Equipo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src = "/placeholder-logo.svg"; // opcional
              }}
            />
          </div>
          <div style={{ paddingLeft: "0.75rem" }}>
            {nombre}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "conferencia",
    header: "Conferencia",
  },
  {
    accessorKey: "division",
    header: "División",
  },
];
