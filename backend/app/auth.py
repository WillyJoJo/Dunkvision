from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import Usuario
from app import db
from flask_jwt_extended import create_access_token
import datetime

def registrar_usuario():
    """
    Función que registra un nuevo usuario.
    Se espera que el request.get_json() contenga 'nombre_usuario' y 'password'.
    Retorna un diccionario con mensaje de error (si lo hay) o None.
    """
    data = request.get_json()
    nombre_usuario = data.get("nombre_usuario")
    password = data.get("password")
    
    if not nombre_usuario or not password:
        return {"msg": "Faltan credenciales"}
    
    if Usuario.query.filter_by(nombre_usuario=nombre_usuario).first():
        return {"msg": "El usuario ya existe"}
    
    password_hash = generate_password_hash(password)
    nuevo_usuario = Usuario(
        nombre_usuario=nombre_usuario,
        password_hash=password_hash,
        rol="usuario"  # rol por defecto
    )
    db.session.add(nuevo_usuario)
    db.session.commit()
    
    return None  # Sin error

def autenticar_usuario():
    """
    Función que autentica a un usuario.
    Se espera que el request.get_json() contenga 'nombre_usuario' y 'password'.
    Devuelve el token JWT o un mensaje de error.
    """
    data = request.get_json()
    nombre_usuario = data.get("nombre_usuario")
    password = data.get("password")
    
    if not nombre_usuario or not password:
        return None, {"msg": "Faltan credenciales"}
    
    usuario = Usuario.query.filter_by(nombre_usuario=nombre_usuario).first()
    if not usuario or not check_password_hash(usuario.password_hash, password):
        return None, {"msg": "Credenciales inválidas"}
    
    token = create_access_token(identity=str(usuario.id), expires_delta=datetime.timedelta(days=1))
    return token, None

def cambiar_rol_usuario(user_id, nuevo_rol):
    """
    Función que cambia el rol de un usuario.
    Se espera que 'user_id' y 'nuevo_rol' sean proporcionados.
    """
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return {"msg": "Usuario no encontrado"}
    
    usuario.rol = nuevo_rol
    db.session.commit()
    return None