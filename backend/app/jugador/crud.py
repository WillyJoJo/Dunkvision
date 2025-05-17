from app.models import Jugador
from sqlalchemy import func, or_
from app import db

## Método GET Jugador por ID
def obtener_jugador(id_jugador):
    """
    Lógica para obtener un jugador por su ID.
    """
    jugador = Jugador.query.get(id_jugador)
    if not jugador:
        return {"error": "Jugador no encontrado"}, 404
    return {
        "id": jugador.id_jugador,
        "nombre": jugador.nombre,
        "equipo_id": jugador.equipo_id,
        "posicion": jugador.posicion
    }, 200

## Método GET Listar Jugadores
def listar_jugadores():
    """
    Lógica para listar todos los jugadores.
    """
    jugadores = Jugador.query.all()
    lista = [
        {
            "id": j.id_jugador,
            "nombre": j.nombre,
            "equipo_id": j.equipo_id,
            "posicion": j.posicion
        }
        for j in jugadores
    ]
    return lista, 200

# Método GET Filtrar Jugadores
def filtrar_jugadores_logica(busqueda=None, equipo=None, posicion=None):
    """
    Filtra jugadores según los siguientes criterios:
      - 'busqueda': Cadena de texto que debe aparecer en cualquier parte del nombre (nombre o apellido).
      - 'equipo': Filtra jugadores por su 'equipo_id'.
      - 'posicion': Filtra jugadores que jueguen en la posición indicada. 
         Si el campo 'posicion' contiene dos valores (ej. 'G-F'), se considera válida la coincidencia si alguna de las dos posiciones coincide.
    """
    consulta = Jugador.query

    if busqueda and busqueda.strip() != "":
        busqueda = f"%{busqueda.lower()}%"
        consulta = consulta.filter(func.lower(Jugador.nombre).like(busqueda))
    
    if equipo:
        consulta = consulta.filter(Jugador.equipo_id == equipo)
    
    if posicion and posicion.strip() != "":
        consulta = consulta.filter(
            or_(
                Jugador.posicion == posicion,
                Jugador.posicion.like(f'{posicion}-%'),
                Jugador.posicion.like(f'%-{posicion}')
            )
        )
    
    jugadores = consulta.all()
    lista = [
        {
            "id": j.id_jugador,
            "nombre": j.nombre,
            "equipo_id": j.equipo_id,
            "posicion": j.posicion
        }
        for j in jugadores
    ]
    return lista, 200

## Método DELETE Eliminar Jugador
def eliminar_jugador(id_jugador):
    """
    Elimina un jugador dado su ID.
    """
    jugador = Jugador.query.get(id_jugador)
    if not jugador:
        return {"error": "Jugador no encontrado"}, 404
    
    db.session.delete(jugador)
    db.session.commit()
    return {"mensaje": "Jugador eliminado exitosamente"}, 200

def jugador_by_equipo(equipo_id):
    """
    Lógica para obtener jugadores por equipo.
    """
    jugadores = Jugador.query.filter_by(equipo_id=equipo_id).all()
    if not jugadores:
        return {"error": "No se encontraron jugadores para este equipo"}, 404
    
    lista = [
        {
            "id": j.id_jugador,
            "nombre": j.nombre,
            "equipo_id": j.equipo_id,
            "posicion": j.posicion
        }
        for j in jugadores
    ]
    return lista, 200