from flask import Blueprint, jsonify, request
from app.enfrentamiento.crud import (
    listar_enfrentamientos,
    obtener_enfrentamiento,
    listar_enfrentamientos_equipo,
    listar_enfrentamientos_equipo_local,
    listar_enfrentamientos_equipo_visitante,
    listar_enfrentamientos_fecha
)

enfrentamientos_bp = Blueprint("enfrentamientos_bp", __name__, url_prefix="/api/enfrentamientos")

# GET : Listar todos los enfrentamientos
@enfrentamientos_bp.route("", methods=["GET"])
def route_listar_enfrentamientos():
    temporada_id = request.args.get("temporadaId", type=int)

    respuesta, status = listar_enfrentamientos(temporada_id=temporada_id)
    return jsonify(respuesta), status

# GET : Obtener enfrentamiento por ID
@enfrentamientos_bp.route("/<int:id_enfrentamiento>", methods=["GET"])
def route_obtener_enfrentamiento(id_enfrentamiento):
    respuesta, status = obtener_enfrentamiento(id_enfrentamiento)
    return jsonify(respuesta), status

# GET : Listar enfrentamientos por equipo
@enfrentamientos_bp.route("/equipo/<int:id_equipo>", methods=["GET"])
def route_listar_enfrentamientos_equipo(id_equipo):
    respuesta, status = listar_enfrentamientos_equipo(id_equipo)
    return jsonify(respuesta), status

# GET : Listar enfrentamientos por equipo local
@enfrentamientos_bp.route("/equipo/local/<int:id_equipo>", methods=["GET"])
def route_listar_enfrentamientos_equipo_local(id_equipo):
    respuesta, status = listar_enfrentamientos_equipo_local(id_equipo)
    return jsonify(respuesta), status

# GET : Listar enfrentamientos por equipo visitante
@enfrentamientos_bp.route("/equipo/visitante/<int:id_equipo>", methods=["GET"])
def route_listar_enfrentamientos_equipo_visitante(id_equipo):
    respuesta, status = listar_enfrentamientos_equipo_visitante(id_equipo)
    return jsonify(respuesta), status

# GET : Listar enfrentamientos por fecha
@enfrentamientos_bp.route("/fecha/<fecha>", methods=["GET"])
def route_listar_enfrentamientos_fecha(fecha):
    respuesta, status = listar_enfrentamientos_fecha(fecha)
    return jsonify(respuesta), status