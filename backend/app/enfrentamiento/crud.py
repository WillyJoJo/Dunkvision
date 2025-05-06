from app.models import Enfrentamiento

def obtener_enfrentamiento(id_enfrentamiento):
    enfrentamiento = Enfrentamiento.query.get(id_enfrentamiento)
    if not enfrentamiento:
        return {"error": "Enfrentamiento no encontrado"}, 404

    return {
        "id": enfrentamiento.id_enfrentamiento,
        "equipo_local": enfrentamiento.equipo1_id,
        "equipo_visitante": enfrentamiento.equipo2_id,
        "puntos_local": enfrentamiento.puntos_equipo1,
        "puntos_visitante": enfrentamiento.puntos_equipo2,
        "fecha": enfrentamiento.fecha
    }, 200

def listar_enfrentamientos():
    enfrentamientos = Enfrentamiento.query.all()
    lista = [
        {
            "id": e.id_enfrentamiento,
            "equipo_local": e.equipo1_id,
            "equipo_visitante": e.equipo2_id,
            "puntos_local": e.puntos_equipo1,
            "puntos_visitante": e.puntos_equipo2,
            "fecha": e.fecha
        }
        for e in enfrentamientos
    ]
    return lista, 200

def listar_enfrentamientos_equipo(id_equipo):
    enfrentamientos = Enfrentamiento.query.filter(
        (Enfrentamiento.equipo1_id == id_equipo) |
        (Enfrentamiento.equipo2_id == id_equipo)
    ).all()
    return [
        {
            "id": e.id_enfrentamiento,
            "equipo_local": e.equipo1_id,
            "equipo_visitante": e.equipo2_id,
            "puntos_local": e.puntos_equipo1,
            "puntos_visitante": e.puntos_equipo2,
            "fecha": e.fecha
        } for e in enfrentamientos
    ], 200

def listar_enfrentamientos_equipo_local(id_equipo):
    enfrentamientos = Enfrentamiento.query.filter(
        Enfrentamiento.equipo1_id == id_equipo
    ).all()
    return [
        {
            "id": e.id_enfrentamiento,
            "equipo_local": e.equipo1_id,
            "equipo_visitante": e.equipo2_id,
            "puntos_local": e.puntos_equipo1,
            "puntos_visitante": e.puntos_equipo2,
            "fecha": e.fecha
        } for e in enfrentamientos
    ], 200

def listar_enfrentamientos_equipo_visitante(id_equipo):
    enfrentamientos = Enfrentamiento.query.filter(
        Enfrentamiento.equipo2_id == id_equipo
    ).all()
    return [
        {
            "id": e.id_enfrentamiento,
            "equipo_local": e.equipo1_id,
            "equipo_visitante": e.equipo2_id,
            "puntos_local": e.puntos_equipo1,
            "puntos_visitante": e.puntos_equipo2,
            "fecha": e.fecha
        } for e in enfrentamientos
    ], 200

def listar_enfrentamientos_fecha(fecha):
    enfrentamientos = Enfrentamiento.query.filter(
        Enfrentamiento.fecha == fecha
    ).all()
    return [
        {
            "id": e.id_enfrentamiento,
            "equipo_local": e.equipo1_id,
            "equipo_visitante": e.equipo2_id,
            "puntos_local": e.puntos_equipo1,
            "puntos_visitante": e.puntos_equipo2,
            "fecha": e.fecha
        } for e in enfrentamientos
    ], 200