from app.models import Enfrentamiento

## Método GET Enfrentamiento por ID
def obtener_enfrentamiento(id_enfrentamiento):
    """
    Lógica para obtener un enfrentamiento por su ID.
    """
    enfrentamiento = Enfrentamiento.query.get(id_enfrentamiento)
    if not enfrentamiento:
        return {"error": "Enfrentamiento no encontrado"}, 404
    # Ejemplo de cómo devolver la info
    return {
        "id" : enfrentamiento.id_enfrentamiento,
        "equipo_local" : enfrentamiento.equipo1_id,
        "equipo_visitante" : enfrentamiento.equipo2_id,
        "puntos_local" : enfrentamiento.puntos_equipo1,
        "puntos_visitante" : enfrentamiento.puntos_equipo2,
        "fecha" : enfrentamiento.fecha
    }, 200

## Método GET Listar Enfrentamientos
def listar_enfrentamientos():
    """
    Lógica para listar todos los enfrentamientos.
    """
    enfrentamientos = Enfrentamiento.query.all()
    lista = [
        {"id" : e.id_enfrentamiento, "equipo_local" : e.equipo1_id, "equipo_visitante" : e.equipo2_id, "puntos_local" : e.puntos_equipo1, "puntos_visitante" : e.puntos_equipo2, "fecha" : e.fecha}
        for e in enfrentamientos
    ]
    return lista, 200

## Método GET Enfrentamientos por Equipo ID
def listar_enfrentamientos_equipo(id_equipo):
    """
    Lógica para listar todos los enfrentamientos de un equipo.
    """
    enfrentamientos = Enfrentamiento.query.filter((Enfrentamiento.equipo1_id == id_equipo) | (Enfrentamiento.equipo2_id == id_equipo)).all()
    lista = [
        {"id" : e.id_enfrentamiento, "equipo_local" : e.equipo1_id, "equipo_visitante" : e.equipo2_id, "puntos_local" : e.puntos_equipo1, "puntos_visitante" : e.puntos_equipo2, "fecha" : e.fecha}
        for e in enfrentamientos
    ]
    return lista, 200

## Método GET Enfrentamientos por Equipo ID como Local
def listar_enfrentamientos_equipo_local(id_equipo):
    """
    Lógica para listar todos los enfrentamientos de un equipo como local.
    """
    enfrentamientos = Enfrentamiento.query.filter(Enfrentamiento.equipo1_id == id_equipo).all()
    lista = [
        {"id" : e.id_enfrentamiento, "equipo_local" : e.equipo1_id, "equipo_visitante" : e.equipo2_id, "puntos_local" : e.puntos_equipo1, "puntos_visitante" : e.puntos_equipo2, "fecha" : e.fecha}
        for e in enfrentamientos
    ]
    return lista, 200

## Método GET Enfrentamientos por Equipo ID como Visitante
def listar_enfrentamientos_equipo_visitante(id_equipo):
    """
    Lógica para listar todos los enfrentamientos de un equipo como visitante.
    """
    enfrentamientos = Enfrentamiento.query.filter(Enfrentamiento.equipo2_id == id_equipo).all()
    lista = [
        {"id" : e.id_enfrentamiento, "equipo_local" : e.equipo1_id, "equipo_visitante" : e.equipo2_id, "puntos_local" : e.puntos_equipo1, "puntos_visitante" : e.puntos_equipo2, "fecha" : e.fecha}
        for e in enfrentamientos
    ]
    return lista, 200

## Método GET Enfrentamientos por Fecha
def listar_enfrentamientos_fecha(fecha):
    """
    Lógica para listar todos los enfrentamientos de una fecha.
    """
    enfrentamientos = Enfrentamiento.query.filter(Enfrentamiento.fecha == fecha).all()
    lista = [
        {"id" : e.id_enfrentamiento, "equipo_local" : e.equipo1_id, "equipo_visitante" : e.equipo2_id, "puntos_local" : e.puntos_equipo1, "puntos_visitante" : e.puntos_equipo2, "fecha" : e.fecha}
        for e in enfrentamientos
    ]
    return lista, 200