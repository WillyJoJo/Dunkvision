"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";

export default function RegisterCliente() {
  const [errors, setErrors] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const router = useRouter();

  const isPasswordTooShort = password.length > 0 && password.length < 8;
  const doPasswordsMatch = password === repeatPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);

    if (isPasswordTooShort) {
      setErrors(["La contraseña debe tener al menos 8 caracteres."]);
      return;
    }

    if (!doPasswordsMatch) {
      setErrors(["Las contraseñas no coinciden."]);
      return;
    }

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
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            style={{
              fontSize: "1.1rem",
              borderColor: isPasswordTooShort ? "red" : undefined,
            }}
          />
          {isPasswordTooShort && (
            <small style={{ color: "red" }}>
              La contraseña debe tener al menos 8 caracteres.
            </small>
          )}
        </div>

        <div className="form-group mb-2">
          <label htmlFor="repeatPassword" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            Repetir Contraseña
          </label>
          <PasswordInput
            id="repeatPassword"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            placeholder="Repite la contraseña"
            style={{
              fontSize: "1.1rem",
              borderColor: repeatPassword && !doPasswordsMatch ? "red" : undefined,
            }}
          />
          {repeatPassword && !doPasswordsMatch && (
            <small style={{ color: "red" }}>
              Las contraseñas no coinciden.
            </small>
          )}
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