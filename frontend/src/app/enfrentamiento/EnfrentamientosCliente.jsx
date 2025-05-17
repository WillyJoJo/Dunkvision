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
  const [equipos, setEquipos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [modoBusqueda, setModoBusqueda] = useState("todos"); // "todos" | "local" | "visitante"
  const [range, setRange] = useState(undefined);
  const [filtros, setFiltros] = useState({
    equipoId: "",
    fechaDesde: "",
    fechaHasta: "",
    modoBusqueda: "todos",
  });

  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [enfrentamientosData, equiposData] = await Promise.all([
        getEnfrentamientos(),
        getEquipos(),
      ]);

      setEquipos(equiposData);

      const equiposMap = {};
      equiposData.forEach((eq) => {
        equiposMap[eq.id] = eq.nombre;
      });

      const enfrentamientosConNombres = enfrentamientosData.map((e) => ({
        ...e,
        equipo_local_id: e.equipo_local,
        equipo_visitante_id: e.equipo_visitante,
        equipo_local: equiposMap[e.equipo_local] || `ID ${e.equipo_local}`,
        equipo_visitante: equiposMap[e.equipo_visitante] || `ID ${e.equipo_visitante}`,
      }));

      setEnfrentamientos(enfrentamientosConNombres);
    }

    fetchData();
  }, []);

  const enfrentamientosFiltrados = enfrentamientos.filter((e) => {
    const fecha = new Date(e.fecha);
    const desde = filtros.fechaDesde ? new Date(filtros.fechaDesde) : null;
    const hasta = filtros.fechaHasta ? new Date(filtros.fechaHasta) : null;

    const hastaIncluyendoDia = hasta ? new Date(hasta) : null;
    if (hastaIncluyendoDia) {
      hastaIncluyendoDia.setDate(hastaIncluyendoDia.getDate() + 1);
    }

    const desdeOk = !desde || fecha >= desde;
    const hastaOk = !hastaIncluyendoDia || fecha < hastaIncluyendoDia;

    const equipoId = filtros.equipoId;

    let matchEquipo = true;
    if (equipoId) {
      if (filtros.modoBusqueda === "local") {
        matchEquipo = e.equipo_local_id === equipoId;
      } else if (filtros.modoBusqueda === "visitante") {
        matchEquipo = e.equipo_visitante_id === equipoId;
      } else {
        matchEquipo =
          e.equipo_local_id === equipoId || e.equipo_visitante_id === equipoId;
      }
    }

    return matchEquipo && desdeOk && hastaOk;
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

  const handleCheckboxChange = (modo) => {
    setModoBusqueda((prev) => (prev === modo ? "todos" : modo));
  };

  return (
    <div>
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFiltros({
            equipoId: equipoSeleccionado ? parseInt(equipoSeleccionado) : "",
            fechaDesde: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            fechaHasta: range?.to ? format(range.to, "yyyy-MM-dd") : "",
            modoBusqueda,
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
          <select
            value={equipoSeleccionado}
            onChange={(e) => setEquipoSeleccionado(e.target.value)}
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          >
            <option value="">Todos</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.nombre}
              </option>
            ))}
          </select>
        </label>

        <label style={{ color: "#fff" }}>
          <input
            type="checkbox"
            checked={modoBusqueda === "local"}
            onChange={() => handleCheckboxChange("local")}
            style={{ marginRight: "0.5rem" }}
          />
          Local
        </label>

        <label style={{ color: "#fff" }}>
          <input
            type="checkbox"
            checked={modoBusqueda === "visitante"}
            onChange={() => handleCheckboxChange("visitante")}
            style={{ marginRight: "0.5rem" }}
          />
          Visitante
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
            setEquipoSeleccionado("");
            setModoBusqueda("todos");
            setRange(undefined);
            setFiltros({
              equipoId: "",
              fechaDesde: "",
              fechaHasta: "",
              modoBusqueda: "todos",
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

      <DataTable columns={columns} data={enfrentamientosFiltrados} onRowClick={handleRowClick} />
    </div>
  );
}