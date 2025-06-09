from flask import Blueprint, jsonify
from app.temporada.crud import listar_temporadas

temporada_bp = Blueprint('temporada_bp', __name__, url_prefix='/api/temporadas')

@temporada_bp.route('', methods=['GET'])
def route_listar_temporadas():
    respuesta, status = listar_temporadas()
    return jsonify(respuesta), status