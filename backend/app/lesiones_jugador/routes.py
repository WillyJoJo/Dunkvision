from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.lesiones_jugador.crud import (
    listar_lesiones,
    obtener_lesion_by_ID,
    obtener_posibles_lesiones,
    limpiar_lesiones_antiguas,
    crear_lesion,
    eliminar_lesion,
    editar_lesion,
    get_lesion_activa
)
from app.models import Usuario

lesiones_bp = Blueprint("lesiones_bp", __name__, url_prefix="/api/lesiones_jugador")

# GET : Listar lesiones de todos los jugadores
@lesiones_bp.route("", methods=["GET"])
def route_listar_lesiones():
    lista, status = listar_lesiones()
    return jsonify(lista), status

# GET : Obtener lesión por ID
@lesiones_bp.route("/<int:lesion_id>", methods=["GET"])
def route_obtener_lesion(lesion_id):
    respuesta, status = obtener_lesion_by_ID(lesion_id)
    return jsonify(respuesta), status

# GET : Obtener si un jugador tiene una lesión activa
@lesiones_bp.route("/activa/<int:jugador_id>", methods=["GET"])
def route_get_lesion_activa(jugador_id):
    resultado, status = get_lesion_activa(jugador_id)
    return jsonify(resultado), status

# DELETE : Limpiar lesiones antiguas
@lesiones_bp.route("/limpiar", methods=["DELETE"])
@jwt_required()
def route_limpiar_lesiones():
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual:
        return jsonify({"msg": "No autorizado"}), 403

    respuesta, status = limpiar_lesiones_antiguas()
    return jsonify(respuesta), status

# POST : Crear nueva lesión
@lesiones_bp.route("", methods=["POST"])
@jwt_required()
def route_crear_lesion():
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para crear lesiones"}), 403

    data = request.get_json()
    respuesta, status = crear_lesion(data)
    return jsonify(respuesta), status

#DELETE : Eliminar lesión por ID
# Se requiere autenticación JWT y rol de administrador para esta operación
@lesiones_bp.route("/<int:lesion_id>", methods=["DELETE"])
@jwt_required()
def route_eliminar_lesion(lesion_id):
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para eliminar lesiones"}), 403

    respuesta, status = eliminar_lesion(lesion_id)
    return jsonify(respuesta), status

# PUT : Editar lesión por ID
# Se requiere autenticación JWT y rol de administrador para esta operación
@lesiones_bp.route("/editar/<int:lesion_id>", methods=["PUT"])
@jwt_required()
def route_editar_lesion(lesion_id):
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para editar lesiones"}), 403

    data = request.get_json()
    respuesta, status = editar_lesion(lesion_id, data)
    return jsonify(respuesta), status

# Ruta especial fuera del prefijo principal
# GET : Obtener todas las lesiones posibles
@lesiones_bp.route("/posibles_lesiones_jugador", methods=["GET"])
def route_obtener_posibles_lesiones():
    respuesta, status = obtener_posibles_lesiones()
    return jsonify(respuesta), status