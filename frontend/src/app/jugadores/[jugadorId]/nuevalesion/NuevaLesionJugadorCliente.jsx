"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createLesion } from "@/services/lesionesService";
import { getJugadoresById } from "@/services/jugadoresService";

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

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import SimpleDatePicker from "@/components/ui/simple-date-picker";

export default function NuevaLesionJugadorCliente({ jugadorId }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [tipoLesion, setTipoLesion] = useState("");
  const [fechaRecuperacion, setFechaRecuperacion] = useState(null);
  const [error, setError] = useState(null);
  const [jugador, setJugador] = useState(null);
  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [dialogVacio, setDialogVacio] = useState(false);

  useEffect(() => {
    async function fetchJugador() {
      try {
        const data = await getJugadoresById(jugadorId);
        setJugador(data);
      } catch (err) {
        console.error("Error cargando el jugador", err);
        setJugador(null);
      }
    }

    if (jugadorId) fetchJugador();
  }, [jugadorId]);

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const data = {};
    if (tipoLesion.trim()) data.tipo_lesion = tipoLesion.trim();

    if (fechaRecuperacion instanceof Date && !isNaN(fechaRecuperacion)) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaRecuperacion < hoy) {
        setFechaInvalida(true);
        return;
      }

      const fechaISO = [
        fechaRecuperacion.getFullYear(),
        String(fechaRecuperacion.getMonth() + 1).padStart(2, "0"),
        String(fechaRecuperacion.getDate()).padStart(2, "0"),
      ].join("-");

      data.fecha_recuperacion_estimada = fechaISO;
      setFechaInvalida(false);
    }

    if (Object.keys(data).length === 0) {
      setDialogVacio(true);
      return;
    }

    setDialogAbierto(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await createLesion(
        {
          jugador_id: jugadorId,
          tipo_lesion: tipoLesion || undefined,
          fecha_recuperacion_estimada: fechaRecuperacion
            ? [
              fechaRecuperacion.getFullYear(),
              String(fechaRecuperacion.getMonth() + 1).padStart(2, "0"),
              String(fechaRecuperacion.getDate()).padStart(2, "0"),
            ].join("-")
            : undefined,
        },
        session?.user?.token
      );
      toast.success("Lesión registrada correctamente.");
      router.push(`/jugadores/${jugadorId}`);
    } catch (err) {
      console.error("Error creando lesión:", err);
      if (err.response?.status === 409) {
        setError("Este jugador ya tiene una lesión activa.");
      } else if (err.response?.status === 401) {
        setError("No tienes permisos para crear lesiones. Inicia sesión.");
      } else {
        setError("No se pudo registrar la lesión. Intenta de nuevo.");
      }
      toast.error("Error al registrar la lesión.");
    }
  };

  return (
    <>
      <main style={{ padding: "2rem", color: "#fff" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #000 0%, #f00 100%)",
            color: "#fff",
            textAlign: "left",
            padding: "1.5rem 2rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            maxWidth: "600px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2rem" }}>Añadir Lesión</h2>
        </div>

        <form
          onSubmit={handlePreSubmit}
          style={{
            backgroundColor: "#1a1a1a",
            padding: "1.5rem 2rem",
            borderRadius: "10px",
            maxWidth: "600px",
            color: "#fff",
            position: "relative", // ✅ Necesario para que el popover se posicione bien
            zIndex: 0,             // ✅ Evita superposición no deseada
          }}
        >
          {jugador && (
            <>
              <div style={{ maxWidth: "300px", margin: "0 auto 1.5rem" }}>
                <img
                  src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${jugador.id}.png`}
                  alt={jugador.nombre}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    objectFit: "cover",
                    border: "2px solid #fff",
                  }}
                  onError={(e) => (e.target.src = "/placeholder-player.png")}
                />
              </div>

              <h1
                style={{
                  textAlign: "center",
                  marginBottom: "1.5rem",
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                {jugador.nombre}
              </h1>
            </>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
              Tipo de lesión:
            </label>
            <input
              type="text"
              value={tipoLesion}
              onChange={(e) => setTipoLesion(e.target.value)}
              placeholder="Ej: Esguince, rotura..."
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
            <label>Fecha de recuperación estimada:</label>
            <SimpleDatePicker date={fechaRecuperacion} setDate={setFechaRecuperacion} />
            {fechaInvalida && (
              <Alert variant="destructive" className="mt-2">
                <AlertTitle>Fecha inválida</AlertTitle>
                <AlertDescription>
                  La fecha de recuperación no puede ser anterior a hoy.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {error && (
            <p style={{ color: "#ff4444", fontWeight: "bold" }}>
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              padding: "0.6rem 1.2rem",
              backgroundColor: "#ff4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) =>
              (e.target.style.backgroundColor = "#cc0000")
            }
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = "#ff4444")
            }
          >
            Crear lesión
          </button>
        </form>
      </main>

      {/* Confirmación */}
      <AlertDialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Registrar nueva lesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción añadirá una nueva lesión al jugador. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Campos vacíos */}
      <AlertDialog open={dialogVacio} onOpenChange={setDialogVacio}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campos vacíos</AlertDialogTitle>
            <AlertDialogDescription>
              Debes rellenar al menos un campo para registrar la lesión.
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