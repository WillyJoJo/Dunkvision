import NuevaLesionJugadorCliente from "./NuevaLesionJugadorCliente";

export default function Page({ params }) {
  return <NuevaLesionJugadorCliente jugadorId={params.jugadorId} />;
}
