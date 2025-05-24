"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent
} from "./chart";

export default function GraficoComparativoEquipoMedia({ estadisticas, media }) {
    if (!estadisticas || !media) return null;

    const claves = [
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
        { key: "margen_de_victoria", label: "+/-" },
        { key: "victorias", label: "W" },
        { key: "derrotas", label: "L" },
    ];

    const data = claves.map(({ key, label }) => {
        const valorEquipo = parseFloat(estadisticas[key]) ?? 0;
        const valorMedia = parseFloat(media[key]) ?? 0;

        return {
            name: label,
            equipo: Math.abs(valorEquipo),
            media: Math.abs(valorMedia),
            rawEquipo: valorEquipo,
            rawMedia: valorMedia,
        };
    });

    return (
        <ChartContainer
            config={{
                equipo: { label: "Equipo", color: "#2563eb" },
                media: { label: "Media", color: "#f97316" },
            }}
            className="mt-8"
        >
            <style>{`
        .recharts-tooltip-wrapper {
          color: white;
        }
        .recharts-default-tooltip {
          background-color: #1a1a1a !important;
          border: 1px solid #333 !important;
        }
        .recharts-legend-item-text {
          color: white !important;
        }
      `}</style>

            <BarChart data={data} barCategoryGap={4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} />
                <YAxis domain={[0, "dataMax + 1"]} />
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
                                const fallbackColor = entry.value === "equipo" ? "#2563eb" : "#f97316";
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
                            fill={
                                ["SOS", "SRS", "+/-"].includes(entry.name) && entry.rawEquipo < 0
                                    ? "#ef4444"
                                    : "#2563eb"
                            }
                        />
                    ))}
                </Bar>
                <Bar dataKey="media">
                    {data.map((entry, index) => (
                        <Cell
                            key={`media-${index}`}
                            fill={
                                ["SOS", "SRS", "+/-"].includes(entry.name) && entry.rawMedia < 0
                                    ? "#ef4444"
                                    : "#f97316"
                            }
                        />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}