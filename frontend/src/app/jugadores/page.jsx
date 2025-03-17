"use client";

import React, { useEffect, useState } from "react";
import { getJugadores } from "@/services/jugadoresService"; // Ajusta la ruta a tu servicio
import { DataTable } from "./data-table"; // Importa tu componente DataTable

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [letraApellido, setLetraApellido] = useState("");
  const [equipo, setEquipo] = useState("");
  const [posicion, setPosicion] = useState("");

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

  // Función para transformar la posición al formato que tu API espera
  const transformPosicion = (pos) => {
    if (pos === "Base" || pos === "Escolta") return "G";
    if (pos === "Alero" || pos === "Ala-Pívot") return "F";
    if (pos === "Pívot") return "C";
    return "";
  };

  // Obtener jugadores (con o sin filtros)
  const fetchJugadores = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getJugadores(filters);
      setJugadores(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial sin filtros
  useEffect(() => {
    fetchJugadores();
  }, []);

  // Manejo de submit en el formulario
  const handleFilterSubmit = (e) => {
    e.preventDefault();

    // Validación de "Letra del Apellido": solo letras
    if (letraApellido !== "" && !/^[\p{L}]+$/u.test(letraApellido)) {
      alert("El campo 'Letra del Apellido' solo puede contener letras.");
      return;
    }

    // Transformamos la posición seleccionada
    const posicionTransformada = transformPosicion(posicion);

    // Llamamos a la API con los filtros
    fetchJugadores({
      letra_apellido: letraApellido,
      equipo, // ID numérico
      posicion: posicionTransformada,
    });
  };

  // Manejo de estados de carga y error
  if (loading) return <div>Loading...</div>;
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

      {/* Aquí en lugar de renderizar la tabla directamente, usamos el DataTable */}
      <DataTable jugadores={jugadores} />
    </div>
  );
}
