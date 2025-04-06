"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLesionActiva } from "@/services/lesionesService";

export default function BotonLesionConEstado({ jugadorId }) {
  const [estadoLesion, setEstadoLesion] = useState(null);

  useEffect(() => {
    async function fetchEstado() {
      try {
        const data = await getLesionActiva(jugadorId);
        setEstadoLesion(data);
      } catch (error) {
        console.error("Error consultando lesión activa:", error);
      }
    }
    fetchEstado();
  }, [jugadorId]);

  if (!estadoLesion) return null;

  const lesionActiva = estadoLesion?.tiene_lesion;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {!lesionActiva ? (
        <Link href={`/jugadores/${jugadorId}/nuevalesion`}>
          <button
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
            Añadir lesión
          </button>
        </Link>
      ) : (
        <div
          style={{
            backgroundColor: "#ff4444",
            color: "#fff",
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Lesión activa
        </div>
      )}
    </div>
  );
}
