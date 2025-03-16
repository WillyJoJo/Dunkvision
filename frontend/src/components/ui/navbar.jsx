"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar({ items = [] }) {
  // Detecta la ruta actual (por ejemplo, "/", "/equipos", "/jugadores", etc.)
  const pathname = usePathname();

  // Detecta si es móvil o escritorio para cambiar el layout
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Comprobamos al montar
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
      justifyContent: "flex-start",
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    list: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-around",
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
    <aside style={styles.container}>
      <ul style={styles.list}>
        {items.map((item) => {
          // Si la ruta actual coincide con el href del ítem, se considera "activo"
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
    </aside>
  );
}
