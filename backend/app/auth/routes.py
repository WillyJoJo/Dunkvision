from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.auth.controller import (
    registrar_usuario,
    autenticar_usuario,
    cambiar_rol_usuario,
    recuperar_contrasena,
    restablecer_contrasena
)
from app.models import Usuario

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api")

# POST : Registrar un nuevo usuario
@auth_bp.route('/register', methods=['POST'])
def register():
    error = registrar_usuario()
    if error:
        return jsonify(error), 400
    return jsonify({"msg": "Usuario creado correctamente"}), 201

# POST : Autenticar un usuario
@auth_bp.route('/login', methods=['POST'])
def login():
    token, usuario, error = autenticar_usuario()
    if error:
        return jsonify(error), 401
    return jsonify({
        "access_token": token,
        "email": usuario.email,
        "rol": usuario.rol
    }), 200

# POST : Cambiar rol de un usuario
@auth_bp.route('/cambiar_rol', methods=['POST'])
@jwt_required()
def cambiar_rol():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se enviaron datos en formato JSON"}), 400

    user_id = data.get("user_id")
    nuevo_rol = data.get("nuevo_rol")

    if not user_id or not nuevo_rol:
        return jsonify({"msg": "Faltan parámetros 'user_id' o 'nuevo_rol'"}), 400

    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para cambiar roles"}), 403

    error = cambiar_rol_usuario(user_id, nuevo_rol)
    if error:
        return jsonify(error), 400

    return jsonify({"msg": f"Rol de usuario {user_id} actualizado a {nuevo_rol}"}), 200

# POST : Recuperar contraseña
@auth_bp.route('/recuperar-contrasena', methods=['POST'])
def recuperar_contrasena_route():
    respuesta, status = recuperar_contrasena()
    return jsonify(respuesta), status

# POST : Restablecer contraseña
@auth_bp.route('/restablecer-contrasena/<token>', methods=['POST'])
def restablecer_contrasena_route(token):
    respuesta, status = restablecer_contrasena(token)
    return jsonify(respuesta), status
