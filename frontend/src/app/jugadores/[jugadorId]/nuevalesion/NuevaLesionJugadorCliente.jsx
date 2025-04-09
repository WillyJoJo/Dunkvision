"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createLesion } from "@/services/lesionesService";
import { getJugadoresById } from "@/services/jugadoresService";

export default function NuevaLesionJugadorCliente({ jugadorId }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [tipoLesion, setTipoLesion] = useState("");
  const [fechaRecuperacion, setFechaRecuperacion] = useState("");
  const [error, setError] = useState(null);
  const [jugador, setJugador] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const data = {
        jugador_id: jugadorId,
        tipo_lesion: tipoLesion || undefined,
        fecha_recuperacion_estimada: fechaRecuperacion || undefined,
      };

      await createLesion(data, session?.user?.token);
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
    }
  };

  return (
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
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          maxWidth: "600px",
          color: "#fff",
        }}
      >
        {jugador && (
          <h1
            style={{
              margin: 0,
              marginBottom: "1.5rem",
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#fff",
            }}
          >
            {jugador.nombre}
          </h1>
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
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Fecha de recuperación estimada:
          </label>
          <input
            type="date"
            value={fechaRecuperacion}
            onChange={(e) => setFechaRecuperacion(e.target.value)}
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

        {error && (
          <p style={{ color: "#ff4444", marginBottom: "1rem", fontWeight: "bold" }}>
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
          onMouseOver={(e) => (e.target.style.backgroundColor = "#cc0000")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#ff4444")}
        >
          Crear lesión
        </button>
      </form>
    </main>
  );
}
