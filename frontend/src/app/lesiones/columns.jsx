import { format } from "date-fns";
import Link from "next/link";

export const columns = [
  {
    accessorKey: "jugador",
    header: "Jugador",
    cell: ({ row }) => {
      const jugador = row.original;
      return (
        <Link href={`/jugadores/${jugador.jugador_id}`}>
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
            {jugador.jugador}
          </span>
        </Link>
      );
    },
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
