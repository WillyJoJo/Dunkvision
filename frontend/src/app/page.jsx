'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar } from "@/components/ui/calendar";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;

export default function Home() {
  // Mueve la inicialización de date aquí
  const [date, setDate] = useState(new Date());
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/equipos`);
        console.log(response);
        // Se asume que la API devuelve un array de objetos con { id, nombre, conferencia, division, ... }
        setEquipos(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <h1>Equipos</h1>
      <ul>
        {equipos.map((equipo) => (
          <li key={equipo.id}>
            Nombre: {equipo.nombre} - Conferencia: {equipo.conferencia} - División: {equipo.division}
          </li>
        ))}
      </ul>
    </div>
  );
}
