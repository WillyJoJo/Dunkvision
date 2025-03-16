"use client";

import React, { useEffect, useState } from "react";
import { getEquipos } from "@/services/equiposService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const data = await getEquipos();
        setEquipos(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipos();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Lista de Equipos</h2>
      
      {/* Sección que limita la altura y permite scroll solo para la tabla */}
      <section
        style={{
          maxHeight: "400px",      // Ajusta la altura que desees
          overflowY: "auto",       // Activa scroll vertical
          border: "1px solid #ccc",
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Conferencia</TableHead>
              <TableHead>División</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipos.map((equipo) => (
              <TableRow key={equipo.id}>
                <TableCell>{equipo.nombre}</TableCell>
                <TableCell>{equipo.conferencia}</TableCell>
                <TableCell>{equipo.division}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
