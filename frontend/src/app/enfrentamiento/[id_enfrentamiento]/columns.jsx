"use client";

export const columns = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    tooltip: "Nombre del Jugador",
  },
  {
    accessorKey: "equipo",
    header: "Equipo",
    tooltip: "Equipo del Jugador",
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