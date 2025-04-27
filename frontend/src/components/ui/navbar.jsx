"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ButtonAuth from "../ButtonAuth";
import "./NavBar.css";

export default function NavBar({ items = [] }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMenuOpen(false); // Cierra menú si vuelves a escritorio
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className={`navbar-container ${isMobile ? "mobile" : ""}`}>
      {isMobile ? (
        <>
          <div className="navbar-mobile-top">
            <ButtonAuth />
            <button className="hamburger-button" onClick={toggleMenu}>
              ☰
            </button>
          </div>

          {menuOpen && (
            <ul className="navbar-mobile-menu">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.label} className={isActive ? "active" : ""}>
                    <Link href={item.href} className="navbar-link" onClick={() => setMenuOpen(false)}>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        <>
          <div className="button-container">
            <ButtonAuth />
          </div>
          <ul className="navbar-list">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.label} className={isActive ? "active" : ""}>
                  <Link href={item.href} className="navbar-link">
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </nav>
  );
}