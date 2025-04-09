"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterCliente() {
  const [errors, setErrors] = useState([]);
  const [name, setName] = useState("test");
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123123");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre_usuario: name,
            email,
            password,
          }),
        }
      );

      const responseAPI = await res.json();

      if (!res.ok) {
        if (Array.isArray(responseAPI.message)) {
          setErrors(responseAPI.message);
        } else if (typeof responseAPI.message === "string") {
          setErrors([responseAPI.message]);
        } else {
          setErrors(["Ocurrió un error desconocido."]);
        }
        return;
      }

      const responseNextAuth = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (responseNextAuth?.error) {
        setErrors(responseNextAuth.error.split(","));
        return;
      }

      router.push("/");
    } catch (err) {
      console.error("Error de red:", err);
      setErrors(["No se pudo conectar con el servidor."]);
    }
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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Registro</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Crea tu cuenta
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ marginLeft: 0, maxWidth: "400px" }}>
        <div className="form-group mb-2">
          <label htmlFor="nombre_usuario" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="nombre_usuario"
            placeholder="Nombre de usuario"
            name="nombre_usuario"
            className="form-control"
            style={{ fontSize: "1.1rem" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group mb-2">
          <label htmlFor="email" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="ejemplo@email.com"
            name="email"
            className="form-control"
            style={{ fontSize: "1.1rem" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group mb-2">
          <label htmlFor="password" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            placeholder="8caracteres"
            name="password"
            className="form-control"
            style={{ fontSize: "1.1rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          style={{ fontSize: "1.1rem" }}
        >
          Registrar
        </button>
      </form>

      {errors.length > 0 && (
        <div className="alert alert-danger mt-3" style={{ maxWidth: "400px", marginLeft: 0 }}>
          <ul className="mb-0">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}