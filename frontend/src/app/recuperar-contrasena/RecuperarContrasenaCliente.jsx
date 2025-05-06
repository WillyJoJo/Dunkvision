"use client";
import { useState } from "react";
import { recuperar_contrasena } from "@/services/usuariosService";

export default function RecuperarContrasenaCliente() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const res = await recuperar_contrasena(email);
      setMensaje(res.mensaje);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error inesperado");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "400px", margin: "0 auto" }}>
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
        <h2 style={{ margin: 0 }}>Recuperar contraseña</h2>
        <p style={{ marginTop: "0.5rem" }}>
          Ingresa tu correo para recibir un enlace
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={{ fontWeight: "bold" }}>Correo electrónico</label>
        <input
          type="email"
          id="email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">
          Enviar enlace
        </button>
      </form>

      {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}
