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

export default function GlossaryModal() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-xs sm:text-sm">
          ¿Qué significa cada estadística?
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Glosario de estadísticas</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-2 text-left">
          {[
            ["PTS", "Puntos totales anotados por partido"],
            ["AST", "Asistencias por partido"],
            ["RO", "Rebotes ofensivos"],
            ["RD", "Rebotes defensivos"],
            ["RT", "Rebotes totales"],
            ["STL", "Robos de balón"],
            ["BLK", "Tapones (bloqueos)"],
            ["TO", "Pérdidas de balón"],
            ["FAL", "Faltas cometidas"],
            ["FGA", "Tiros de campo intentados"],
            ["FG%", "Porcentaje de acierto en tiros de campo"],
            ["3PA", "Triples intentados"],
            ["3P%", "Porcentaje de acierto en triples"],
            ["2PA", "Tiros de dos puntos intentados"],
            ["2P%", "Porcentaje de acierto en tiros de dos puntos"],
            ["eFG%", "Porcentaje efectivo de tiros de campo (ajusta el valor de los triples)"],
            ["FTA", "Tiros libres intentados"],
            ["FT%", "Porcentaje de acierto en tiros libres"],
            ["ORtg", "Rating ofensivo (puntos por 100 posesiones)"],
            ["DRtg", "Rating defensivo (puntos permitidos por 100 posesiones)"],
            ["SOS", "Fuerza del calendario (calidad de los rivales enfrentados)"],
            ["SRS", "Sistema de rating simple (diferencial ajustado por SOS)"],
            ["Pace", "Ritmo de juego (posesiones por partido)"],
            ["MOV", "Margen de victoria promedio"],
            ["W", "Victorias"],
            ["L", "Derrotas"],
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