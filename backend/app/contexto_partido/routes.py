from flask import Blueprint, jsonify
from app.contexto_partido.crud import calcular_contexto_partido

contexto_partido_bp = Blueprint('contexto_partido_bp', __name__, url_prefix='/api/contexto_partido')

@contexto_partido_bp.route('', methods=['POST'])
def route_calcular_contexto():
    respuesta, status = calcular_contexto_partido()
    return jsonify(respuesta), status