from flask import request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity
from app.models import Usuario
from app import db, mail
from flask_mail import Message
import datetime
import re
from app.extensions import serializer
from flask import current_app as app

ALLOWED_ROLES = ['usuario', 'admin']

def validate_password(password):
    return len(password) >= 8 and re.search(r"[a-zA-Z]", password) and re.search(r"[0-9]", password)

def validate_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return bool(re.match(pattern, email))

def registrar_usuario():
    data = request.get_json()
    if not data:
        return {"message": "No se enviaron datos en formato JSON"}

    nombre_usuario = data.get("nombre_usuario")
    email = data.get("email")
    password = data.get("password")

    if not nombre_usuario or not password or not email:
        return {"message": "Faltan credenciales (usuario, email o contraseña)"}

    if not validate_password(password):
        return {"message": "La contraseña debe tener al menos 8 caracteres, incluir letras y números"}

    if not validate_email(email):
        return {"message": "El email no tiene un formato válido"}

    if Usuario.query.filter_by(nombre_usuario=nombre_usuario).first():
        return {"message": "El nombre de usuario ya existe"}

    if Usuario.query.filter_by(email=email).first():
        return {"message": "El email ya está registrado"}

    try:
        password_hash = generate_password_hash(password)
        nuevo_usuario = Usuario(
            nombre_usuario=nombre_usuario,
            email=email,
            password_hash=password_hash,
            rol="usuario"
        )
        db.session.add(nuevo_usuario)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"message": "Error al registrar el usuario", "error": str(e)}

    return None

def autenticar_usuario():
    data = request.get_json()
    if not data:
        return None, None, {"message": "No se enviaron datos en formato JSON"}

    identifier = data.get("nombre_usuario") or data.get("email")
    password = data.get("password")

    if not identifier or not password:
        return None, None, {"message": "Faltan credenciales (identificador o contraseña)"}

    if "@" in identifier:
        usuario = Usuario.query.filter_by(email=identifier).first()
        credencial = "email"
    else:
        usuario = Usuario.query.filter_by(nombre_usuario=identifier).first()
        credencial = "nombre de usuario"

    if not usuario:
        return None, None, {"message": f"El {credencial} no está registrado"}

    if not check_password_hash(usuario.password_hash, password):
        return None, None, {"message": "La contraseña es incorrecta"}

    try:
        token = create_access_token(identity=str(usuario.id), expires_delta=datetime.timedelta(days=1))
    except Exception as e:
        return None, None, {"message": "Error al generar token", "error": str(e)}

    return token, usuario, None

def cambiar_rol_usuario(user_id, nuevo_rol):
    if nuevo_rol not in ALLOWED_ROLES:
        return {"message": f"El rol '{nuevo_rol}' no es válido. Roles permitidos: {ALLOWED_ROLES}"}

    usuario = Usuario.query.get(user_id)
    if not usuario:
        return {"message": "Usuario no encontrado"}

    try:
        usuario.rol = nuevo_rol
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"message": "Error al cambiar el rol del usuario", "error": str(e)}

    return None

def recuperar_contrasena():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return {'message': 'Email requerido'}, 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return {'message': 'No existe una cuenta con ese email'}, 404

    token = serializer.dumps(email, salt='recuperar-contrasena')
    enlace = f"{app.config['FRONTEND_URL']}/restablecer-contrasena/{token}"

    msg = Message(
        subject='Recuperación de contraseña',
        sender=app.config['MAIL_USERNAME'],
        recipients=[email],
        reply_to='soporte@dunkvision.com'
    )

    msg.html = f"""
        <p>Hola <strong>{usuario.nombre_usuario}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña en <strong>DunkVision</strong>. Si fuiste tú, haz clic en el siguiente enlace:</p>
        <p><a href="{enlace}" target="_blank" style="color: #1a73e8; font-weight: bold;">¡Haz clic aquí para restablecer tu contraseña!</a></p>
        <p>Este enlace expirará en <strong>15 minutos</strong>.</p>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <p>Gracias,<br>El equipo de <strong>DunkVision</strong></p>
    """
    mail.send(msg)
    return {'message': 'Correo enviado con instrucciones'}, 200

def restablecer_contrasena(token):
    data = request.get_json()
    nueva_contrasena = data.get('password')

    if not nueva_contrasena:
        return {'message': 'Contraseña requerida'}, 400

    try:
        email = serializer.loads(token, salt='recuperar-contrasena', max_age=900)
    except:
        return {'message': 'Token inválido o caducado'}, 400

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return {'message': 'Usuario no encontrado'}, 404

    usuario.password_hash = generate_password_hash(nueva_contrasena)
    db.session.commit()

    return {'message': 'Contraseña actualizada con éxito'}, 200