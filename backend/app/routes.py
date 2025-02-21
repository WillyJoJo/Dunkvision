from app import app
from app import db  #Importante importar la base de datos
from flask import jsonify
from app.models import Equipo
from flask import request, jsonify
from .data_import import importar_equipos_nba

# Ruta por defecto que devuelve 'Hello World'
@app.route('/')
def hello_world():
    return "¡Bienvenido a DUNKVISION!"

@app.route('/api/importar_equipos', methods=['POST'])
def importar_equipos():
    importar_equipos_nba()
    return jsonify({'message': 'Equipos importados exitosamente!'}), 200