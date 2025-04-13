import { format } from "date-fns";

export const columns = [
  {
    accessorKey: "jugador",
    header: "Jugador",
  },
  {
    accessorKey: "tipo_lesion",
    header: "Tipo de Lesión",
  },
  {
    accessorKey: "fecha_recuperacion_estimada",
    header: "Fecha Recuperación",
    cell: ({ row }) => {
      const raw = row.original.fecha_recuperacion_estimada;
      if (!raw) return "";
      const fecha = new Date(raw);
      return format(fecha, "dd/MM/yyyy");
    },
  },
];
