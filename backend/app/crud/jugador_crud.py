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

## Método GET Filtrar Jugadores
def filtrar_jugadores_logica(letra_apellido=None, equipo=None, posicion=None):
    """
    Filtra jugadores según los siguientes criterios:
      - 'letra_apellido': Filtra aquellos jugadores cuyo apellido (la parte del nombre después del primer espacio)
         empiece por la letra dada (insensible a mayúsculas).
      - 'equipo': Filtra jugadores por su 'equipo_id'.
      - 'posicion': Filtra jugadores que jueguen en la posición indicada. 
         Si el campo 'posicion' contiene dos valores (ej. 'G-F'), se considera válida la coincidencia si alguna de las dos posiciones coincide.
    """
    consulta = Jugador.query

    # Filtro por la inicial del apellido extraído del nombre.
    # Se asume que el apellido es la parte del nombre después del primer espacio.
    if letra_apellido and letra_apellido.strip() != "":
        # Aseguramos que el nombre contenga al menos un espacio para separar el apellido.
        consulta = consulta.filter(Jugador.nombre.like('% %'))
        apellido_expr = func.substr(Jugador.nombre, func.instr(Jugador.nombre, ' ') + 1)
        consulta = consulta.filter(func.lower(apellido_expr).like(letra_apellido.lower() + '%'))
    
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
