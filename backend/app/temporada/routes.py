from flask import Blueprint, jsonify
from app.temporada.crud import listar_temporadas, crear_temporada_si_no_existe

temporada_bp = Blueprint('temporada_bp', __name__, url_prefix='/api/temporadas')

@temporada_bp.route('', methods=['GET'])
def route_listar_temporadas():
    respuesta, status = listar_temporadas()
    return jsonify(respuesta), status

@temporada_bp.route('/crear_si_no_existe', methods=['POST'])
def route_crear_temporada_si_no_existe():
    respuesta, status = crear_temporada_si_no_existe()
    return jsonify(respuesta), status