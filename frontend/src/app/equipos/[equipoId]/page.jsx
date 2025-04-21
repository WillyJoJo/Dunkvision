// app/equipos/[equipoId]/page.jsx
import EquipoCliente from "./EquipoCliente";

export default function Page({ params }) {
  return <EquipoCliente equipoId={params.equipoId} />;
}
