"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getLesiones, getNombreJugador } from "@/services/lesionesService";
import { DataTable } from "./data-table";

export default function Lesiones() {
  // Consulta el listado completo de lesiones
  const { data: lesiones = [], error, isLoading } = useQuery({
    queryKey: ["lesiones"],
    queryFn: getLesiones,
    staleTime: 1000 * 60 * 5,
  });

  // Estado para almacenar las lesiones con el nombre del jugador (propiedad "jugador")
  const [lesionesConNombre, setLesionesConNombre] = useState([]);

  useEffect(() => {
    if (lesiones && lesiones.length > 0) {
      console.log("Lesiones recibidas:", lesiones);
      Promise.all(
        lesiones.map(async (lesion, index) => {
          // Verifica que exista jugador_id y haz el log
          if (!lesion.jugador_id) {
            console.warn(`Lesión en índice ${index} no tiene jugador_id definido.`, lesion);
            return { ...lesion, jugador: "Desconocido" };
          }
          try {
            const nombre = await getNombreJugador(lesion.jugador_id);
            return { ...lesion, jugador: nombre };
          } catch (error) {
            console.error("Error obteniendo el nombre para la lesión:", lesion.jugador_id, error);
            return { ...lesion, jugador: "Desconocido" };
          }
        })
      ).then((results) => {
        setLesionesConNombre(results);
      });
    } else {
      setLesionesConNombre([]);
    }
  }, [JSON.stringify(lesiones)]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Lesiones</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Visualiza las lesiones registradas con el nombre del jugador.
        </p>
      </div>

      {/* Renderiza la tabla de lesiones */}
      <DataTable lesiones={lesionesConNombre} />
    </div>
  );
}
