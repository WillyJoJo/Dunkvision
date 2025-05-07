"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Tu botón personalizado

export default function HomePage() {
  return (
    <main className="flex justify-center items-center min-h-[calc(100vh-4rem)] px-4 bg-muted">
      <Card className="w-full max-w-4xl shadow-lg p-10">
        <CardContent className="flex flex-col items-center text-center space-y-8">
          <img
            src="/logo.png"
            alt="Logo Dunkvision"
            className="w-28 h-28"
          />

          <div>
            <CardTitle className="text-4xl font-bold text-red-600 mb-2">
              Bienvenido a <span className="text-black">DUNKVISION</span>
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground max-w-2xl mx-auto">
              Plataforma inteligente para explorar estadísticas avanzadas,
              consultar lesiones y predecir resultados de la NBA mediante
              modelos de inteligencia artificial.
            </CardDescription>
          </div>

          <hr className="w-full border-t border-gray-200" />

          <div>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">
              ¿Qué puedes encontrar aquí?
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Explora información detallada de equipos y jugadores, consulta estadísticas avanzadas partido a partido,
              revisa el historial de lesiones y accede a predicciones generadas por modelos estadísticos
              diseñados especialmente para la NBA.
            </p>
          </div>

          <Button asChild size="lg" className="mt-4">
            <a href="/equipos" className="text-white">Explora Equipos</a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}