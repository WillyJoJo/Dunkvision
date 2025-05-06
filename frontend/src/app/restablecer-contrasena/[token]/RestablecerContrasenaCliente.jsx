"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { restablecer_contrasena } from "@/services/usuariosService";
import { PasswordInput } from "@/components/ui/password-input";

export default function RestablecerContrasenaCliente() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const res = await restablecer_contrasena(token, password);
      setMensaje(res.mensaje);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al cambiar la contraseña");
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
        <h2 style={{ margin: 0 }}>Restablecer contraseña</h2>
        <p style={{ marginTop: "0.5rem" }}>
          Introduce tu nueva contraseña
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="password" style={{ fontWeight: "bold" }}>Nueva contraseña</label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />

        <label htmlFor="confirm" style={{ fontWeight: "bold", marginTop: "1rem" }}>Confirmar contraseña</label>
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repite la contraseña"
        />

        <button type="submit" className="btn btn-success w-100 mt-3">
          Cambiar contraseña
        </button>
      </form>

      {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}