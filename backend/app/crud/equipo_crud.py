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
    
    return {
        "id": equipo.id_equipo,
        "nombre": equipo.nombre,
        "conferencia": equipo.conferencia,
        "division": equipo.division,
    }, 200

## Método GET Listar Equipos
def listar_equipos():
    """
    Lógica para listar todos los equipos.
    """
    equipos = Equipo.query.all()
    lista = [
        {"id": e.id_equipo, "nombre": e.nombre, "conferencia": e.conferencia, "division": e.division}
        for e in equipos
    ]
    return lista, 200

def filtrar_equipos_logica(conferencia=None, division=None, orden=None):
    """
    Lógica para filtrar equipos por conferencia y división, y ordenarlos alfabéticamente
    según el parámetro 'orden' (ascendente o descendente). Si 'orden' es None o "asc", se ordena de forma ascendente.
    """
    consulta = Equipo.query

    if conferencia and conferencia.strip() != "":
        # Comparación insensible a mayúsculas
        consulta = consulta.filter(func.lower(Equipo.conferencia) == conferencia.lower())
    
    if division and division.strip() != "":
        consulta = consulta.filter(func.lower(Equipo.division) == division.lower())
    
    # Ordenar por el nombre: por defecto ascendente, o descendente si se especifica "desc"
    if not orden or orden.lower() == "asc":
        consulta = consulta.order_by(Equipo.nombre.asc())
    elif orden.lower() == "desc":
        consulta = consulta.order_by(Equipo.nombre.desc())
    
    equipos = consulta.all()

    lista = []
    for e in equipos:
        lista.append({
            "id": e.id_equipo,
            "nombre": e.nombre,
            "conferencia": e.conferencia,
            "division": e.division
        })

    return lista, 200
