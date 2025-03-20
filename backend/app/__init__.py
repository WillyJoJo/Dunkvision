# __init__.py
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import Config  # Importa la configuración desde config.py

app = Flask(__name__)
app.config.from_object(Config)  # Carga la configuración

# Habilitar CORS en todas las rutas de la aplicación
CORS(app)

jwt = JWTManager(app)
db = SQLAlchemy(app)

from app import routes  # NO TOCAR, MUY IMPORTANTE
