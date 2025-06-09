from flask import Blueprint, jsonify
from app.historial_enfrentamientos.crud import (
    actualizar_historial,
    obtener_historial_formateado
)

historial_enfrentamientos_bp = Blueprint('historial_bp', __name__, url_prefix='/api/historial_enfrentamientos')

@historial_enfrentamientos_bp.route('/actualizar', methods=['POST'])
def route_actualizar_historial():
    respuesta, status = actualizar_historial()
    return jsonify(respuesta), status

@historial_enfrentamientos_bp.route('', methods=['GET'])
def route_historial():
    respuesta, status = obtener_historial_formateado()
    return jsonify(respuesta), status