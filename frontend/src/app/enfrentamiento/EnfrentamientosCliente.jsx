"use client";

import { useEffect, useState } from "react";
import { getEnfrentamientos } from "@/services/enfrentamientosService";
import { getEquipos } from "@/services/equiposService";
import { columns as rawColumns } from "./columns";
import { DataTable } from "./data-table";
import SimpleDateRangePicker from "@/components/ui/simple-date-range-picker";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function EnfrentamientosCliente() {
  const [enfrentamientos, setEnfrentamientos] = useState([]);
  const [nombreEquipo, setNombreEquipo] = useState("");
  const [range, setRange] = useState(undefined);
  const [filtros, setFiltros] = useState({
    nombreEquipo: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  const router = useRouter();

  const sumarDias = (fecha, dias) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha.toISOString().split("T")[0];
  };

  useEffect(() => {
    async function fetchData() {
      const [enfrentamientosData, equiposData] = await Promise.all([
        getEnfrentamientos(),
        getEquipos(),
      ]);

      const equiposMap = {};
      equiposData.forEach((eq) => {
        equiposMap[eq.id] = eq.nombre;
      });

      const enfrentamientosConNombres = enfrentamientosData.map((e) => ({
        ...e,
        equipo_local: equiposMap[e.equipo_local] || `ID ${e.equipo_local}`,
        equipo_visitante: equiposMap[e.equipo_visitante] || `ID ${e.equipo_visitante}`,
      }));

      setEnfrentamientos(enfrentamientosConNombres);
    }

    fetchData();
  }, []);

  const enfrentamientosFiltrados = enfrentamientos.filter((e) => {
    const local = String(e.equipo_local || "").toLowerCase();
    const visitante = String(e.equipo_visitante || "").toLowerCase();
    const match = (local + visitante).includes(filtros.nombreEquipo);

    const fecha = new Date(e.fecha);
    const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

    const hastaIncluyendoDia = hasta ? new Date(hasta) : null;
    if (hastaIncluyendoDia) {
      hastaIncluyendoDia.setDate(hastaIncluyendoDia.getDate() + 1);
    }

    const desdeOk = !desde || fecha >= desde;
    const hastaOk = !hastaIncluyendoDia || fecha < hastaIncluyendoDia;

    return match && desdeOk && hastaOk;
  });

  const columns = rawColumns.map((col) => {
    if (col.accessorKey === "fecha") {
      return {
        ...col,
        cell: ({ row }) => format(new Date(row.original.fecha), "dd/MM/yyyy"),
      };
    }
    return col;
  });

  const handleRowClick = (row) => {
    const id_enfrentamiento = row.original.id;
    router.push(`/enfrentamiento/${id_enfrentamiento}`);
  };

  return (
    <div>
      {/* Encabezado */}
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Partidos</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Visualiza los enfrentamientos con sus resultados.
        </p>
      </div>

      {/* Filtros */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFiltros({
            nombreEquipo: nombreEquipo.trim().toLowerCase(),
            fechaDesde: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            fechaHasta: range?.to ? format(range.to, "yyyy-MM-dd") : "",
          });
        }}
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          backgroundColor: "#000",
          padding: "1rem",
          borderRadius: "4px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ color: "#fff" }}>
          Equipo:
          <input
            type="text"
            value={nombreEquipo}
            onChange={(e) => setNombreEquipo(e.target.value)}
            placeholder="Ej: Lakers"
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          />
        </label>

        <SimpleDateRangePicker range={range} setRange={setRange} />

        <button
          type="submit"
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "red")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000")}
        >
          Filtrar
        </button>

        <button
          type="button"
          onClick={() => {
            setNombreEquipo("");
            setRange(undefined);
            setFiltros({
              nombreEquipo: "",
              fechaDesde: "",
              fechaHasta: "",
            });
          }}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "red")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000")}
        >
          Resetear
        </button>
      </form>

      {/* Tabla */}
      <DataTable columns={columns} data={enfrentamientosFiltrados} onRowClick={handleRowClick} />
    </div>
  );
}