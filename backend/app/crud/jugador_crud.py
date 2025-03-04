from app.models import Jugador

## Método GET Jugador por ID
def obtener_jugador(id_jugador):
    """
    Lógica para obtener un equipo por su ID.
    """
    jugador = Jugador.query.get(id_jugador)
    if not jugador:
        return {"error": "Jugador no encontrado"}, 404
    # Ejemplo de cómo devolver la info
    return {
        "id" : jugador.id_jugador,
        "nombre" : jugador.nombre,
        "equipo_id" : jugador.equipo_id,
        "posicion" : jugador.posicion
    }, 200

## Método GET Listar Jugadores
def listar_jugadores():
    """
    Lógica para listar todos los equipos.
    """
    jugadores = Jugador.query.all()
    lista = [
        {"id" : j.id_jugador, "nombre" : j.nombre, "equipo_id" : j.equipo_id, "posicion" : j.posicion}
        for j in jugadores
    ]
    return lista, 200