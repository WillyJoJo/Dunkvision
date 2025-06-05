"use client";

import { useEffect, useState } from "react";
import Autosuggest from "react-autosuggest";
import Select from "react-select";
import { getEquipos } from "@/services/equiposService";
import { getJugadoresByEquipoId, getJugadores } from "@/services/jugadoresService";
import { getJugadorFichado, predecirPartido } from "@/services/prediccionService";
import { toast } from "sonner";

// Estilos personalizados para react-select
const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#222",
    color: "#fff",
    borderColor: state.isFocused ? "#555" : "#333",
    boxShadow: "none",
    "&:hover": { borderColor: "#777" },
  }),
  singleValue: (base) => ({ ...base, color: "#fff" }),
  menu: (base) => ({ ...base, backgroundColor: "#111", color: "#fff", zIndex: 1000 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#333" : state.isSelected ? "#444" : "#111",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
  }),
  input: (base) => ({ ...base, color: "#fff" }),
  placeholder: (base) => ({ ...base, color: "#bbb" }),
};

export default function PrediccionCliente() {
  const [equipos, setEquipos] = useState([]);
  const [equipo1, setEquipo1] = useState(null);
  const [equipo2, setEquipo2] = useState(null);
  const [jugadoresLesionados, setJugadoresLesionados] = useState([]);
  const [jugadoresDisponiblesEq1, setJugadoresDisponiblesEq1] = useState([]);
  const [jugadoresDisponiblesEq2, setJugadoresDisponiblesEq2] = useState([]);
  const [busquedaFichaje, setBusquedaFichaje] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [jugadorFichajeId, setJugadorFichajeId] = useState("");
  const [temporadaFichaje, setTemporadaFichaje] = useState("24");
  const [equipoDestinoFichaje, setEquipoDestinoFichaje] = useState("");
  const [fichajes, setFichajes] = useState([]);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    getEquipos().then(setEquipos);
  }, []);

  useEffect(() => {
    if (equipo1) getJugadoresByEquipoId(equipo1.value).then(setJugadoresDisponiblesEq1);
    if (equipo2) getJugadoresByEquipoId(equipo2.value).then(setJugadoresDisponiblesEq2);
  }, [equipo1, equipo2]);

  useEffect(() => {
    setFichajes((prev) =>
      prev.filter(
        (f) =>
          f.equipo_id === parseInt(equipo1?.value) ||
          f.equipo_id === parseInt(equipo2?.value)
      )
    );
  }, [equipo1, equipo2]);

  const onSuggestionsFetchRequested = async ({ value }) => {
    if (!value.trim()) return setSugerencias([]);
    const data = await getJugadores({ busqueda: value });
    const idsFichados = new Set(fichajes.map((f) => f.id_jugador));
    const filtrados = data.filter((j) => !idsFichados.has(j.id));
    setSugerencias(filtrados);
  };

  const onSuggestionsClearRequested = () => setSugerencias([]);
  const getSuggestionValue = (s) => s.nombre;
  const renderSuggestion = (s) => (
    <div className="flex items-center gap-2 p-2 text-white">
      <img
        src={`https://cdn.nba.com/headshots/nba/latest/260x190/${s.id}.png`}
        alt={s.nombre}
        className="w-8 h-8 rounded bg-white"
        onError={(e) => (e.target.src = "/placeholder-player.png")}
      />
      <span>
        {s.nombre}{" "}
        <span className="text-gray-400">({s.nombre_equipo})</span>
      </span>
    </div>
  );

  const onSuggestionSelected = (_, { suggestion }) => {
    setJugadorFichajeId(suggestion.id);
    setBusquedaFichaje(suggestion.nombre);
  };

  const handleSwapEquipos = () => {
    setEquipo1(equipo2);
    setEquipo2(equipo1);
    setResultado(null);
  };

  const handleAddFichaje = async () => {
    if (!jugadorFichajeId || !temporadaFichaje || !equipoDestinoFichaje) {
      toast.error("Faltan campos");
      return;
    }

    try {
      const fichaje = await getJugadorFichado(
        jugadorFichajeId,
        temporadaFichaje,
        parseInt(equipoDestinoFichaje)
      );
      setFichajes((prev) => [...prev, fichaje]);
      setBusquedaFichaje("");
      setJugadorFichajeId("");
      toast.success("Fichaje añadido");
    } catch {
      toast.error("No se pudo añadir");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!equipo1 || !equipo2) {
      toast.error("Selecciona ambos equipos");
      return;
    }

    try {
      const data = await predecirPartido(
        parseInt(equipo1.value),
        parseInt(equipo2.value),
        jugadoresLesionados,
        fichajes
      );
      setResultado(data);
      toast.success("Predicción generada");
    } catch {
      toast.error("Error al predecir");
    }
  };

  const nombreEquipo = (id) =>
    equipos.find((e) => e.id === parseInt(id))?.nombre || `Equipo ${id}`;

  const opcionesEquipos = equipos.map((eq) => ({
    value: eq.id.toString(),
    label: (
      <div className="flex items-center gap-2">
        <img
          src={`https://cdn.nba.com/logos/nba/${eq.id}/global/L/logo.svg`}
          alt={eq.nombre}
          className="w-6 h-6 object-contain bg-white rounded"
          onError={(e) => (e.target.src = "/placeholder-logo.svg")}
        />
        <span>{eq.nombre}</span>
      </div>
    ),
  }));

  return (
    <div className="max-w-5xl mx-auto p-6 text-white bg-[#1a1a1a] rounded-xl space-y-6">
      <h1 className="text-2xl font-bold text-center">Simulación de Partido</h1>

      {/* Equipos */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Equipo Local</label>
          <Select
            styles={customSelectStyles}
            options={opcionesEquipos.filter((opt) => opt.value !== equipo2?.value)}
            value={equipo1}
            onChange={setEquipo1}
            placeholder="Selecciona un equipo"
            isSearchable={false}
            isClearable={false}
          />
        </div>

        {equipo1 && equipo2 && (
          <button
            type="button"
            onClick={handleSwapEquipos}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            ⇄ Intercambiar
          </button>
        )}

        <div className="flex-1">
          <label className="block font-semibold mb-1">Equipo Visitante</label>
          <Select
            styles={customSelectStyles}
            options={opcionesEquipos.filter((opt) => opt.value !== equipo1?.value)}
            value={equipo2}
            onChange={setEquipo2}
            placeholder="Selecciona un equipo"
            isSearchable={false}
            isClearable={false}
          />
        </div>
      </div>

      {/* Lesionados */}
      <div>
        <label className="block font-semibold mb-2">Jugadores lesionados</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[...jugadoresDisponiblesEq1, ...jugadoresDisponiblesEq2].map((j) => (
            <label key={j.id_jugador} className="flex items-center gap-2">
              <img
                src={`https://cdn.nba.com/headshots/nba/latest/260x190/${j.id_jugador}.png`}
                alt={j.nombre}
                className="w-8 h-8 object-cover rounded bg-white"
                onError={(e) => (e.target.src = "/placeholder-player.png")}
              />
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

      {/* Fichajes */}
      <div className="border border-gray-600 rounded p-4">
        <h2 className="font-bold mb-3">Añadir Fichaje</h2>
        <div className="flex flex-wrap gap-2 items-center">
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
              onChange: (_, { newValue }) => setBusquedaFichaje(newValue),
              className: "react-autosuggest__input",
            }}
            theme={{
              container: "react-autosuggest__container",
              suggestionsContainer: "react-autosuggest__suggestions-container",
              suggestion: "react-autosuggest__suggestion",
              suggestionHighlighted: "react-autosuggest__suggestion--highlighted",
            }}
          />

          <input
            type="text"
            value={temporadaFichaje}
            onChange={(e) => setTemporadaFichaje(e.target.value)}
            className="w-16 p-2 rounded bg-[#222] border border-gray-600 text-white"
            placeholder="Temp"
          />
          <select
            value={equipoDestinoFichaje}
            onChange={(e) => setEquipoDestinoFichaje(e.target.value)}
            className="p-2 rounded bg-[#222] border border-gray-600 text-white"
          >
            <option value="">Equipo destino</option>
            {[equipo1, equipo2].filter(Boolean).map((eq) => (
              <option key={eq.value} value={eq.value}>
                {nombreEquipo(eq.value)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddFichaje}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
          >
            Añadir
          </button>
        </div>
      </div>

      {/* Botón */}
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full py-3 rounded bg-green-600 hover:bg-green-500 font-bold"
      >
        Predecir Resultado
      </button>

      {/* Resultado */}
      {resultado && (
        <div className="mt-6 p-4 border rounded bg-[#2a2a2a]">
          <h3 className="text-lg font-semibold mb-4">Resultado</h3>
          <div className="flex justify-around items-center mb-4">
            {[equipo1, equipo2].map((equipo, index) => {
              const gana = resultado.equipo1_gana === (index === 0);
              const color = gana ? "#00cc66" : "#cc0000";
              return (
                <div key={equipo.value} className="text-center">
                  <img
                    src={`https://cdn.nba.com/logos/nba/${equipo.value}/global/L/logo.svg`}
                    alt={`Logo ${nombreEquipo(equipo.value)}`}
                    className="w-14 h-14 object-contain bg-white rounded"
                  />
                  <p style={{ color }} className="font-bold mt-1">
                    {gana ? "¡GANADOR!" : ""}
                  </p>
                  <p style={{ color }}>{nombreEquipo(equipo.value)}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm">
            <p>
              {nombreEquipo(equipo1.value)}:{" "}
              <strong>{resultado.probabilidad_equipo1.toFixed(2)}%</strong>
            </p>
            <p>
              {nombreEquipo(equipo2.value)}:{" "}
              <strong>{resultado.probabilidad_equipo2.toFixed(2)}%</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}