"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getLesiones,
  deleteLesion,
  limpiarLesiones,
  getPosiblesLesiones,
} from "@/services/lesionesService";
import { getNombreJugador } from "@/services/jugadoresService";
import { DataTable } from "./data-table";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import SimpleDateRangePicker from "@/components/ui/simple-date-range-picker";

export default function LesionesCliente() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.rol === "admin";
  const queryClient = useQueryClient();

  const [nombreJugador, setNombreJugador] = useState("");
  const [tipoLesion, setTipoLesion] = useState("");
  const [range, setRange] = useState(undefined);
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    nombreJugador: "",
    tipoLesion: "",
    fechaDesde: "",
    fechaHasta: "",
  });

  useEffect(() => {
    if (session?.user?.token) {
      limpiarLesiones(session.user.token)
        .then((res) => {
          console.log("Limpieza automática de lesiones:", res.message);
          queryClient.invalidateQueries(["lesiones"]);
        })
        .catch((error) => {
          console.error("Error al limpiar lesiones antiguas:", error);
        });
    }
  }, [session?.user?.token]);

  // Llamada a posibles lesiones si han pasado más de 5 minutos
  useEffect(() => {
    const fetchPosiblesLesionesSiEsNecesario = async () => {
      const ultimaConsulta = localStorage.getItem("ultimaConsultaPosiblesLesiones");
      const ahora = Date.now();
      const cincoMinutos = 5 * 60 * 1000;

      if (!ultimaConsulta || ahora - parseInt(ultimaConsulta) > cincoMinutos) {
        try {
          await getPosiblesLesiones();
          localStorage.setItem("ultimaConsultaPosiblesLesiones", ahora.toString());
        } catch (error) {
          console.warn("No se pudieron obtener las posibles lesiones:", error);
        }
      }
    };

    fetchPosiblesLesionesSiEsNecesario();
  }, []);

  const { data: lesiones = [], error, isLoading } = useQuery({
    queryKey: ["lesiones"],
    queryFn: getLesiones,
    staleTime: 1000 * 60 * 5,
    enabled: !!session,
  });

  const deleteLesionMutation = useMutation({
    mutationFn: (lesionId) => deleteLesion(lesionId, session?.user?.token),
    onSuccess: () => {
      queryClient.invalidateQueries(["lesiones"]);
    },
  });

  const [lesionesConNombre, setLesionesConNombre] = useState([]);

  useEffect(() => {
    if (!session?.user || !lesiones.length) return;

    const visibles = isAdmin
      ? lesiones
      : lesiones.filter((l) => l.fecha_recuperacion_estimada);

    Promise.all(
      visibles.map(async (lesion) => {
        try {
          const nombre = await getNombreJugador(lesion.jugador_id);
          return { ...lesion, jugador: nombre };
        } catch (error) {
          console.error("Error obteniendo nombre:", lesion.jugador_id, error);
          return { ...lesion, jugador: "Desconocido" };
        }
      })
    ).then((lesionesEnriquecidas) => {
      const ordenadas = lesionesEnriquecidas.sort(
        (a, b) =>
          new Date(a.fecha_recuperacion_estimada || 0) -
          new Date(b.fecha_recuperacion_estimada || 0)
      );
      setLesionesConNombre(ordenadas);
    });
  }, [JSON.stringify(lesiones), session, isAdmin]);

  const lesionesFiltradas = lesionesConNombre.filter((l) => {
    if (!isAdmin && !l.fecha_recuperacion_estimada) return false;

    const nombreMatch = l.jugador?.toLowerCase().includes(filtrosAplicados.nombreJugador);
    const tipoMatch = l.tipo_lesion?.toLowerCase().includes(filtrosAplicados.tipoLesion);

    const fechaRecuperacion = l.fecha_recuperacion_estimada
      ? new Date(`${l.fecha_recuperacion_estimada}T00:00:00`)
      : null;

    const desde = filtrosAplicados.fechaDesde
      ? new Date(`${filtrosAplicados.fechaDesde}T00:00:00`)
      : null;
    const hasta = filtrosAplicados.fechaHasta
      ? new Date(`${filtrosAplicados.fechaHasta}T00:00:00`)
      : null;

    const desdeOk = !desde || (fechaRecuperacion && fechaRecuperacion >= desde);
    const hastaOk = !hasta || (fechaRecuperacion && fechaRecuperacion <= hasta);

    return nombreMatch && tipoMatch && desdeOk && hastaOk;
  });

  if (status === "loading" || isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
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
        <h2 style={{ margin: 0, fontSize: "2rem" }}>Lista de Lesiones</h2>
        <p style={{ margin: 0, fontSize: "1rem", marginTop: "0.5rem" }}>
          Visualiza las lesiones registradas con el nombre del jugador.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setFiltrosAplicados({
            nombreJugador: nombreJugador.trim().toLowerCase(),
            tipoLesion: tipoLesion.trim().toLowerCase(),
            fechaDesde: range?.from ? format(range.from, "yyyy-MM-dd") : "",
            fechaHasta: range?.to ? format(range.to, "yyyy-MM-dd") : "",
          });
        }}
        style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          backgroundColor: "#000",
          padding: "1rem",
          borderRadius: "4px",
          flexWrap: "wrap",
        }}
      >
        <label style={{ color: "#fff" }}>
          Jugador:
          <input
            type="text"
            value={nombreJugador}
            onChange={(e) => setNombreJugador(e.target.value)}
            placeholder="Ej: Lebron James"
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          />
        </label>

        <label style={{ color: "#fff" }}>
          Tipo de lesión:
          <input
            type="text"
            value={tipoLesion}
            onChange={(e) => setTipoLesion(e.target.value)}
            placeholder="Ej: Esguince"
            style={{
              marginLeft: "0.5rem",
              backgroundColor: "#000",
              color: "#fff",
              border: "1px solid #fff",
              padding: "0.5rem",
              borderRadius: "4px",
            }}
          />
        </label>

        <SimpleDateRangePicker range={range} setRange={setRange} />

        <button
          type="submit"
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "red")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000")}
        >
          Filtrar
        </button>

        <button
          type="button"
          onClick={() => {
            setNombreJugador("");
            setTipoLesion("");
            setRange(undefined);
            setFiltrosAplicados({
              nombreJugador: "",
              tipoLesion: "",
              fechaDesde: "",
              fechaHasta: "",
            });
          }}
          style={{
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #fff",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "red")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#000")}
        >
          Resetear
        </button>
      </form>

      <DataTable
        lesiones={lesionesFiltradas}
        isAdmin={isAdmin}
        onDelete={(id) => deleteLesionMutation.mutate(id)}
      />
    </div>
  );
}