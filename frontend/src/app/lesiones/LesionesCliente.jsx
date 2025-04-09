"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getLesiones,
    getNombreJugador,
    deleteLesion,
    limpiarLesiones,
} from "@/services/lesionesService";
import { DataTable } from "./data-table";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function LesionesCliente() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.rol === "admin";
    const queryClient = useQueryClient();

    const [nombreJugador, setNombreJugador] = useState("");
    const [tipoLesion, setTipoLesion] = useState("");

    const [range, setRange] = useState(undefined);
    const [showCalendar, setShowCalendar] = useState(false);

    const [filtrosAplicados, setFiltrosAplicados] = useState({
        nombreJugador: "",
        tipoLesion: "",
        fechaDesde: "",
        fechaHasta: "",
    });

    // 🔧 Sumar días a una fecha
    const sumarDias = (fecha, dias) => {
        const nuevaFecha = new Date(fecha);
        nuevaFecha.setDate(nuevaFecha.getDate() + dias);
        return nuevaFecha.toISOString().split("T")[0];
    };

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

    const { data: lesiones = [], error, isLoading } = useQuery({
        queryKey: ["lesiones"],
        queryFn: getLesiones,
        staleTime: 1000 * 60 * 5,
    });

    const deleteLesionMutation = useMutation({
        mutationFn: (lesionId) => deleteLesion(lesionId, session?.user?.token),
        onSuccess: () => {
            queryClient.invalidateQueries(["lesiones"]);
        },
    });

    const [lesionesConNombre, setLesionesConNombre] = useState([]);

    useEffect(() => {
        if (!session || session.status === "loading") return; // Esperamos a que la sesión esté lista
        if (!lesiones || lesiones.length === 0) {
            setLesionesConNombre([]);
            return;
        }

        Promise.all(
            lesiones.map(async (lesion) => {
                try {
                    const nombre = await getNombreJugador(lesion.jugador_id);
                    return { ...lesion, jugador: nombre };
                } catch (error) {
                    console.error("Error obteniendo nombre:", lesion.jugador_id, error);
                    return { ...lesion, jugador: "Desconocido" };
                }
            })
        ).then((lesionesConNombre) => {
            let visibles = lesionesConNombre;

            // 🔍 Esta parte se ejecuta correctamente ahora que session está disponible
            if (!session?.user?.rol === "admin") {
                visibles = visibles.filter((l) => l.fecha_recuperacion_estimada);
            }

            const ordenadas = visibles.sort(
                (a, b) => new Date(a.fecha_recuperacion_estimada) - new Date(b.fecha_recuperacion_estimada)
            );

            setLesionesConNombre(ordenadas);
        });
    }, [JSON.stringify(lesiones), session]);


    const handleDelete = (lesionId) => {
        if (confirm("¿Estás seguro de eliminar esta lesión?")) {
            deleteLesionMutation.mutate(lesionId);
        }
    };

    const lesionesFiltradas = lesionesConNombre.filter((l) => {
        const nombreMatch = l.jugador.toLowerCase().includes(filtrosAplicados.nombreJugador);
        const tipoMatch = l.tipo_lesion?.toLowerCase().includes(filtrosAplicados.tipoLesion);
        const fecha = l.fecha_recuperacion_estimada;
        const desdeOk = !filtrosAplicados.fechaDesde || (fecha && fecha >= filtrosAplicados.fechaDesde);
        const hastaOk = !filtrosAplicados.fechaHasta || (fecha && fecha <= filtrosAplicados.fechaHasta);
        return nombreMatch && tipoMatch && desdeOk && hastaOk;
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            {/* Encabezado */}
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

            {/* Filtros */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setFiltrosAplicados({
                        nombreJugador: nombreJugador.trim().toLowerCase(),
                        tipoLesion: tipoLesion.trim().toLowerCase(),
                        fechaDesde: range?.from?.toISOString().split("T")[0] || "",
                        fechaHasta: range?.to ? sumarDias(range.to, 1) : "",
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
                        placeholder="Ej: Curry"
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
                        placeholder="Ej: esguince"
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

                {/* Calendario */}
                <div style={{ position: "relative" }}>
                    <button
                        type="button"
                        onClick={() => setShowCalendar((prev) => !prev)}
                        style={{
                            backgroundColor: "#000",
                            color: "#fff",
                            border: "1px solid #fff",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            width: "250px",
                        }}
                    >
                        {range?.from && range?.to
                            ? `Del ${format(range.from, "dd/MM/yyyy")} al ${format(range.to, "dd/MM/yyyy")} (incluido)`
                            : "Seleccionar rango"}
                    </button>

                    {showCalendar && (
                        <div
                            style={{
                                position: "absolute",
                                zIndex: 10,
                                top: "110%",
                                backgroundColor: "#fff",
                                color: "#000",
                                padding: "1rem",
                                borderRadius: "8px",
                                border: "1px solid #ccc",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            }}
                        >
                            <DayPicker
                                mode="range"
                                selected={range}
                                onSelect={setRange}
                                numberOfMonths={2}
                                defaultMonth={new Date()}
                            />
                        </div>
                    )}
                </div>

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

            {/* Tabla */}
            <DataTable
                lesiones={lesionesFiltradas}
                isAdmin={isAdmin}
                onDelete={handleDelete}
            />
        </div>
    );
}
