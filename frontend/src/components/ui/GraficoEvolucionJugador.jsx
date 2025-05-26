"use client";

import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const ESTADISTICAS = [
  { key: "minutos_jugados", label: "MIN" },
  { key: "puntos", label: "PTS" },
  { key: "asistencias", label: "AST" },
  { key: "rebotes_ofensivos", label: "RO" },
  { key: "rebotes_defensivos", label: "RD" },
  { key: "robos", label: "STL" },
  { key: "tapones", label: "BLK" },
  { key: "perdidas_balon", label: "PERD" },
  { key: "faltas_cometidas", label: "FAL" },
  { key: "porcentaje_tiros_de_campo", label: "FG%", isPorcentaje: true },
  { key: "porcentaje_triples", label: "3P%", isPorcentaje: true },
  { key: "porcentaje_tiros_libres", label: "FT%", isPorcentaje: true },
];

function GlossaryModalEvolucionJugador() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-xs sm:text-sm">
          ¿Qué significa cada estadística?
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Glosario de estadísticas por partido</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-2 text-left">
          {[
            ["MIN", "Minutos jugados"],
            ["PTS", "Puntos anotados"],
            ["AST", "Asistencias"],
            ["RO", "Rebotes ofensivos"],
            ["RD", "Rebotes defensivos"],
            ["STL", "Robos"],
            ["BLK", "Tapones"],
            ["PERD", "Pérdidas de balón"],
            ["FAL", "Faltas cometidas"],
            ["FG%", "Porcentaje de acierto en tiros de campo"],
            ["3P%", "Porcentaje de acierto en triples"],
            ["FT%", "Porcentaje de acierto en tiros libres"],
          ].map(([sigla, definicion]) => (
            <div key={sigla} className="flex gap-2">
              <strong>{sigla}</strong>
              <span className="text-sm text-muted-foreground">{definicion}</span>
            </div>
          ))}
        </AlertDialogDescription>
        <div className="pt-4">
          <AlertDialogCancel className="w-full sm:w-auto">Cerrar</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function GraficoEvolucionJugador({ partidos }) {
  const [statKey, setStatKey] = useState("puntos");
  const statConfig = ESTADISTICAS.find((s) => s.key === statKey);

  const data = partidos
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    .reduce((acc, partido, index) => {
      const grupoIndex = Math.floor(index / 3);
      if (!acc[grupoIndex]) acc[grupoIndex] = [];
      acc[grupoIndex].push(partido);
      return acc;
    }, [])
    .map((grupo, i) => {
      const valores = grupo.map((p) =>
        statConfig.isPorcentaje ? (p[statKey] ?? 0) * 100 : p[statKey] ?? 0
      );
      const media = valores.reduce((a, b) => a + b, 0) / valores.length;
      return {
        semana: `Semana ${i + 1}`,
        valor: parseFloat(media.toFixed(2)),
      };
    });

  return (
    <Card className="mt-8 max-w-[1200px] mx-auto border border-[#2a2a2a]">
      <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-4 border-b">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Gráfico Evolución semanal</CardTitle>
          <GlossaryModalEvolucionJugador />
        </div>
        <select
          value={statKey}
          onChange={(e) => setStatKey(e.target.value)}
          style={{
            backgroundColor: "#111",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "1px solid #333",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          {ESTADISTICAS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="px-4 pt-4">
        <ChartContainer
          config={{
            valor: { label: statConfig.label, color: "#2563eb" },
          }}
          className="mt-4"
        >
          <AreaChart
            data={data}
            width={Math.max(data.length * 60, 700)}
            height={300}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="semana"
              tickLine={false}
              axisLine={false}
              tickMargin={16}
              angle={-35}
              height={65}
              textAnchor="end"
            />
            <YAxis
              width={40}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[
                (dataMin) => Math.floor(dataMin),
                (dataMax) => Math.ceil(dataMax + 2),
              ]}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="valor"
              type="monotone"
              fill="#2563eb"
              fillOpacity={0.25}
              stroke="#2563eb"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}