"use client";

import React, { useEffect, useState } from "react";
import { getEquipos } from "@/services/equiposService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros; por defecto, orden es "asc"
  const [conferencia, setConferencia] = useState("");
  const [division, setDivision] = useState("");
  const [orden, setOrden] = useState("asc");

  // Opciones de división según la conferencia seleccionada
  const divisionsByConference = {
    Este: ["Atlántico", "Central", "Sudeste"],
    Oeste: ["Sudoeste", "Noroeste", "Pacífico"],
  };

  // Todas las divisiones disponibles
  const allDivisions = [
    "Atlántico",
    "Central",
    "Sudeste",
    "Sudoeste",
    "Noroeste",
    "Pacífico",
  ];

  // Si se selecciona conferencia, se muestran divisiones correspondientes; si no, se muestran todas.
  const divisionOptions =
    conferencia && divisionsByConference[conferencia]
      ? ["", ...divisionsByConference[conferencia]]
      : ["", ...allDivisions];

  // Función para obtener los equipos desde la API con filtros
  const fetchEquipos = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getEquipos(filters);
      setEquipos(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar filtros guardados en localStorage al inicio (por defecto, orden: "asc")
  useEffect(() => {
    const savedConferencia = localStorage.getItem("conferencia") || "";
    const savedDivision = localStorage.getItem("division") || "";
    const savedOrden = localStorage.getItem("orden") || "asc";
    setConferencia(savedConferencia);
    setDivision(savedDivision);
    setOrden(savedOrden);
    fetchEquipos({ conferencia: savedConferencia, division: savedDivision, orden: savedOrden });
  }, []);

  // Guardar filtros en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem("conferencia", conferencia);
    localStorage.setItem("division", division);
    localStorage.setItem("orden", orden);
  }, [conferencia, division, orden]);

  // Manejo del envío del formulario de filtros
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchEquipos({ conferencia, division, orden });
  };

  // Función para resetear filtros a su estado inicial (orden: "asc")
  const handleReset = () => {
    setConferencia("");
    setDivision("");
    setOrden("asc");
    fetchEquipos({ orden: "asc" });
  };

  // Al cambiar la conferencia, resetea la división
  const handleConferenciaChange = (e) => {
    setConferencia(e.target.value);
    setDivision("");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Encabezado degradado (negro → rojo) con texto en blanco */}
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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Equipos</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Filtra, ordena y explora los equipos de la NBA
        </p>
      </div>

      {/* Formulario de filtros */}
      <form
        onSubmit={handleFilterSubmit}
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
          Conferencia:
          <select
            value={conferencia}
            onChange={handleConferenciaChange}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
              marginLeft: "0.5rem",
            }}
          >
            <option value="">Todas</option>
            <option value="Este">Este</option>
            <option value="Oeste">Oeste</option>
          </select>
        </label>

        <label style={{ color: "#fff" }}>
          División:
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
              marginLeft: "0.5rem",
            }}
          >
            {divisionOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt === "" ? "Todas" : opt}
              </option>
            ))}
          </select>
        </label>

        <label style={{ color: "#fff" }}>
          Orden:
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
              marginLeft: "0.5rem",
            }}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </label>

        <button
          type="submit"
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "red")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000")}
        >
          Filtrar
        </button>
        <button
          type="button"
          onClick={handleReset}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "red")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000")}
        >
          Resetear Filtros
        </button>
      </form>

      {/* Tabla de equipos con scroll vertical */}
      <section
        style={{
          maxHeight: "400px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Conferencia</TableHead>
              <TableHead>División</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipos.map((equipo) => (
              <TableRow key={equipo.id}>
                <TableCell>{equipo.nombre}</TableCell>
                <TableCell>{equipo.conferencia}</TableCell>
                <TableCell>{equipo.division}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
