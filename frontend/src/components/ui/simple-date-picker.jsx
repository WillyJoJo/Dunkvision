"use client";

import { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";

export default function SimpleDatePicker({ date, setDate }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const textoBoton = date
    ? `Día ${format(date, "dd/MM/yyyy")}`
    : "Seleccionar día";

  // Cierra el calendario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  return (
    <div style={{ position: "relative", marginBottom: "1rem" }} ref={calendarRef}>
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
        {textoBoton}
      </button>

      {showCalendar && (
        <div
          style={{
            position: "absolute",
            bottom: "110%",
            left: 0,
            zIndex: 20,
            backgroundColor: "#fff",
            color: "#000",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              setDate(selectedDate);
              setShowCalendar(false);
            }}
            defaultMonth={new Date()}
          />
        </div>
      )}

      {date && (
        <span
          style={{
            color: "#ccc",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
            marginLeft: "0.5rem",
            display: "inline-block",
          }}
        >
          Día seleccionado: {format(date, "dd/MM/yyyy")}
        </span>
      )}
    </div>
  );
}