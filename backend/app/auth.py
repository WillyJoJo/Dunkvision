from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import Usuario
from app import db
from flask_jwt_extended import create_access_token
import datetime
import re

# Lista de roles permitidos
ALLOWED_ROLES = ['usuario', 'admin']

def validate_password(password):
    """
    Valida que la contraseña tenga al menos 8 caracteres y contenga letras y números.
    """
    if len(password) < 8:
        return False
    if not re.search(r"[a-zA-Z]", password):
        return False
    if not re.search(r"[0-9]", password):
        return False
    return True

def validate_email(email):
    """
    Valida que el email tenga un formato básico correcto.
    """
    # Patrón básico de validación de email.
    # Puedes ajustar el regex según tus necesidades.
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))


def registrar_usuario():
    """
    Registra un nuevo usuario.
    Se espera que request.get_json() contenga 'nombre_usuario', 'email' y 'password'.
    Retorna un diccionario con mensaje de error (si lo hay) o None.
    """
    data = request.get_json()
    if not data:
        return {"msg": "No se enviaron datos en formato JSON"}
    
    nombre_usuario = data.get("nombre_usuario")
    email = data.get("email")
    password = data.get("password")
    
    # Validaciones iniciales
    if not nombre_usuario or not password or not email:
        return {"msg": "Faltan credenciales (usuario, email o contraseña)"}
    
    # Validar contraseña
    if not validate_password(password):
        return {"msg": "La contraseña debe tener al menos 8 caracteres, incluir letras y números"}

    # Validar email
    if not validate_email(email):
        return {"msg": "El email no tiene un formato válido"}

    # Comprobar si el usuario ya existe
    if Usuario.query.filter_by(nombre_usuario=nombre_usuario).first():
        return {"msg": "El nombre de usuario ya existe"}

    # Comprobar si el email ya existe (si quieres forzar que sea único)
    if Usuario.query.filter_by(email=email).first():
        return {"msg": "El email ya está registrado"}

    # Intentar crear el nuevo usuario
    try:
        password_hash = generate_password_hash(password)
        nuevo_usuario = Usuario(
            nombre_usuario=nombre_usuario,
            email=email,  # Asumiendo que tu modelo Usuario tiene un campo "email"
            password_hash=password_hash,
            rol="usuario"  # rol por defecto
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"msg": "Error al registrar el usuario", "error": str(e)}
    
    return None  # Sin errores

def autenticar_usuario():
    """
    Autentica a un usuario.
    Se espera que request.get_json() contenga 'nombre_usuario' o 'email' y 'password'.
    Devuelve una tupla: (token, usuario, error). En caso de error, token y usuario serán None.
    """
    data = request.get_json()
    if not data:
        return None, None, {"msg": "No se enviaron datos en formato JSON"}
    
    # Se obtiene el identificador, que puede ser nombre de usuario o email.
    identifier = data.get("nombre_usuario") or data.get("email")
    password = data.get("password")
    
    if not identifier or not password:
        return None, None, {"msg": "Faltan credenciales (identificador o contraseña)"}
    
    # Determinar si el identificador es un email (contiene '@') o un nombre de usuario.
    if "@" in identifier:
        usuario = Usuario.query.filter_by(email=identifier).first()
        credencial = "email"
    else:
        usuario = Usuario.query.filter_by(nombre_usuario=identifier).first()
        credencial = "nombre de usuario"
    
    if not usuario:
        return None, None, {"msg": f"El {credencial} no está registrado"}
    
    if not check_password_hash(usuario.password_hash, password):
        return None, None, {"msg": "La contraseña es incorrecta"}
    
    try:
        token = create_access_token(identity=str(usuario.id), expires_delta=datetime.timedelta(days=1))
    except Exception as e:
        return None, None, {"msg": "Error al generar token", "error": str(e)}
    
    return token, usuario, None


def cambiar_rol_usuario(user_id, nuevo_rol):
    """
    Cambia el rol de un usuario.
    Se espera que se proporcionen 'user_id' y 'nuevo_rol'.
    """
    if nuevo_rol not in ALLOWED_ROLES:
        return {"msg": f"El rol '{nuevo_rol}' no es válido. Roles permitidos: {ALLOWED_ROLES}"}
    
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return {"msg": "Usuario no encontrado"}
    
    try:
        usuario.rol = nuevo_rol
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"msg": "Error al cambiar el rol del usuario", "error": str(e)}
    
    return None
