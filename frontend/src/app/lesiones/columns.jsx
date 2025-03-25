"use client";

// Array con las definiciones de columnas para lesiones
export const columns = [
  {
    accessorKey: "jugador", // Ahora se mostrará el nombre del jugador
    header: "Jugador",
  },
  {
    accessorKey: "tipo_lesion",
    header: "Tipo de Lesión",
  },
  {
    accessorKey: "fecha_recuperacion_estimada",
    header: "Fecha de Recuperación",
  },
];
