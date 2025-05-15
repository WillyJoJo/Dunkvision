"use client";

import Link from "next/link";

export default function Marcador({
  equipoLocal,
  equipoVisitante,
  nombreEquipoLocal,
  nombreEquipoVisitante,
  puntosLocal,
  puntosVisitante,
  fecha
}) {
  const esEmpate = puntosLocal === puntosVisitante;
  const ganadorLocal = puntosLocal > puntosVisitante;

  const colorPuntosLocal = esEmpate ? "#ccc" : ganadorLocal ? "limegreen" : "#aaa";
  const colorPuntosVisitante = esEmpate ? "#ccc" : !ganadorLocal ? "limegreen" : "#aaa";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #ff0000 100%)",
        borderRadius: "1rem",
        padding: "2rem",
        marginBottom: "2rem",
        maxWidth: "1000px",
        marginInline: "auto",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        gap: "2rem",
        flexWrap: "wrap",
      }}
    >
      {/* Equipo Local */}
      <div style={{
        flex: "1",
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}>
        <Link href={`/equipos/${equipoLocal}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={`https://cdn.nba.com/logos/nba/${equipoLocal}/global/L/logo.svg`}
              alt={nombreEquipoLocal}
              style={{
                width: "90px",
                height: "90px",
                objectFit: "contain",
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "0.5rem",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              onError={(e) => {
                e.target.src = "/placeholder-logo.svg";
              }}
            />
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              {nombreEquipoLocal}
            </div>
          </div>
        </Link>
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: colorPuntosLocal,
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          {puntosLocal}
        </div>
      </div>

      {/* Centro */}
      <div style={{
        flex: "0 0 auto",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem"
      }}>
        <h1 style={{ fontSize: "2.2rem", margin: 0 }}>VS</h1>
        <p style={{ fontSize: "1rem", textTransform: "uppercase" }}>
          <strong>Fecha:</strong> {fecha}
        </p>
      </div>

      {/* Equipo Visitante */}
      <div style={{
        flex: "1",
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}>
        <Link href={`/equipos/${equipoVisitante}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <img
              src={`https://cdn.nba.com/logos/nba/${equipoVisitante}/global/L/logo.svg`}
              alt={nombreEquipoVisitante}
              style={{
                width: "90px",
                height: "90px",
                objectFit: "contain",
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "0.5rem",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              onError={(e) => {
                e.target.src = "/placeholder-logo.svg";
              }}
            />
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "600",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "white")}
            >
              {nombreEquipoVisitante}
            </div>
          </div>
        </Link>
        <div
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: colorPuntosVisitante,
            textShadow: "1px 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          {puntosVisitante}
        </div>
      </div>
    </div>
  );
}