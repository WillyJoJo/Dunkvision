"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const LoginPage = () => {
  const [errors, setErrors] = useState([]);
  const [email, setEmail] = useState("usuario@gmail.com");
  const [password, setPassword] = useState("admin123");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors([]);

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
  };

  return (
    <div style={{ margin: 0, padding: "1rem" }}>
      {/* Encabezado con degradado */}
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

      {/* Formulario pegado a la izquierda, con un ancho máximo */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginLeft: 0,
          maxWidth: "400px",
        }}
      >
        <label htmlFor="email" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="ejemplo@email.com"
          name="email"
          className="form-control mb-2"
          style={{ fontSize: "1.1rem" }}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <label htmlFor="password" style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          placeholder="8caracteres"
          name="password"
          className="form-control mb-2"
          style={{ fontSize: "1.1rem" }}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary w-100"
          style={{ fontSize: "1.1rem" }}
        >
          Iniciar sesión
        </button>
      </form>

      {/* Mostrar errores, si los hay */}
      {errors.length > 0 && (
        <div
          className="alert alert-danger mt-3"
          style={{ maxWidth: "400px", marginLeft: 0 }}
        >
          <ul className="mb-0">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Enlace para registrarse */}
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
};

export default LoginPage;
