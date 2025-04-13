export const columns = [
    {
      accessorKey: "fecha",
      header: "Fecha",
      cell: ({ row }) => {
        const date = new Date(row.original.fecha);
        return date.toLocaleDateString();
      },
    },
    {
      id: "equipo_local",
      header: "Equipo Local",
      cell: ({ row }) => {
        const { equipo_local, puntos_local, puntos_visitante } = row.original;
  
        const esEmpate = puntos_local === puntos_visitante;
        const esGanador = puntos_local > puntos_visitante;
  
        const color = esEmpate ? "#888" : esGanador ? "green" : "red";
  
        return <span style={{ color }}>{equipo_local}</span>;
      },
    },
    {
      id: "equipo_visitante",
      header: "Equipo Visitante",
      cell: ({ row }) => {
        const { equipo_visitante, puntos_local, puntos_visitante } = row.original;
  
        const esEmpate = puntos_local === puntos_visitante;
        const esGanador = puntos_visitante > puntos_local;
  
        const color = esEmpate ? "#888" : esGanador ? "green" : "red";
  
        return <span style={{ color }}>{equipo_visitante}</span>;
      },
    },
    {
      accessorKey: "puntos_local",
      header: "Puntos Local",
    },
    {
      accessorKey: "puntos_visitante",
      header: "Puntos Visitante",
    },
  ];
  