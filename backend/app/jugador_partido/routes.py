from flask import Blueprint, jsonify, request
from app.jugador_partido.crud import (
    listar_jugador_partido,
    filtrar_jugador_partido_logica,
    get_jugador_partido_por_jugador_id,
    get_jugador_partido_por_enfrentamiento_id
)

jugador_partido_bp = Blueprint("jugador_partido_bp", __name__, url_prefix="/api/jugador_partido")

# GET : Listar Estadísticas de Jugadores en Partidos
@jugador_partido_bp.route("", methods=["GET"])
def route_jugador_partido():
    enfrentamiento_id = request.args.get('enfrentamiento_id', type=int)
    jugador_id = request.args.get('jugador_id', type=int)
    temporada_id = request.args.get('temporada_id', type=int)
    order_by = request.args.get('order_by')
    order_dir = request.args.get('order_dir', "desc")

    if enfrentamiento_id or jugador_id or temporada_id or order_by:
        respuesta, status = filtrar_jugador_partido_logica(
            enfrentamiento_id=enfrentamiento_id,
            jugador_id=jugador_id,
            temporada_id=temporada_id,
            order_by=order_by,
            order_dir=order_dir
        )
    else:
        respuesta, status = listar_jugador_partido()

    return jsonify(respuesta), status

# GET : Obtener Estadísticas de Jugador en Partidos por ID de Jugador
@jugador_partido_bp.route("/jugador/<int:jugador_id>", methods=["GET"])
def obtener_jugador_partido_por_jugador_id(jugador_id):
    respuesta, status = get_jugador_partido_por_jugador_id(jugador_id)
    return jsonify(respuesta), status

# GET : Obtener Estadísticas de Jugador en Partidos por ID de Enfrentamiento
@jugador_partido_bp.route("/enfrentamiento/<int:enfrentamiento_id>", methods=["GET"])
def obtener_jugador_partido_por_enfrentamiento_id(enfrentamiento_id):
    respuesta, status = get_jugador_partido_por_enfrentamiento_id(enfrentamiento_id)
    return jsonify(respuesta), status