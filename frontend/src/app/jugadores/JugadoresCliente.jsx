"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJugadores } from "@/services/jugadoresService";
import { getEquipos } from "@/services/equiposService";
import { DataTable } from "./data-table";

export default function JugadoresCliente() {
  const [busqueda, setBusqueda] = useState("");
  const [equipo, setEquipo] = useState("");
  const [posicion, setPosicion] = useState("");
  const [equipos, setEquipos] = useState([]);

  const [submittedFilters, setSubmittedFilters] = useState({
    busqueda: "",
    equipo: "",
    posicion: "",
  });

  const posicionOptions = ["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"];

  const transformPosicion = (pos) => {
    if (pos === "Base" || pos === "Escolta") return "G";
    if (pos === "Alero" || pos === "Ala-Pívot") return "F";
    if (pos === "Pívot") return "C";
    return "";
  };

  const convertirPosicion = (pos) => {
    if (!pos) return "Desconocida";

    const mapaPosiciones = {
      G: "Base / Escolta",
      F: "Alero / Ala-Pívot",
      C: "Pívot",
    };

    const posicionesTraducidas = pos
      .split("-")
      .map((letra) => mapaPosiciones[letra] || "Desconocida");

    return posicionesTraducidas.join(" - ");
  };

  const { data: jugadores, error, isLoading, refetch } = useQuery({
    queryKey: ["jugadores", submittedFilters],
    queryFn: () =>
      getJugadores({
        busqueda: submittedFilters.busqueda,
        equipo: submittedFilters.equipo,
        posicion: transformPosicion(submittedFilters.posicion),
      }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  useEffect(() => {
    async function fetchEquipos() {
      const equiposData = await getEquipos();
      setEquipos(equiposData);
    }

    fetchEquipos();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    setSubmittedFilters({
      busqueda,
      equipo,
      posicion,
    });

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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Jugadores</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Filtra y explora los jugadores de la NBA
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
        }}
      >
        <label style={{ color: "#fff" }}>
          Buscar:
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre o apellido"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
              marginLeft: "0.5rem",
            }}
          />
        </label>

        <label style={{ color: "#fff" }}>
          Equipo:
          <select
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
              marginLeft: "0.5rem",
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
          Posición:
          <select
            value={posicion}
            onChange={(e) => setPosicion(e.target.value)}
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
            {posicionOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
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
      </form>

      <DataTable
        jugadores={(jugadores || []).map((jugador) => ({
          ...jugador,
          posicionCompleta: convertirPosicion(jugador.posicion),
        }))}
      />
    </div>
  );
}