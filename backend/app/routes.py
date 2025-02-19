from app import app
from app import db  #Importante importar la base de datos
from flask import jsonify
from app.models import Equipo
from flask import request, jsonify
from .data_import import importar_equipos_nba

# Ruta para predecir el partido
@app.route('/api/predict', methods=['POST'])
def predict():
    # Lógica para hacer la predicción
    result = {'prediction': 'Equipo 1 ganará'}
    return jsonify(result)

# Ruta por defecto que devuelve 'Hello World'
@app.route('/')
def hello_world():
    return "¡Bienvenido a DUNKVISION!"

@app.route('/api/equipos', methods=['POST'])
def add_equipo():
    data = request.get_json()
    print(data)  # Agrega esta línea para depurar
    nuevo_equipo = Equipo(nombre=data['nombre'])
    db.session.add(nuevo_equipo)
    db.session.commit()
    return jsonify({'message': 'Equipo agregado!'}), 201

@app.route('/api/importar_equipos', methods=['POST'])
def importar_equipos():
    importar_equipos_nba()
    return jsonify({'message': 'Equipos importados exitosamente!'}), 200

