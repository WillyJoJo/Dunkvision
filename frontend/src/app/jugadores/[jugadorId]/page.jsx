import { getJugadoresById } from "@/services/jugadoresService";
import { getEquiposById } from "@/services/equiposService";
import BotonLesionConEstado from "@/components/ui/BotonLesionConEstado"; // ✅ import nuevo

// Función para transformar abreviaciones a etiquetas con nombre completo
const transformarPosiciones = (abreviacion) => {
  const mapping = {
    G: "Base, Escolta",
    F: "Alero, Ala-Pívot",
    C: "Pívot",
  };

  if (!abreviacion) return [];

  return abreviacion
    .split("-")
    .map((pos) => mapping[pos] || "")
    .filter((p) => p !== "");
};

export default async function JugadorPage({ params }) {
  const jugador = await getJugadoresById(params.jugadorId);
  const equipo = await getEquiposById(jugador.equipo_id);

  return (
    <main style={{ padding: "2rem", color: "#fff" }}>
      {/* Encabezado degradado con el nombre del jugador */}
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #f00 100%)",
          color: "#fff",
          textAlign: "left",
          padding: "2rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          maxWidth: "600px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2.5rem", fontWeight: "bold" }}>
          {jugador.nombre}
        </h1>
      </div>

      {/* Caja con info del jugador */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          padding: "1.5rem 2rem",
          borderRadius: "10px",
          maxWidth: "600px",
          color: "#fff",
        }}
      >
        <div style={{ marginBottom: "1.5rem" }}>
          <strong style={{ display: "block", marginBottom: "0.5rem" }}>
            Posición:
          </strong>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {transformarPosiciones(jugador.posicion).map((texto, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: "#333",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                }}
              >
                {texto}
              </span>
            ))}
          </div>
        </div>

        <p style={{ marginBottom: "1.5rem" }}>
          <strong>Equipo:</strong> {equipo.nombre}
        </p>

        {/* ✅ Botón con control de estado de lesión */}
        <BotonLesionConEstado jugadorId={params.jugadorId} />
      </div>
    </main>
  );
}
