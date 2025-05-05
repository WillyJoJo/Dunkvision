"use client";

import { format } from "date-fns";
import { Trophy } from "lucide-react";

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
      const ganador = row.original.puntosLocal > row.original.puntosVisitante;
      return (
        <span
          style={{
            color: esMiEquipo ? "#00e676" : "inherit",
            fontWeight: esMiEquipo ? "bold" : "normal",
          }}
        >
          {row.original.equipoLocal} {ganador && <Trophy size={14} style={{ marginLeft: 4 }} />}
        </span>
      );
    },
  },
  {
    accessorKey: "equipoVisitante",
    header: "Equipo Visitante",
    tooltip: "Equipo Visitante",
    cell: ({ row }) => {
      const esMiEquipo = row.original.equipo_id === row.original.equipoVisitanteId;
      const ganador = row.original.puntosVisitante > row.original.puntosLocal;
      return (
        <span
          style={{
            color: esMiEquipo ? "#00e676" : "inherit",
            fontWeight: esMiEquipo ? "bold" : "normal",
          }}
        >
          {row.original.equipoVisitante} {ganador && <Trophy size={14} style={{ marginLeft: 4 }} />}
        </span>
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