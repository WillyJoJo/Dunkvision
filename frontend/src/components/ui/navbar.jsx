"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ButtonAuth from "../ButtonAuth";

export default function NavBar({ items = [] }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Estilos para escritorio (sidebar vertical)
  const desktopStyles = {
    container: {
      width: "200px",
      backgroundColor: "#000",
      color: "#fff",
      padding: "0.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      // Ponemos todo arriba; si quieres espacio extra abajo, ajusta "marginTop"
    },
    buttonContainer: {
      marginBottom: "1rem", // Espacio debajo del botón
    },
    list: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      width: "100%",
    },
    listItem: {
      backgroundColor: "transparent",
      borderRadius: "4px",
      marginBottom: "0.25rem",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    link: {
      display: "block",
      padding: "0.5rem 1rem",
      textDecoration: "none",
      color: "#fff",
    },
  };

  // Estilos para móvil (navbar horizontal)
  const mobileStyles = {
    container: {
      width: "100%",
      backgroundColor: "#000",
      color: "#fff",
      padding: "0.5rem",
      display: "flex",
      flexDirection: "column", // Cambiamos a columna para que el botón quede arriba
      alignItems: "center",
    },
    buttonContainer: {
      marginBottom: "1rem",
    },
    list: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "row",
      gap: "1rem",
    },
    listItem: {
      backgroundColor: "transparent",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
    link: {
      display: "block",
      padding: "0.5rem 1rem",
      textDecoration: "none",
      color: "#fff",
    },
  };

  const styles = isMobile ? mobileStyles : desktopStyles;

  return (
    <nav style={styles.container}>
      {/* Contenedor para el botón de autenticación */}
      <div style={styles.buttonContainer}>
        <ButtonAuth />
      </div>

      {/* Listado de páginas */}
      <ul style={styles.list}>
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li
              key={item.label}
              style={{
                ...styles.listItem,
                backgroundColor: isActive ? "red" : "transparent",
              }}
            >
              <Link href={item.href} style={styles.link}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
