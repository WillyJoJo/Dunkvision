"use client";

import { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import { getEquipos } from "@/services/equiposService";
import { getJugadoresByEquipoId, getJugadores } from "@/services/jugadoresService";
import { getJugadorFichado, predecirPartido } from "@/services/prediccionService";
import { toast } from "sonner";

export default function PrediccionCliente() {
  const [equipos, setEquipos] = useState([]);
  const [equipo1, setEquipo1] = useState("");
  const [equipo2, setEquipo2] = useState("");

  const [jugadoresLesionados, setJugadoresLesionados] = useState([]);
  const [jugadoresDisponiblesEq1, setJugadoresDisponiblesEq1] = useState([]);
  const [jugadoresDisponiblesEq2, setJugadoresDisponiblesEq2] = useState([]);

  const [busquedaFichaje, setBusquedaFichaje] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [jugadoresFiltrados, setJugadoresFiltrados] = useState([]);
  const [jugadorFichajeId, setJugadorFichajeId] = useState("");
  const [temporadaFichaje, setTemporadaFichaje] = useState("24");
  const [equipoDestinoFichaje, setEquipoDestinoFichaje] = useState("");
  const [fichajes, setFichajes] = useState([]);

  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    getEquipos().then(setEquipos);
  }, []);

  useEffect(() => {
    if (equipo1) getJugadoresByEquipoId(equipo1).then(setJugadoresDisponiblesEq1);
    if (equipo2) getJugadoresByEquipoId(equipo2).then(setJugadoresDisponiblesEq2);
  }, [equipo1, equipo2]);

  useEffect(() => {
    setFichajes((prev) =>
      prev.filter((f) => f.equipo_id === parseInt(equipo1) || f.equipo_id === parseInt(equipo2))
    );
  }, [equipo1, equipo2]);

  const onSuggestionsFetchRequested = async ({ value }) => {
    if (!value.trim()) return setSugerencias([]);
    const data = await getJugadores({ busqueda: value });
    const idsFichados = new Set(fichajes.map((f) => f.id_jugador));
    const filtrados = data.filter((j) => !idsFichados.has(j.id));
    setJugadoresFiltrados(filtrados);
    setSugerencias(filtrados);
  };

  const onSuggestionsClearRequested = () => {
    setSugerencias([]);
  };

  const getSuggestionValue = (sugg) => sugg.nombre;

  const renderSuggestion = (sugg) => (
    <div>{sugg.nombre} ({sugg.nombre_equipo})</div>
  );

  const onSuggestionSelected = (_, { suggestion }) => {
    setJugadorFichajeId(suggestion.id);
    setBusquedaFichaje(suggestion.nombre);
  };

  const handleSwapEquipos = () => {
    setEquipo1(equipo2);
    setEquipo2(equipo1);
  };

  const handleAddFichaje = async () => {
    if (!jugadorFichajeId || !temporadaFichaje || !equipoDestinoFichaje) {
      toast.error("Selecciona jugador, temporada y equipo destino");
      return;
    }

    try {
      const fichaje = await getJugadorFichado(jugadorFichajeId, temporadaFichaje, parseInt(equipoDestinoFichaje));
      setFichajes((prev) => [...prev, fichaje]);
      setBusquedaFichaje("");
      setJugadorFichajeId("");
      toast.success("Fichaje añadido");
    } catch {
      toast.error("No se pudieron obtener las estadísticas del fichaje");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipo1 || !equipo2) {
      toast.error("Debes seleccionar ambos equipos");
      return;
    }

    try {
      const data = await predecirPartido(parseInt(equipo1), parseInt(equipo2), jugadoresLesionados, fichajes);
      setResultado(data);
      toast.success("Predicción generada correctamente");
    } catch {
      toast.error("Error al predecir el partido");
    }
  };

  const nombreEquipo = (id) => equipos.find((e) => e.id === parseInt(id))?.nombre || `Equipo ${id}`;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Simulación de Partido</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* EQUIPOS */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label>Equipo Local</label>
            <select className="w-full border p-2" value={equipo1} onChange={(e) => setEquipo1(e.target.value)}>
              <option value="">Selecciona un equipo</option>
              {equipos.filter((eq) => eq.id.toString() !== equipo2).map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
              ))}
            </select>
          </div>
          {equipo1 && equipo2 && (
            <button type="button" className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={handleSwapEquipos}>
              ⇄ Intercambiar
            </button>
          )}
          <div className="flex-1">
            <label>Equipo Visitante</label>
            <select className="w-full border p-2" value={equipo2} onChange={(e) => setEquipo2(e.target.value)}>
              <option value="">Selecciona un equipo</option>
              {equipos.filter((eq) => eq.id.toString() !== equipo1).map((eq) => (
                <option key={eq.id} value={eq.id}>{eq.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LESIONES */}
        <div>
          <label className="font-semibold">Jugadores lesionados</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            {[...jugadoresDisponiblesEq1, ...jugadoresDisponiblesEq2].map((j) => (
              <label key={j.id_jugador} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={j.id_jugador}
                  checked={jugadoresLesionados.includes(j.id_jugador)}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    setJugadoresLesionados((prev) =>
                      e.target.checked ? [...prev, id] : prev.filter((jid) => jid !== id)
                    );
                  }}
                />
                <span>{j.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* FICHAJES */}
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Añadir Fichaje</h3>
          <div className="flex flex-wrap gap-2 mb-2 items-center">
            <Autosuggest
              suggestions={sugerencias}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              onSuggestionSelected={onSuggestionSelected}
              inputProps={{
                placeholder: "Buscar jugador",
                value: busquedaFichaje,
                onChange: (_, { newValue }) => setBusquedaFichaje(newValue)
              }}
            />
            <input
              type="text"
              className="w-20 border p-2"
              placeholder="Temp"
              value={temporadaFichaje}
              onChange={(e) => setTemporadaFichaje(e.target.value)}
            />
            <select
              className="border p-2"
              value={equipoDestinoFichaje}
              onChange={(e) => setEquipoDestinoFichaje(e.target.value)}
            >
              <option value="">Equipo destino</option>
              {[equipo1, equipo2].filter(Boolean).map((id) => {
                const eq = equipos.find((e) => e.id.toString() === id);
                return eq && <option key={eq.id} value={eq.id}>{eq.nombre}</option>;
              })}
            </select>
            <button
              type="button"
              className="bg-blue-500 text-white px-3 py-2 rounded"
              onClick={handleAddFichaje}
            >
              Añadir
            </button>
          </div>
          {fichajes.length > 0 && (
            <ul className="list-disc pl-4">
              {fichajes.map((j) => (
                <li key={j.id_jugador} className="flex items-center justify-between">
                  <span>{j.nombre} (Equipo: {nombreEquipo(j.equipo_id)})</span>
                  <button
                    type="button"
                    className="text-red-500 ml-4"
                    onClick={() => setFichajes((prev) => prev.filter((f) => f.id_jugador !== j.id_jugador))}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded">
          Predecir Resultado
        </button>
      </form>

      {resultado && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold mb-2">Resultado</h3>
          <p>
            Ganador: <strong>
              {resultado.equipo1_gana ? nombreEquipo(equipo1) : nombreEquipo(equipo2)}
            </strong>
          </p>
          <p>
            {nombreEquipo(equipo1)}:{" "}
            <strong>{resultado.probabilidad_equipo1.toFixed(2)}%</strong>
          </p>
          <p>
            {nombreEquipo(equipo2)}:{" "}
            <strong>{resultado.probabilidad_equipo2.toFixed(2)}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}