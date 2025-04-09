"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { getLesionById, editarLesion, getNombreJugador } from "@/services/lesionesService";
import { useSession } from "next-auth/react";

export default function EditarLesionesCliente() {
  const { lesionId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const {
    data: lesionData,
    error: errorLesion,
    isLoading: loadingLesion,
  } = useQuery({
    queryKey: ["lesion", lesionId],
    queryFn: () => getLesionById(lesionId),
  });

  const [nombreJugador, setNombreJugador] = useState("Cargando...");
  const [tipoLesion, setTipoLesion] = useState("");
  const [fechaRecuperacion, setFechaRecuperacion] = useState("");
  const [fechaInvalida, setFechaInvalida] = useState(false);

  useEffect(() => {
    if (lesionData?.lesion) {
      const lesion = lesionData.lesion;
      setTipoLesion(lesion.tipo_lesion || "");
      setFechaRecuperacion(lesion.fecha_recuperacion_estimada || "");

      if (!lesion.jugador_id) {
        console.warn("La lesión no tiene jugador_id definido.", lesion);
        setNombreJugador("Desconocido");
      } else {
        getNombreJugador(lesion.jugador_id)
          .then((nombre) => setNombreJugador(nombre))
          .catch((error) => {
            console.error("Error obteniendo el nombre del jugador:", lesion.jugador_id, error);
            setNombreJugador("Desconocido");
          });
      }
    }
  }, [lesionData]);

  const mutation = useMutation({
    mutationFn: (updatedData) =>
      editarLesion(lesionId, updatedData, session?.user?.token),
    onSuccess: () => {
      queryClient.invalidateQueries(["lesiones"]);
      router.push("/lesiones");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = {};
    if (tipoLesion.trim()) dataToSend.tipo_lesion = tipoLesion.trim();
    if (fechaRecuperacion) dataToSend.fecha_recuperacion_estimada = fechaRecuperacion;

    // Validar fecha antes de enviar
    const hoy = new Date().toISOString().split("T")[0];
    if (fechaRecuperacion && fechaRecuperacion < hoy) {
      setFechaInvalida(true);
      return;
    }

    if (Object.keys(dataToSend).length === 0) {
      alert("Debes completar al menos un campo para actualizar la lesión.");
      return;
    }

    setFechaInvalida(false);
    mutation.mutate(dataToSend);
  };

  if (loadingLesion) return <div>Cargando...</div>;
  if (errorLesion) return <div>Error: {errorLesion.message}</div>;

  return (
    <>
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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Editar Lesión</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Modifica la información de la lesión registrada.
        </p>
      </div>

      {/* Formulario */}
      <div
        style={{
          padding: "1rem",
          width: "50%",
          marginLeft: "0",
          background: "#1a1a1a",
          borderRadius: "10px",
          color: "#fff",
        }}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Nombre del Jugador:
              <input
                type="text"
                value={nombreJugador}
                disabled
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  backgroundColor: "#333",
                  color: "#fff",
                  border: "1px solid #555",
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ marginRight: "0.5rem" }}>Tipo de Lesión:</label>
            <input
              type="text"
              value={tipoLesion}
              onChange={(e) => setTipoLesion(e.target.value)}
              style={{
                width: "300px",
                padding: "0.5rem",
                borderRadius: "5px",
                backgroundColor: "#222",
                color: "#fff",
                border: "1px solid #ff4444",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label>
              Fecha de Recuperación Estimada:
              <input
                type="date"
                value={fechaRecuperacion}
                onChange={(e) => setFechaRecuperacion(e.target.value)}
                style={{
                  marginLeft: "0.5rem",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  backgroundColor: "#222",
                  color: "#fff",
                  border: fechaInvalida ? "2px solid #ff0000" : "1px solid #ff4444",
                }}
              />
            </label>
            {fechaInvalida && (
              <p style={{ color: "#ff4444", marginTop: "0.5rem" }}>
                ⚠️ La fecha no puede ser anterior a hoy.
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#ff4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#cc0000")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#ff4444")}
          >
            Actualizar
          </button>
        </form>
      </div>
    </>
  );
}
