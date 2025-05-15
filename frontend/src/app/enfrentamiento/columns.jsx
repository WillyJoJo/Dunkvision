import { format } from "date-fns";

export const columns = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.original.fecha);
      return format(date, "dd/MM/yyyy");
    },
  },
  {
    id: "equipo_local",
    header: "Equipo Local",
    cell: ({ row }) => {
      const {
        equipo_local,
        equipo_local_id,
        puntos_local,
        puntos_visitante,
      } = row.original;

      const esGanador = puntos_local > puntos_visitante;
      const color = esGanador ? "green" : "red";

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img
            src={`https://cdn.nba.com/logos/nba/${equipo_local_id}/global/L/logo.svg`}
            alt={equipo_local}
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              backgroundColor: "#fff",
              borderRadius: "6px",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-logo.svg";
            }}
          />
          <span style={{ color }}>{equipo_local}</span>
        </div>
      );
    },
  },
  {
    id: "equipo_visitante",
    header: "Equipo Visitante",
    cell: ({ row }) => {
      const {
        equipo_visitante,
        equipo_visitante_id,
        puntos_local,
        puntos_visitante,
      } = row.original;

      const esGanador = puntos_visitante > puntos_local;
      const color = esGanador ? "green" : "red";

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img
            src={`https://cdn.nba.com/logos/nba/${equipo_visitante_id}/global/L/logo.svg`}
            alt={equipo_visitante}
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              backgroundColor: "#fff",
              borderRadius: "6px",
            }}
            onError={(e) => {
              e.target.src = "/placeholder-logo.svg";
            }}
          />
          <span style={{ color }}>{equipo_visitante}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "puntos_local",
    header: "Puntos Local",
    numeric: true,
  },
  {
    accessorKey: "puntos_visitante",
    header: "Puntos Visitante",
    numeric: true,
  },
];