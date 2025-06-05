from flask import Blueprint, request, jsonify
from app.prediccion_partido.crud import predecir_partido

prediccion_bp = Blueprint("prediccion_bp", __name__, url_prefix="/api/prediccion")

@prediccion_bp.route("/equipos", methods=["POST"])
def route_predecir_partido():
    try:
        data = request.get_json()
        equipo1_id = data.get("equipo1_id")
        equipo2_id = data.get("equipo2_id")
        lesionados = data.get("jugadores_lesionados", [])
        fichajes = data.get("jugadores_fichados", [])

        if not equipo1_id or not equipo2_id:
            return jsonify({"msg": "Faltan IDs de equipos"}), 400

        resultado = predecir_partido(
            equipo1_id=equipo1_id,
            equipo2_id=equipo2_id,
            jugadores_lesionados=lesionados,
            jugadores_fichados=fichajes
        )

        return jsonify(resultado), 200

    except Exception as e:
        return jsonify({"msg": "Error en la predicción", "error": str(e)}), 500