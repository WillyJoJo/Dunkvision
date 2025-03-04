from app.models import Equipo
from sqlalchemy import func

## Método GET Equipo por ID
def obtener_equipo(id_equipo):
    """
    Lógica para obtener un equipo por su ID.
    """
    equipo = Equipo.query.get(id_equipo)
    if not equipo:
        return {"error": "Equipo no encontrado"}, 404
    
    # Ejemplo de cómo devolver la info
    return {
        "id": equipo.id_equipo,
        "nombre": equipo.nombre,
        "conferencia": equipo.conferencia,
        "division": equipo.division,
        "record": equipo.record
    }, 200

## Método GET Listar Equipos
def listar_equipos():
    """
    Lógica para listar todos los equipos.
    """
    equipos = Equipo.query.all()
    lista = [
        {"id": e.id_equipo, "nombre": e.nombre, "conferencia": e.conferencia, "division": e.division, "record": e.record}
        for e in equipos
    ]
    return lista, 200

def filtrar_equipos_logica(conferencia=None, division=None, puesto=None):
    consulta = Equipo.query

    if conferencia and conferencia.strip() != "":
        # Comparación insensible a mayúsculas
        consulta = consulta.filter(func.lower(Equipo.conferencia) == conferencia.lower())
    
    if division and division.strip() != "":
        consulta = consulta.filter(func.lower(Equipo.division) == division.lower())
    
    # Ordenar por record descendente (suponiendo que 'record' es un campo numérico)
    consulta = consulta.order_by(Equipo.record.desc())

    equipos = consulta.all()

    # Si se solicitó 'puesto', tomar únicamente el equipo que ocupa esa posición (puesto es 1-indexado)
    if puesto is not None:
        if len(equipos) < puesto:
            return {"error": "No hay suficientes equipos para ese puesto"}, 404
        equipos = [equipos[puesto - 1]]

    lista = []
    for e in equipos:
        lista.append({
            "id": e.id_equipo,
            "nombre": e.nombre,
            "conferencia": e.conferencia,
            "division": e.division,
            "record": e.record
        })

    return lista, 200
