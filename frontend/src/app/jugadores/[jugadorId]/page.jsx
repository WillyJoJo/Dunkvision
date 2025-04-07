import JugadorCliente from "./JugadorCliente";

export default function Page({ params }) {
  return <JugadorCliente jugadorId={params.jugadorId} />;
}
