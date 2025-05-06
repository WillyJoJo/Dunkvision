from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import app
from app.models import Temporada
from .data_import import actualizar_historial, calcular_contexto_partido

# ------------------ Rutas para importar datos ------------------ #
# Ruta por defecto que devuelve 'Hello World'
@app.route('/')
def hello_world():
    return "¡Bienvenido a DUNKVISION!"

# Actualizar historial_enfrentamientos
@app.route('/api/nba/actualizar_historial', methods=['POST'])
##@jwt_required()
def actualizar_historial_endpoint():
    actualizar_historial()
    return jsonify({"message": "Historial actualizado correctamente"}), 200

# Calcular contexto_partido
@app.route('/api/nba/contexto_partido', methods=['POST'])
##@jwt_required()
def contexto_partido():
    calcular_contexto_partido()
    return jsonify({"message": "Historial actualizado correctamente"}), 200

##Ruta para obtener Temporadas
@app.route('/api/temporadas', methods=['GET'])
def route_obtener_temporadas():
    try:
        # Consulta todas las temporadas desde la base de datos
        temporadas = Temporada.query.all()
        # Serializa los resultados en una lista de diccionarios
        temporadas_serializadas = [{"id": t.id_temporada, "nombre": t.nombre_temporada} for t in temporadas]
        return jsonify(temporadas_serializadas), 200
    except Exception as e:
        return jsonify({"msg": "Error al obtener las temporadas", "error": str(e)}), 500
    
"""""""""
# Cargar el modelo una vez al arrancar la app
modelo_path = os.path.join(os.path.dirname(__file__), "scripts", "modelo_prediccion_partidos.pkl")
modelo = joblib.load(modelo_path)

@app.route('/api/prediccion', methods=['POST'])
def predecir_resultado_partido():
    data = request.get_json()

    # Validar que todos los campos necesarios están presentes
    campos_requeridos = [
        "dias_descanso_equipo1", "dias_descanso_equipo2",
        "racha_equipo1", "racha_equipo2",
        "lesiones_equipo1", "lesiones_equipo2",
        "victorias_equipo1_vs_equipo2", "victorias_equipo2_vs_equipo1",
        "rating_ofensivo_equipo1", "rating_defensivo_equipo1",
        "rating_ofensivo_equipo2", "rating_defensivo_equipo2",
        "win_share_total_jugadores1", "win_share_total_jugadores2"
    ]

    if not all(campo in data for campo in campos_requeridos):
        return jsonify({"msg": "Faltan campos necesarios para la predicción"}), 400

    df = pd.DataFrame([data])
    resultado = modelo.predict(df)[0]
    probas = modelo.predict_proba(df)[0]

    return jsonify({
        "equipo1_gana": bool(resultado),
        "probabilidad_equipo1": round(probas[1] * 100, 2),
        "probabilidad_equipo2": round(probas[0] * 100, 2)
    }), 200

@app.route('/api/prediccion/equipos', methods=['POST'])
def predecir_partido_por_ids():
    from app.models import (
        Equipo, Jugador, Lesiones_Jugador, Historial_Enfrentamientos,
        Estadisticas_Avanzadas_Equipo, Estadisticas_Avanzadas_Jugador
    )

    data = request.get_json()
    equipo1_id = data.get("equipo1_id")
    equipo2_id = data.get("equipo2_id")

    if not equipo1_id or not equipo2_id:
        return jsonify({"msg": "Se requieren 'equipo1_id' y 'equipo2_id'"}), 400

    try:
        # Historial
        historial = db.session.query(Historial_Enfrentamientos).filter(
            or_(
                and_(Historial_Enfrentamientos.equipo1_id == equipo1_id,
                     Historial_Enfrentamientos.equipo2_id == equipo2_id),
                and_(Historial_Enfrentamientos.equipo1_id == equipo2_id,
                     Historial_Enfrentamientos.equipo2_id == equipo1_id)
            )
        ).first()

        victorias1 = historial.victorias_equipo1 if historial and historial.equipo1_id == equipo1_id else historial.victorias_equipo2 if historial else 0
        victorias2 = historial.victorias_equipo2 if historial and historial.equipo2_id == equipo2_id else historial.victorias_equipo1 if historial else 0

        # Lesiones
        lesiones_eq1 = db.session.query(Lesiones_Jugador).join(Jugador).filter(
            Jugador.equipo_id == equipo1_id,
            Lesiones_Jugador.fecha_recuperacion_estimada >= date.today()
        ).count()

        lesiones_eq2 = db.session.query(Lesiones_Jugador).join(Jugador).filter(
            Jugador.equipo_id == equipo2_id,
            Lesiones_Jugador.fecha_recuperacion_estimada >= date.today()
        ).count()

        # Stats de equipo
        stats_eq1 = db.session.query(Estadisticas_Avanzadas_Equipo).filter_by(equipo_id=equipo1_id).first()
        stats_eq2 = db.session.query(Estadisticas_Avanzadas_Equipo).filter_by(equipo_id=equipo2_id).first()

        if not stats_eq1 or not stats_eq2:
            return jsonify({"msg": "Faltan estadísticas avanzadas para uno o ambos equipos"}), 404

        # Jugadores disponibles y WS total
        ids_lesionados = db.session.query(Lesiones_Jugador.jugador_id).filter(
            Lesiones_Jugador.fecha_recuperacion_estimada >= date.today()
        ).all()
        ids_lesionados = [id[0] for id in ids_lesionados]

        jugadores_eq1 = db.session.query(Jugador).filter_by(equipo_id=equipo1_id).all()
        jugadores_eq2 = db.session.query(Jugador).filter_by(equipo_id=equipo2_id).all()

        ws1 = sum(
            (db.session.query(Estadisticas_Avanzadas_Jugador)
             .filter_by(jugador_id=j.id_jugador).first() or Estadisticas_Avanzadas_Jugador(win_share_total=0)).win_share_total
            for j in jugadores_eq1 if j.id_jugador not in ids_lesionados
        )

        ws2 = sum(
            (db.session.query(Estadisticas_Avanzadas_Jugador)
             .filter_by(jugador_id=j.id_jugador).first() or Estadisticas_Avanzadas_Jugador(win_share_total=0)).win_share_total
            for j in jugadores_eq2 if j.id_jugador not in ids_lesionados
        )

        # Dummy valores para racha y descanso (por ahora)
        datos = pd.DataFrame([{
            "dias_descanso_equipo1": 2,
            "dias_descanso_equipo2": 2,
            "racha_equipo1": 1,
            "racha_equipo2": -1,
            "lesiones_equipo1": lesiones_eq1,
            "lesiones_equipo2": lesiones_eq2,
            "victorias_equipo1_vs_equipo2": victorias1,
            "victorias_equipo2_vs_equipo1": victorias2,
            "rating_ofensivo_equipo1": stats_eq1.rating_ofensivo,
            "rating_defensivo_equipo1": stats_eq1.rating_defensivo,
            "rating_ofensivo_equipo2": stats_eq2.rating_ofensivo,
            "rating_defensivo_equipo2": stats_eq2.rating_defensivo,
            "win_share_total_jugadores1": ws1,
            "win_share_total_jugadores2": ws2
        }])

        resultado = modelo.predict(datos)[0]
        probas = modelo.predict_proba(datos)[0]

        return jsonify({
            "equipo1_gana": bool(resultado),
            "probabilidad_equipo1": round(probas[1] * 100, 2),
            "probabilidad_equipo2": round(probas[0] * 100, 2)
        })

    except Exception as e:
        return jsonify({"msg": "Error al calcular la predicción", "error": str(e)}), 500
"""""""""