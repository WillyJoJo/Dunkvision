"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

export default function SimpleDateRangePicker({ range, setRange }) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Formatea el texto del botón según selección
  const formatTextoBoton = () => {
    if (range?.from && range?.to) {
      return `Del ${format(range.from, "dd/MM/yyyy")} al ${format(range.to, "dd/MM/yyyy")} (incluido)`;
    }
    if (range?.from) {
      return `Día ${format(range.from, "dd/MM/yyyy")}`;
    }
    return "Seleccionar rango";
  };

  // Asegura que si solo hay "from", también se use como "to" para el filtrado
  useEffect(() => {
    if (range?.from && !range?.to) {
      setRange({ from: range.from, to: range.from });
    }
  }, [range?.from, range?.to]);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setShowCalendar((prev) => !prev)}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          border: "1px solid #fff",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: "pointer",
          width: "250px",
        }}
      >
        {formatTextoBoton()}
      </button>

      {showCalendar && (
        <div
          style={{
            position: "absolute",
            zIndex: 10,
            top: "110%",
            backgroundColor: "#fff",
            color: "#000",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            defaultMonth={new Date()}
          />
        </div>
      )}
    </div>
  );
}