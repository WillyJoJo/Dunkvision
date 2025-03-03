from app import app
from flask import request, jsonify
from .data_import import importar_equipos_nba, actualizar_historial, calcular_contexto_partido
from app.auth import registrar_usuario, autenticar_usuario, cambiar_rol_usuario
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario

# ------------------ Rutas para importar datos ------------------ #
# Ruta por defecto que devuelve 'Hello World'
@app.route('/')
def hello_world():
    return "¡Bienvenido a DUNKVISION!"

# Importar equipos
@app.route('/api/importar_equipos', methods=['POST'])
##@jwt_required()
def importar_equipos():
    importar_equipos_nba()
    return jsonify({'message': 'Equipos importados exitosamente!'}), 200

# Actualizar historial_enfrentamientos
@app.route('/api/nba/actualizar_historial', methods=['POST'])
##@jwt_required()
def actualizar_historial_endpoint():
    actualizar_historial()
    return jsonify({"message": "Historial actualizado correctamente"}), 200

# Calcular contexto_partido
@app.route('/api/nba/contexto_partido', methods=['POST'])
##@jwt_required()
def contexto_partido():
    calcular_contexto_partido()
    return jsonify({"message": "Historial actualizado correctamente"}), 200

# ------------------ Rutas para Usuarios ------------------ #
@app.route('/api/register', methods=['POST'])
def register():
    error = registrar_usuario()
    if error:
        return jsonify(error), 400
    return jsonify({"msg": "Usuario creado correctamente"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    token, error = autenticar_usuario()
    if error:
        return jsonify(error), 401
    return jsonify({"access_token": token}), 200

@app.route('/api/cambiar_rol', methods=['POST'])
@jwt_required()
def cambiar_rol():
    # Se espera que el JSON tenga 'user_id' y 'nuevo_rol'
    data = request.get_json()
    user_id = data.get("user_id")
    nuevo_rol = data.get("nuevo_rol")
    
    # Verificar que el usuario autenticado es admin
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para cambiar roles"}), 403

    error = cambiar_rol_usuario(user_id, nuevo_rol)
    if error:
        return jsonify(error), 400
    return jsonify({"msg": f"Rol de usuario {user_id} actualizado a {nuevo_rol}"}), 200