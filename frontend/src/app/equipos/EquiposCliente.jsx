"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEquipos } from "@/services/equiposService";
import { DataTable } from "./data-table";

export default function EquiposCliente() {
  const [conferencia, setConferencia] = useState("");
  const [division, setDivision] = useState("");
  const [orden, setOrden] = useState("asc");

  const [submittedFilters, setSubmittedFilters] = useState({
    conferencia: "",
    division: "",
    orden: "asc",
  });

  const divisionsByConference = {
    Este: ["Atlántico", "Central", "Sudeste"],
    Oeste: ["Sudoeste", "Noroeste", "Pacífico"],
  };

  const allDivisions = [
    "Atlántico",
    "Central",
    "Sudeste",
    "Sudoeste",
    "Noroeste",
    "Pacífico",
  ];

  const divisionOptions =
    conferencia && divisionsByConference[conferencia]
      ? ["", ...divisionsByConference[conferencia]]
      : ["", ...allDivisions];

  useEffect(() => {
    const savedConferencia = localStorage.getItem("conferencia") || "";
    const savedDivision = localStorage.getItem("division") || "";
    const savedOrden = localStorage.getItem("orden") || "asc";
    setConferencia(savedConferencia);
    setDivision(savedDivision);
    setOrden(savedOrden);
    setSubmittedFilters({
      conferencia: savedConferencia,
      division: savedDivision,
      orden: savedOrden,
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("conferencia", conferencia);
    localStorage.setItem("division", division);
    localStorage.setItem("orden", orden);
  }, [conferencia, division, orden]);

  const { data: equipos = [], error, isLoading, refetch } = useQuery({
    queryKey: ["equipos", submittedFilters],
    queryFn: () => getEquipos(submittedFilters),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setSubmittedFilters({
      conferencia,
      division,
      orden,
    });
    refetch();
  };

  const handleReset = () => {
    setConferencia("");
    setDivision("");
    setOrden("asc");
    setSubmittedFilters({
      conferencia: "",
      division: "",
      orden: "asc",
    });
    refetch();
  };

  const handleConferenciaChange = (e) => {
    setConferencia(e.target.value);
    setDivision("");
  };

  const handleSortChange = () => {
    const newOrden = orden === "asc" ? "desc" : "asc";
    setOrden(newOrden);
    setSubmittedFilters((prev) => ({
      ...prev,
      orden: newOrden,
    }));
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Equipos</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Filtra, ordena y explora los equipos de la NBA
        </p>
      </div>

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

      <DataTable
        equipos={equipos}
        orden={orden}
        onSortChange={handleSortChange}
      />
    </div>
  );
}