"use client";
import Link from "next/link";

export default function BotonLesion({ jugadorId }) {
  return (
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
  );
}
