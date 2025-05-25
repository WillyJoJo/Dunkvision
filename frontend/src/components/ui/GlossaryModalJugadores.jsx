"use client";

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

export default function GlossaryModalJugadores() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-xs sm:text-sm">
          ¿Qué significa cada estadística?
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Glosario de estadísticas (jugadores)</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-2 text-left">
          {[
            ["PTS", "Puntos por partido"],
            ["AST", "Asistencias por partido"],
            ["RO", "Rebotes ofensivos por partido"],
            ["RD", "Rebotes defensivos por partido"],
            ["RT", "Rebotes totales por partido"],
            ["STL", "Robos por partido"],
            ["BLK", "Tapones por partido"],
            ["PERD", "Pérdidas de balón por partido"],
            ["FAL", "Faltas cometidas por partido"],
            ["FGA", "Tiros de campo intentados por partido"],
            ["FG%", "Porcentaje de acierto en tiros de campo"],
            ["3PA", "Triples intentados por partido"],
            ["3P%", "Porcentaje de acierto en triples"],
            ["2PA", "Tiros de dos intentados por partido"],
            ["2P%", "Porcentaje de acierto en tiros de dos puntos"],
            ["FTA", "Tiros libres intentados por partido"],
            ["FT%", "Porcentaje de acierto en tiros libres"],
            ["eFG%", "Porcentaje efectivo de tiros de campo (ajustado por triples)"],
            ["ORtg", "Rating ofensivo (puntos generados por 100 posesiones)"],
            ["DRtg", "Rating defensivo (puntos permitidos por 100 posesiones)"],
            ["USG%", "Porcentaje de uso del jugador en posesiones ofensivas"],
            ["PER", "Índice de eficiencia del jugador"],
            ["BPM", "Box Plus/Minus (impacto por 100 posesiones respecto a la media)"],
            ["WSO", "Win Shares ofensivo (contribución a victorias en ataque)"],
            ["WSD", "Win Shares defensivo (contribución a victorias en defensa)"],
            ["WST", "Win Shares total (ataque + defensa)"],
            ["PJ", "Partidos jugados"],
            ["MIN", "Minutos jugados por partido"],
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