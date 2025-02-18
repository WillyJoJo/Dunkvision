from app import app
from flask import jsonify

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
