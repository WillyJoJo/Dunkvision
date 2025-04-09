"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJugadores } from "@/services/jugadoresService";
import { DataTable } from "./data-table";

export default function JugadoresCliente() {
  // Estados para los filtros (valores en el formulario)
  const [letraApellido, setLetraApellido] = useState("");
  const [equipo, setEquipo] = useState("");
  const [posicion, setPosicion] = useState("");

  // Estado para los filtros "enviados" (se usa en el query)
  const [submittedFilters, setSubmittedFilters] = useState({
    letra_apellido: "",
    equipo: "",
    posicion: "",
  });

  // Opciones para el select de Equipo (lista completa)
  const equipoOptions = [
    { id: 1610612737, nombre: "Atlanta Hawks" },
    { id: 1610612738, nombre: "Boston Celtics" },
    { id: 1610612739, nombre: "Cleveland Cavaliers" },
    { id: 1610612740, nombre: "New Orleans Pelicans" },
    { id: 1610612741, nombre: "Chicago Bulls" },
    { id: 1610612742, nombre: "Dallas Mavericks" },
    { id: 1610612743, nombre: "Denver Nuggets" },
    { id: 1610612744, nombre: "Golden State Warriors" },
    { id: 1610612745, nombre: "Houston Rockets" },
    { id: 1610612746, nombre: "Los Angeles Clippers" },
    { id: 1610612747, nombre: "Los Angeles Lakers" },
    { id: 1610612748, nombre: "Miami Heat" },
    { id: 1610612749, nombre: "Milwaukee Bucks" },
    { id: 1610612750, nombre: "Minnesota Timberwolves" },
    { id: 1610612751, nombre: "Brooklyn Nets" },
    { id: 1610612752, nombre: "New York Knicks" },
    { id: 1610612753, nombre: "Orlando Magic" },
    { id: 1610612754, nombre: "Indiana Pacers" },
    { id: 1610612755, nombre: "Philadelphia 76ers" },
    { id: 1610612756, nombre: "Phoenix Suns" },
    { id: 1610612757, nombre: "Portland Trail Blazers" },
    { id: 1610612758, nombre: "Sacramento Kings" },
    { id: 1610612759, nombre: "San Antonio Spurs" },
    { id: 1610612760, nombre: "Oklahoma City Thunder" },
    { id: 1610612761, nombre: "Toronto Raptors" },
    { id: 1610612762, nombre: "Utah Jazz" },
    { id: 1610612763, nombre: "Memphis Grizzlies" },
    { id: 1610612764, nombre: "Washington Wizards" },
    { id: 1610612765, nombre: "Detroit Pistons" },
    { id: 1610612766, nombre: "Charlotte Hornets" },
  ];

  // Opciones para el select de Posición
  const posicionOptions = ["Base", "Escolta", "Alero", "Ala-Pívot", "Pívot"];

  // Función para transformar la posición a la letra requerida
  const transformPosicion = (pos) => {
    if (pos === "Base" || pos === "Escolta") return "G";
    if (pos === "Alero" || pos === "Ala-Pívot") return "F";
    if (pos === "Pívot") return "C";
    return "";
  };

  // useQuery usa los filtros enviados para hacer la consulta.
  // Con keepPreviousData se mantiene la data previa mientras se carga la nueva consulta.
  const { data: jugadores, error, isLoading, refetch } = useQuery({
    queryKey: ["jugadores", submittedFilters],
    queryFn: () =>
      getJugadores({
        letra_apellido: submittedFilters.letra_apellido,
        equipo: submittedFilters.equipo, // Se envía el ID numérico seleccionado
        posicion: transformPosicion(submittedFilters.posicion),
      }),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  // Manejo de submit en el formulario: actualiza el estado de los filtros enviados
  const handleFilterSubmit = (e) => {
    e.preventDefault();

    // Validación del campo Letra del Apellido: solo letras Unicode
    if (letraApellido !== "" && !/^[\p{L}]+$/u.test(letraApellido)) {
      alert("El campo 'Letra del Apellido' solo puede contener letras.");
      return;
    }

    setSubmittedFilters({
      letra_apellido: letraApellido,
      equipo,
      posicion,
    });

    // Aunque al actualizar el queryKey el useQuery ejecuta automáticamente,
    // se puede llamar a refetch si se desea forzar la consulta.
    refetch();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Encabezado con degradado */}
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
        }}
      >
        {/* Filtro: Letra del Apellido */}
        <label style={{ color: "#fff" }}>
          Letra del Apellido:
          <input
            type="text"
            value={letraApellido}
            onChange={(e) => setLetraApellido(e.target.value)}
            placeholder="Ej: A"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
              marginLeft: "0.5rem",
              width: "50px",
            }}
          />
        </label>

        {/* Filtro: Equipo */}
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
            {equipoOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nombre}
              </option>
            ))}
          </select>
        </label>

        {/* Filtro: Posición */}
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

      {/* Se usa el componente DataTable para renderizar la tabla con paginación */}
      <DataTable jugadores={jugadores || []} />
    </div>
  );
}
