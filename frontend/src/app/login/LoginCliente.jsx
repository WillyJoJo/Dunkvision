"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginCliente() {
  const [errors, setErrors] = useState([]);
  const [email, setEmail] = useState("usuario@gmail.com");
  const [password, setPassword] = useState("admin123");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (response?.error) {
      setErrors(response.error.split(","));
      return;
    }

    router.push("/");
  };

  return (
    <div style={{ margin: 0, padding: "1rem" }}>
      {/* Encabezado */}
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Inicio de Sesión</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Ingresa tus credenciales
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ marginLeft: 0, maxWidth: "400px" }}>
        <label htmlFor="email" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control mb-2"
          placeholder="ejemplo@email.com"
          style={{ fontSize: "1.1rem" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control mb-2"
          placeholder="8caracteres"
          style={{ fontSize: "1.1rem" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="btn btn-primary w-100"
          style={{ fontSize: "1.1rem" }}
        >
          Iniciar sesión
        </button>
      </form>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="alert alert-danger mt-3" style={{ maxWidth: "400px", marginLeft: 0 }}>
          <ul className="mb-0">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Enlace registro */}
      <div className="mt-3" style={{ fontSize: "1rem", maxWidth: "400px" }}>
        <p style={{ marginLeft: 0 }}>
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-primary">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}