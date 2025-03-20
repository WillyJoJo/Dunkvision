"use client";

import React from "react";
import ButtonAuth from "@/components/ButtonAuth";

export default function HomePage() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg,rgb(0, 0, 0),rgb(255, 0, 0))",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
          ¡Bienvenido a DUNKVISION!
        </h1>
        <p style={{ fontSize: "1.25rem", maxWidth: "600px" }}>
          Descubre un proyecto innovador para predecir resultados y estadísticas de la NBA.
        </p>
      </section>

      {/* Acerca del Proyecto */}
      <section
        style={{
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem", color: "rgb(255, 0, 0)" }}>
          Acerca del Proyecto
        </h2>
        <p style={{ fontSize: "1rem", maxWidth: "800px" }}>
          Este proyecto es el resultado de una investigación y aplicación de
          nuevas tecnologías, enfocado en brindar una experiencia única y
          atractiva.
        </p>
      </section>
    </main>
  );
}
