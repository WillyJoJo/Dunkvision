"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getJugadoresById } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import BotonLesionConEstado from "@/components/ui/BotonLesionConEstado";

const transformarPosiciones = (abreviacion) => {
  const mapping = {
    G: "Base, Escolta",
    F: "Alero, Ala-Pívot",
    C: "Pívot",
  };

  if (!abreviacion) return [];

  return abreviacion
    .split("-")
    .map((pos) => mapping[pos] || "")
    .filter((p) => p !== "");
};

export default function JugadorPage({ params }) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.rol === "admin";

  const [jugador, setJugador] = useState(null);
  const [equipo, setEquipo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const jugadorData = await getJugadoresById(params.jugadorId);
      const equipoData = await getEquiposById(jugadorData.equipo_id);
      setJugador(jugadorData);
      setEquipo(equipoData);
    };

    fetchData();
  }, [params.jugadorId]);

  if (!jugador || !equipo) return <div style={{ color: "#fff" }}>Cargando...</div>;

  return (
    <main style={{ padding: "2rem", color: "#fff" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          textAlign: "left",
          padding: "2rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          maxWidth: "600px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold" }}>
          {jugador.nombre}
        </h1>
      </div>

      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          maxWidth: "600px",
          color: "#fff",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            Posición:
          </strong>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {transformarPosiciones(jugador.posicion).map((texto, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: "#333",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                {texto}
              </span>
            ))}
          </div>
        </div>

        <p style={{ marginBottom: "1.5rem" }}>
          <strong>Equipo:</strong> {equipo.nombre}
        </p>

        {/* ✅ Solo mostrar el botón si es admin */}
        {isAdmin && <BotonLesionConEstado jugadorId={params.jugadorId} />}
      </div>
    </main>
  );
}
