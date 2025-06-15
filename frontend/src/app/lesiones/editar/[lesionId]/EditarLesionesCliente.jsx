"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { getLesionById, editarLesion } from "@/services/lesionesService";
import { getNombreJugador } from "@/services/jugadoresService";
import { useSession } from "next-auth/react";
import SimpleDatePicker from "@/components/ui/simple-date-picker";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

import { toast } from "sonner";

export default function EditarLesionesCliente() {
  const { lesionId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { data: lesionData, error: errorLesion, isLoading: loadingLesion } = useQuery({
    queryKey: ["lesion", lesionId],
    queryFn: () => getLesionById(lesionId),
  });

  const [nombreJugador, setNombreJugador] = useState("Cargando...");
  const [jugadorId, setJugadorId] = useState(null);
  const [tipoLesion, setTipoLesion] = useState("");
  const [fechaRecuperacion, setFechaRecuperacion] = useState(null);
  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogVacio, setDialogVacio] = useState(false);
  const [dataToSend, setDataToSend] = useState({});

  useEffect(() => {
    if (lesionData?.lesion) {
      const lesion = lesionData.lesion;
      setTipoLesion(lesion.tipo_lesion || "");
      setJugadorId(lesion.jugador_id);

      if (lesion.fecha_recuperacion_estimada) {
        const fecha = new Date(lesion.fecha_recuperacion_estimada);
        setFechaRecuperacion(fecha);
      }

      if (!lesion.jugador_id) {
        setNombreJugador("Desconocido");
      } else {
        getNombreJugador(lesion.jugador_id)
          .then((nombre) => setNombreJugador(nombre))
          .catch(() => setNombreJugador("Desconocido"));
      }
    }
  }, [lesionData]);

  const mutation = useMutation({
    mutationFn: (updatedData) =>
      editarLesion(lesionId, updatedData, session?.user?.token),
    onSuccess: () => {
      toast.success("Lesión actualizada correctamente.");
      queryClient.invalidateQueries(["lesiones"]);
      router.push("/lesiones");
    },
    onError: () => {
      toast.error("Hubo un error al actualizar la lesión.");
    },
  });

  const handlePreSubmit = (e) => {
    e.preventDefault();

    const nuevoData = {};
    if (tipoLesion.trim()) nuevoData.tipo_lesion = tipoLesion.trim();

    if (fechaRecuperacion instanceof Date && !isNaN(fechaRecuperacion)) {
      const fechaISO = [
        fechaRecuperacion.getFullYear(),
        String(fechaRecuperacion.getMonth() + 1).padStart(2, "0"),
        String(fechaRecuperacion.getDate()).padStart(2, "0"),
      ].join("-");
      nuevoData.fecha_recuperacion_estimada = fechaISO;
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaRecuperacion && fechaRecuperacion < hoy) {
      setFechaInvalida(true);
      return;
    } else {
      setFechaInvalida(false);
    }

    if (Object.keys(nuevoData).length === 0) {
      setDialogVacio(true);
      return;
    }

    setDataToSend(nuevoData);
    setDialogAbierto(true);
  };

  if (loadingLesion) return <div>Cargando...</div>;
  if (errorLesion) return <div>Error: {errorLesion.message}</div>;

  return (
    <>
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

      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {jugadorId && (
          <div
            style={{
              background: "linear-gradient(135deg, #000 0%, #f00 100%)",
              color: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              flex: "1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "2.5rem",
                fontWeight: "bold",
                lineHeight: "1.2",
                textAlign: "center",
              }}
            >
              {nombreJugador}
            </h1>

            <div
              style={{
                marginTop: "1.5rem",
                width: "100%",
                maxWidth: "300px",
              }}
            >
              <img
                src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${jugadorId}.png`}
                alt={nombreJugador}
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  objectFit: "cover",
                  border: "2px solid #fff",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.src = "/placeholder-player.png";
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            padding: "1rem",
            flexGrow: 1,
            background: "#1a1a1a",
            borderRadius: "10px",
            color: "#fff",
            minWidth: "300px",
            maxWidth: "600px",
          }}
        >
          <form onSubmit={handlePreSubmit}>
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
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "5px",
                  backgroundColor: "#222",
                  color: "#fff",
                  border: "1px solid #ff4444",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label>Fecha de Recuperación Estimada:</label>
              <SimpleDatePicker
                date={fechaRecuperacion}
                setDate={setFechaRecuperacion}
              />
              {fechaInvalida && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTitle>Fecha inválida</AlertTitle>
                  <AlertDescription>
                    La fecha de recuperación no puede ser anterior a hoy. Por favor, selecciona una fecha válida.
                  </AlertDescription>
                </Alert>
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
      </div>

      {/* Confirmación antes de actualizar */}
      <AlertDialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Deseas actualizar esta lesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción modificará los datos actuales. Asegúrate de que los nuevos valores son correctos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => mutation.mutate(dataToSend)}>
              Confirmar actualización
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advertencia si no se completó ningún campo */}
      <AlertDialog open={dialogVacio} onOpenChange={setDialogVacio}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campos vacíos</AlertDialogTitle>
            <AlertDialogDescription>
              Debes modificar al menos un campo para poder actualizar la lesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogVacio(false)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}