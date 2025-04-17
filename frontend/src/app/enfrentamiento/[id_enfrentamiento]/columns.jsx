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
  },
  {
    accessorKey: "puntos",
    header: "PTS",
    tooltip: "Puntos",
  },
  {
    accessorKey: "asistencias",
    header: "AST",
    tooltip: "Asistencias",
  },
  {
    accessorKey: "rebotes_ofensivos",
    header: "RO",
    tooltip: "Rebotes Ofensivos",
  },
  {
    accessorKey: "rebotes_defensivos",
    header: "RD",
    tooltip: "Rebotes Defensivos",
  },
  {
    accessorKey: "robos",
    header: "STL",
    tooltip: "Robos",
  },
  {
    accessorKey: "tapones",
    header: "BLK",
    tooltip: "Tapones",
  },
  {
    accessorKey: "perdidas_balon",
    header: "PERD",
    tooltip: "Pérdidas de Balón",
  },
  {
    accessorKey: "faltas_cometidas",
    header: "FAL",
    tooltip: "Faltas Cometidas",
  },
  {
    accessorKey: "porcentaje_tiros_de_campo",
    header: "FG%",
    tooltip: "Porcentaje de Tiros de Campo",
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
    cell: ({ row }) => {
      const value = row.original.porcentaje_tiros_libres;
      return value !== undefined && value !== null
        ? `${(value * 100).toFixed(1)}%`
        : "N/A";
    },
  },
];