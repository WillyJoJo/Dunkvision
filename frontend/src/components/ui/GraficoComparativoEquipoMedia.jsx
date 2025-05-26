"use client";

import GlossaryModal from "./GlossaryModal";
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

const GRUPOS = {
    Estadísticas: [
        "puntos", "asistencias", "rebotes_ofensivos", "rebotes_defensivos", "rebotes_totales",
        "robos", "tapones", "perdidas_balon", "faltas_cometidas",
        "tiros_de_campo_intentados", "triples_intentados", "tiros_de_dos_intentados",
        "tiros_libres_intentados", "rating_ofensivo", "rating_defensivo", "ritmo",
        "victorias", "derrotas"
    ],
    Porcentajes: [
        "porcentaje_tiros_de_campo", "porcentaje_triples", "porcentaje_tiros_de_dos",
        "porcentaje_efectivo_tiros_de_campo", "porcentaje_tiros_libres"
    ],
    Avanzadas: ["strength_of_schedule", "simple_rating_system", "margen_de_victoria"]
};

const CLAVES = [
    { key: "puntos", label: "PTS" },
    { key: "asistencias", label: "AST" },
    { key: "rebotes_ofensivos", label: "RO" },
    { key: "rebotes_defensivos", label: "RD" },
    { key: "rebotes_totales", label: "RT" },
    { key: "robos", label: "STL" },
    { key: "tapones", label: "BLK" },
    { key: "perdidas_balon", label: "TO" },
    { key: "faltas_cometidas", label: "FAL" },
    { key: "tiros_de_campo_intentados", label: "FGA" },
    { key: "porcentaje_tiros_de_campo", label: "FG%" },
    { key: "triples_intentados", label: "3PA" },
    { key: "porcentaje_triples", label: "3P%" },
    { key: "tiros_de_dos_intentados", label: "2PA" },
    { key: "porcentaje_tiros_de_dos", label: "2P%" },
    { key: "porcentaje_efectivo_tiros_de_campo", label: "eFG%" },
    { key: "tiros_libres_intentados", label: "FTA" },
    { key: "porcentaje_tiros_libres", label: "FT%" },
    { key: "rating_ofensivo", label: "ORtg" },
    { key: "rating_defensivo", label: "DRtg" },
    { key: "strength_of_schedule", label: "SOS" },
    { key: "simple_rating_system", label: "SRS" },
    { key: "ritmo", label: "Pace" },
    { key: "margen_de_victoria", label: "MOV" },
    { key: "victorias", label: "W" },
    { key: "derrotas", label: "L" },
];

export default function GraficoComparativoEquipoMedia({ estadisticas, media }) {
    const [grupoSeleccionado, setGrupoSeleccionado] = useState("Estadísticas");

    const clavesFiltradas = CLAVES.filter(c =>
        GRUPOS[grupoSeleccionado].includes(c.key)
    );

    const data = clavesFiltradas.map(({ key, label }) => {
        let valorEquipo = parseFloat(estadisticas[key]) ?? 0;
        let valorMedia = parseFloat(media[key]) ?? 0;

        if (grupoSeleccionado === "Porcentajes") {
            valorEquipo *= 100;
            valorMedia *= 100;
        }

        return {
            name: label,
            equipo: valorEquipo,
            media: valorMedia,
            rawEquipo: valorEquipo,
            rawMedia: valorMedia,
        };
    });

    const mostrarMedia = grupoSeleccionado !== "Avanzadas";
    const isPorcentaje = grupoSeleccionado === "Porcentajes";
    const isAvanzado = grupoSeleccionado === "Avanzadas";

    return (
        <Card className="mt-8 max-w-[1200px] mx-auto">
            <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <CardTitle className="text-lg">Gráfico Comparativo con la media</CardTitle>
                    <GlossaryModal />
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
                    }}
                >
                    {Object.keys(GRUPOS).map((grupo) => (
                        <option key={grupo} value={grupo}>
                            {grupo}
                        </option>
                    ))}
                </select>
            </CardHeader>
            <CardContent className="px-4 pt-4">
                <div style={{ overflowX: "auto" }}>
                    <div style={{ minWidth: "700px" }}>
                        <ChartContainer
                            config={{
                                equipo: { label: "Equipo", color: "#2563eb" },
                                media: { label: "Media", color: "#000" },
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
                                    contentStyle={{
                                        backgroundColor: "#1a1a1a",
                                        border: "1px solid #333",
                                        color: "#fff",
                                    }}
                                    itemStyle={{ color: "#fff" }}
                                    labelStyle={{ color: "#fff" }}
                                />
                                <Legend
                                    content={({ payload }) => (
                                        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem" }}>
                                            {payload.map((entry, index) => {
                                                const label = entry.value === "equipo" ? "Equipo" : "Media";
                                                const fallbackColor = entry.value === "equipo" ? "#2563eb" : "#000";
                                                const color = entry.color || fallbackColor;

                                                return (
                                                    <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                        <div style={{
                                                            width: "14px",
                                                            height: "14px",
                                                            backgroundColor: color,
                                                            borderRadius: "3px",
                                                            border: "1px solid #444"
                                                        }} />
                                                        <span style={{ color: "#8f8f8f", fontWeight: "bold" }}>{label}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                                <Bar dataKey="equipo">
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`equipo-${index}`}
                                            fill={isAvanzado && entry.rawEquipo < 0 ? "#ef4444" : "#2563eb"}
                                        />
                                    ))}
                                </Bar>
                                {mostrarMedia && (
                                    <Bar dataKey="media">
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`media-${index}`}
                                                fill={isAvanzado && entry.rawMedia < 0 ? "#ef4444" : "#000"}
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