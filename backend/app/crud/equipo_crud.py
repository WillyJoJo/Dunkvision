from app.models import Equipo

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