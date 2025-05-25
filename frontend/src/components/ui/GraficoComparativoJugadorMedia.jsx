"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
} from "recharts";
import { useState } from "react";
import { ChartContainer } from "./chart";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import GlossaryModalJugadores from "./GlossaryModalJugadores";

const GRUPOS = {
    Estadísticas: [
        "puntos", "asistencias", "rebotes_ofensivos", "rebotes_defensivos", "rebotes_totales",
        "robos", "tapones", "perdidas_balon", "faltas_cometidas",
        "tiros_de_campo_intentados", "triples_intentados", "tiros_de_dos_intentados", "tiros_libres_intentados"
    ],
    Volumen: ["rating_ofensivo", "rating_defensivo", "partidos_jugados", "minutos_jugados"],
    Porcentajes: [
        "porcentaje_tiros_de_campo", "porcentaje_triples", "porcentaje_tiros_de_dos",
        "porcentaje_efectivo_tiros_de_campo", "porcentaje_tiros_libres", "usage_porcentage"
    ],
    Avanzadas: [
        "player_efficiency_rating", "box_plus_minus", "win_share_ofensivo",
        "win_share_defensivo", "win_share_total"
    ],
};

const CLAVES = [
    { key: "puntos", label: "PTS" },
    { key: "asistencias", label: "AST" },
    { key: "rebotes_ofensivos", label: "RO" },
    { key: "rebotes_defensivos", label: "RD" },
    { key: "rebotes_totales", label: "RT" },
    { key: "robos", label: "STL" },
    { key: "tapones", label: "BLK" },
    { key: "perdidas_balon", label: "PERD" },
    { key: "faltas_cometidas", label: "FAL" },
    { key: "tiros_de_campo_intentados", label: "FGA" },
    { key: "triples_intentados", label: "3PA" },
    { key: "tiros_de_dos_intentados", label: "2PA" },
    { key: "tiros_libres_intentados", label: "FTA" },
    { key: "porcentaje_tiros_de_campo", label: "FG%" },
    { key: "porcentaje_efectivo_tiros_de_campo", label: "eFG%" },
    { key: "porcentaje_triples", label: "3P%" },
    { key: "porcentaje_tiros_de_dos", label: "2P%" },
    { key: "porcentaje_tiros_libres", label: "FT%" },
    { key: "rating_ofensivo", label: "ORtg" },
    { key: "rating_defensivo", label: "DRtg" },
    { key: "usage_porcentage", label: "USG%" },
    { key: "player_efficiency_rating", label: "PER" },
    { key: "box_plus_minus", label: "BPM" },
    { key: "win_share_ofensivo", label: "WSO" },
    { key: "win_share_defensivo", label: "WSD" },
    { key: "win_share_total", label: "WST" },
    { key: "partidos_jugados", label: "PJ" },
    { key: "minutos_jugados", label: "MIN" },
];

export default function GraficoComparativoJugadorMedia({ estadisticas, media }) {
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("Estadísticas");

    const clavesFiltradas = CLAVES.filter(c => GRUPOS[grupoSeleccionado].includes(c.key));

    const data = clavesFiltradas.map(({ key, label }) => {
        let valorJugador = parseFloat(estadisticas[key]) ?? 0;
        let valorMedia = parseFloat(media[key]) ?? 0;

        if (grupoSeleccionado === "Porcentajes") {
            if (key !== "usage_porcentage") {
                valorJugador *= 100;
                valorMedia *= 100;
            }
        }

        return {
            name: label,
            jugador: valorJugador,
            media: valorMedia,
            rawJugador: valorJugador,
            rawMedia: valorMedia,
        };
    });

    const mostrarMedia = true;
    const isPorcentaje = grupoSeleccionado === "Porcentajes";
    const isAvanzado = grupoSeleccionado === "Avanzadas";

    return (
        <Card className="mt-8 max-w-[1200px] mx-auto border border-[#2a2a2a]">
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 border-b">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Comparativa con la media</CardTitle>
                    <GlossaryModalJugadores />
                </div>
                <select
                    value={grupoSeleccionado}
                    onChange={(e) => setGrupoSeleccionado(e.target.value)}
                    style={{
                        backgroundColor: "#111",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "1px solid #333",
                        fontSize: "1rem",
                        cursor: "pointer"
                    }}>
                    {Object.keys(GRUPOS).map((grupo) => (
                        <option key={grupo} value={grupo}>{grupo}</option>
                    ))}
                </select>
            </CardHeader>
            <CardContent className="px-4 pt-4">
                <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "700px" }}>
                        <ChartContainer
                            config={{
                                jugador: { label: "Jugador", color: "#16a34a" },
                                media: { label: "Media", color: "#eab308" },
                            }}
                            className="mt-4"
                        >
                            <BarChart
                                data={data}
                                barCategoryGap={4}
                                {...(data.length < 5 ? { barSize: 100 } : {})}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} />
                                <YAxis
                                    domain={
                                        isAvanzado
                                            ? [(dataMin) => Math.floor(dataMin) - 1, (dataMax) => Math.ceil(dataMax) + 1]
                                            : isPorcentaje
                                                ? [0, 100]
                                                : [0, (dataMax) => Math.ceil(dataMax) + 1]
                                    }
                                />
                                <Tooltip
                                    formatter={(value, name, item) => {
                                        const raw = item.payload[`raw${name.charAt(0).toUpperCase() + name.slice(1)}`];
                                        const num = typeof raw === "number" ? raw : parseFloat(raw);
                                        return isNaN(num) ? "–" : num.toFixed(2);
                                    }}
                                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", color: "#fff" }}
                                    itemStyle={{ color: "#fff" }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Legend
                                    content={({ payload }) => (
                                        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
                                            {payload.map((entry, index) => {
                                                const label = entry.dataKey === "jugador" ? "Jugador" : "Media";
                                                const color = entry.color || (entry.dataKey === "jugador" ? "#16a34a" : "#eab308");

                                                return (
                                                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                        <div
                                                            style={{
                                                                width: "14px",
                                                                height: "14px",
                                                                backgroundColor: color,
                                                                borderRadius: "3px",
                                                                border: "1px solid #444",
                                                            }}
                                                        />
                                                        <span style={{ color: "#8f8f8f", fontWeight: "bold" }}>{label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                                <Bar dataKey="jugador">
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`jugador-${index}`}
                                            fill={isAvanzado && entry.rawJugador < 0 ? "#ef4444" : "#16a34a"}
                                        />
                                    ))}
                                </Bar>
                                {mostrarMedia && (
                                    <Bar dataKey="media">
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`media-${index}`}
                                                fill={isAvanzado && entry.rawMedia < 0 ? "#ef4444" : "#eab308"}
                                            />
                                        ))}
                                    </Bar>
                                )}
                            </BarChart>
                        </ChartContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}