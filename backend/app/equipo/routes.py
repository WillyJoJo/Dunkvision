from flask import Blueprint, request, jsonify
from app.equipo.crud import (
    obtener_equipo,
    listar_equipos,
    filtrar_equipos_logica
)

equipo_bp = Blueprint('equipo_bp', __name__, url_prefix='/api/equipos')

## GET : Listar Equipos
@equipo_bp.route('', methods=['GET'])
def route_equipos():
    conferencia = request.args.get('conferencia')
    division = request.args.get('division')
    orden = request.args.get('orden')
    
    if conferencia or division or orden:
        respuesta, status = filtrar_equipos_logica(conferencia, division, orden)
    else:
        respuesta, status = listar_equipos()
    
    return jsonify(respuesta), status

## GET : Equipo por ID
@equipo_bp.route('/<int:id_equipo>', methods=['GET'])
def route_obtener_equipo(id_equipo):
    respuesta, status = obtener_equipo(id_equipo)
    return jsonify(respuesta), status