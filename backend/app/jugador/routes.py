from flask import Blueprint, request, jsonify
from app.jugador.crud import (
    obtener_jugador,
    listar_jugadores,
    filtrar_jugadores_logica,
    jugador_by_equipo
)

jugador_bp = Blueprint('jugador_bp', __name__, url_prefix='/api/jugadores')

## GET : Listar Jugadores
@jugador_bp.route('', methods=['GET'])
def route_jugadores():
    busqueda = request.args.get('busqueda')  # Nuevo parámetro
    equipo = request.args.get('equipo', type=int)
    posicion = request.args.get('posicion')

    if busqueda or equipo or posicion:
        respuesta, status = filtrar_jugadores_logica(busqueda, equipo, posicion)
    else:
        respuesta, status = listar_jugadores()
    
    return jsonify(respuesta), status

## GET : Jugador por ID
@jugador_bp.route('/<int:id_jugador>', methods=['GET'])
def route_obtener_jugador(id_jugador):
    respuesta, status = obtener_jugador(id_jugador)
    return jsonify(respuesta), status

## GET: Jugador by equipo_id
@jugador_bp.route('/equipo/<int:id_equipo>', methods=['GET'])
def route_jugadores_por_equipo(id_equipo):
    respuesta, status = jugador_by_equipo(id_equipo)
    return jsonify(respuesta), status