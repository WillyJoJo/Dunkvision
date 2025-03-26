"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLesiones, getNombreJugador, deleteLesion } from "@/services/lesionesService";
import { DataTable } from "./data-table";
import { useSession } from "next-auth/react";

export default function Lesiones() {
  // Obtenemos la sesión para comprobar el rol del usuario y obtener el token
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.rol === "admin";

  const queryClient = useQueryClient();

  // Consulta el listado completo de lesiones
  const { data: lesiones = [], error, isLoading } = useQuery({
    queryKey: ["lesiones"],
    queryFn: getLesiones,
    staleTime: 1000 * 60 * 5,
  });

  // Mutation para eliminar una lesión, pasando el token desde la sesión
  const deleteLesionMutation = useMutation({
    mutationFn: (lesionId) => deleteLesion(lesionId, session?.user?.token),
    onSuccess: () => {
      queryClient.invalidateQueries(["lesiones"]);
    },
  });

  // Estado para almacenar las lesiones con el nombre del jugador (propiedad "jugador")
  const [lesionesConNombre, setLesionesConNombre] = useState([]);

  useEffect(() => {
    if (lesiones && lesiones.length > 0) {
      //console.log("Lesiones recibidas:", lesiones);
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

  // Handler para eliminar una lesión
  const handleDelete = (lesionId) => {
    if (confirm("¿Estás seguro de eliminar esta lesión?")) {
      deleteLesionMutation.mutate(lesionId);
    }
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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Lesiones</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Visualiza las lesiones registradas con el nombre del jugador.
        </p>
      </div>

      {/* Renderiza la tabla de lesiones, pasando el flag isAdmin y la función de borrado */}
      <DataTable
        lesiones={lesionesConNombre}
        isAdmin={isAdmin}
        onDelete={handleDelete}
      />
    </div>
  );
}
