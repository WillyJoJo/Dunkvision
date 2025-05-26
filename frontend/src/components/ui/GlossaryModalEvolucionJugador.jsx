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

export default function GlossaryModalEvolucionJugador() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="text-xs sm:text-sm">
          ¿Qué significa cada estadística?
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Glosario de estadísticas de evolución</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="space-y-2 text-left">
          {[
            ["MIN", "Minutos jugados por partido"],
            ["PTS", "Puntos anotados por partido"],
            ["AST", "Asistencias por partido"],
            ["RO", "Rebotes ofensivos por partido"],
            ["RD", "Rebotes defensivos por partido"],
            ["STL", "Robos por partido"],
            ["BLK", "Tapones por partido"],
            ["PERD", "Pérdidas de balón por partido"],
            ["FAL", "Faltas cometidas por partido"],
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