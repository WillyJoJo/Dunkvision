"use client";

import { format } from "date-fns";

export const columnsPartido = [
  {
    accessorKey: "fecha",
    header: "Fecha",
    tooltip: "Fecha del Enfrentamiento",
    cell: ({ row }) => format(new Date(row.original.fecha), "dd/MM/yyyy"),
  },
  {
    accessorKey: "equipoLocal",
    header: "Equipo Local",
    tooltip: "Equipo Local",
    cell: ({ row }) => {
      const esMiEquipo = row.original.equipo_id === row.original.equipoLocalId;
      const ganoMiEquipo = esMiEquipo && row.original.puntosLocal > row.original.puntosVisitante;
      const perdioMiEquipo = esMiEquipo && row.original.puntosLocal < row.original.puntosVisitante;
      const color = ganoMiEquipo ? "#00e676" : perdioMiEquipo ? "#ff5252" : "inherit";
      const tooltip = ganoMiEquipo ? "Ganó" : perdioMiEquipo ? "Perdió" : "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color,
            fontWeight: esMiEquipo ? "bold" : "normal",
          }}
          title={tooltip}
        >
          <img
            src={`https://cdn.nba.com/logos/nba/${row.original.equipoLocalId}/global/L/logo.svg`}
            alt="logo"
            style={{ width: 24, height: 24, objectFit: "contain", backgroundColor: "#fff", borderRadius: 4 }}
            onError={(e) => {
              e.target.src = "/placeholder-logo.svg";
            }}
          />
          <span>{row.original.equipoLocal}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "equipoVisitante",
    header: "Equipo Visitante",
    tooltip: "Equipo Visitante",
    cell: ({ row }) => {
      const esMiEquipo = row.original.equipo_id === row.original.equipoVisitanteId;
      const ganoMiEquipo = esMiEquipo && row.original.puntosVisitante > row.original.puntosLocal;
      const perdioMiEquipo = esMiEquipo && row.original.puntosVisitante < row.original.puntosLocal;
      const color = ganoMiEquipo ? "#00e676" : perdioMiEquipo ? "#ff5252" : "inherit";
      const tooltip = ganoMiEquipo ? "Ganó" : perdioMiEquipo ? "Perdió" : "";

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color,
            fontWeight: esMiEquipo ? "bold" : "normal",
          }}
          title={tooltip}
        >
          <img
            src={`https://cdn.nba.com/logos/nba/${row.original.equipoVisitanteId}/global/L/logo.svg`}
            alt="logo"
            style={{ width: 24, height: 24, objectFit: "contain", backgroundColor: "#fff", borderRadius: 4 }}
            onError={(e) => {
              e.target.src = "/placeholder-logo.svg";
            }}
          />
          <span>{row.original.equipoVisitante}</span>
        </div>
      );
    },
  },
  { accessorKey: "puntosLocal", header: "PTS Local", tooltip: "Puntos del equipo local", numeric: true },
  { accessorKey: "puntosVisitante", header: "PTS Visitante", tooltip: "Puntos del equipo visitante", numeric: true },
  { accessorKey: "minutos_jugados", header: "MIN", tooltip: "Minutos Jugados", numeric: true },
  { accessorKey: "puntos", header: "PTS", tooltip: "Puntos", numeric: true },
  { accessorKey: "asistencias", header: "AST", tooltip: "Asistencias", numeric: true },
  { accessorKey: "rebotes_ofensivos", header: "RO", tooltip: "Rebotes Ofensivos", numeric: true },
  { accessorKey: "rebotes_defensivos", header: "RD", tooltip: "Rebotes Defensivos", numeric: true },
  { accessorKey: "robos", header: "STL", tooltip: "Robos", numeric: true },
  { accessorKey: "tapones", header: "BLK", tooltip: "Tapones", numeric: true },
  { accessorKey: "perdidas_balon", header: "PERD", tooltip: "Pérdidas de Balón", numeric: true },
  { accessorKey: "faltas_cometidas", header: "FAL", tooltip: "Faltas Cometidas", numeric: true },
  {
    accessorKey: "porcentaje_tiros_de_campo",
    header: "FG%",
    tooltip: "Porcentaje de Tiros de Campo",
    numeric: true,
    cell: ({ row }) => `${((row.original.porcentaje_tiros_de_campo ?? 0) * 100).toFixed(1)}%`,
  },
  {
    accessorKey: "porcentaje_triples",
    header: "3P%",
    tooltip: "Porcentaje de Triples",
    numeric: true,
    cell: ({ row }) => `${((row.original.porcentaje_triples ?? 0) * 100).toFixed(1)}%`,
  },
  {
    accessorKey: "porcentaje_tiros_libres",
    header: "FT%",
    tooltip: "Porcentaje de Tiros Libres",
    numeric: true,
    cell: ({ row }) => `${((row.original.porcentaje_tiros_libres ?? 0) * 100).toFixed(1)}%`,
  },
];