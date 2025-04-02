"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLesiones,
  getNombreJugador,
  deleteLesion,
  limpiarLesiones,
} from "@/services/lesionesService";
import { DataTable } from "./data-table";
import { useSession } from "next-auth/react";

export default function Lesiones() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === "admin";
  const queryClient = useQueryClient();

  // Ejecutar limpieza automática de lesiones antiguas al cargar la página
  useEffect(() => {
    if (session?.user?.token) {
      limpiarLesiones(session.user.token)
        .then((res) => {
          console.log("Limpieza automática de lesiones:", res.message);
          queryClient.invalidateQueries(["lesiones"]);
        })
        .catch((error) => {
          console.error("Error al limpiar lesiones antiguas:", error);
        });
    }
  }, [session?.user?.token]);

  // 📥 Obtener lesiones
  const { data: lesiones = [], error, isLoading } = useQuery({
    queryKey: ["lesiones"],
    queryFn: getLesiones,
    staleTime: 1000 * 60 * 5,
  });

  // 🗑️ Eliminar lesión manualmente
  const deleteLesionMutation = useMutation({
    mutationFn: (lesionId) => deleteLesion(lesionId, session?.user?.token),
    onSuccess: () => {
      queryClient.invalidateQueries(["lesiones"]);
    },
  });

  const [lesionesConNombre, setLesionesConNombre] = useState([]);

  // 🧠 Asociar nombre del jugador a cada lesión
  useEffect(() => {
    if (lesiones && lesiones.length > 0) {
      Promise.all(
        lesiones.map(async (lesion, index) => {
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

  const handleDelete = (lesionId) => {
    if (confirm("¿Estás seguro de eliminar esta lesión?")) {
      deleteLesionMutation.mutate(lesionId);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Encabezado degradado */}
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

      {/* Tabla de lesiones */}
      <DataTable
        lesiones={lesionesConNombre}
        isAdmin={isAdmin}
        onDelete={handleDelete}
      />
    </div>
  );
}
