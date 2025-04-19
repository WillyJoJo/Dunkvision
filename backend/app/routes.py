from app import app
from flask import request, jsonify
from app.crud.lesiones_jugador_crud import crear_lesion, editar_lesion, eliminar_lesion, get_lesion_activa, limpiar_lesiones_antiguas, listar_lesiones, obtener_lesion_by_ID, obtener_posibles_lesiones
from .data_import import actualizar_historial, calcular_contexto_partido
from app.auth import registrar_usuario, autenticar_usuario, cambiar_rol_usuario
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario
from app.crud.equipo_crud import obtener_equipo, listar_equipos, filtrar_equipos_logica
from app.crud.jugador_crud import listar_jugadores, obtener_jugador, filtrar_jugadores_logica
from app.crud.enfrentamiento_crud import (obtener_enfrentamiento, listar_enfrentamientos, 
listar_enfrentamientos_equipo, listar_enfrentamientos_equipo_local, listar_enfrentamientos_equipo_visitante, listar_enfrentamientos_fecha)
from app.crud.jugador_partido_crud import get_jugador_partido_por_enfrentamiento_id, get_jugador_partido_por_jugador_id, listar_jugador_partido,filtrar_jugador_partido_logica
from app.crud.estadisticas_avanzadas_jugador_crud import (estadisticas_avanzadas_jugador_existente, obtener_estadisticas_avanzadas,listar_estadisticas_avanzadas,
filtrar_estadisticas_avanzadas_logica, crear_estadisticas_avanzadas, actualizar_estadisticas_avanzadas)
from app.models import Temporada  # Asegúrate de importar el modelo Temporada
import joblib
import pandas as pd
import os
from app import db
from sqlalchemy import or_, and_
from datetime import date

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

# ------------------ Rutas para Usuarios ------------------ #
@app.route('/api/register', methods=['POST'])
def register():
    error = registrar_usuario()
    if error:
        return jsonify(error), 400
    return jsonify({"msg": "Usuario creado correctamente"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    token, usuario, error = autenticar_usuario()
    if error:
        return jsonify(error), 401
    # Se devuelve también el rol del usuario
    return jsonify({
        "access_token": token,
        "email": usuario.email,
        "rol": usuario.rol
    }), 200


@app.route('/api/cambiar_rol', methods=['POST'])
@jwt_required()
def cambiar_rol():
    # Se espera que el JSON tenga 'user_id' y 'nuevo_rol'
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No se enviaron datos en formato JSON"}), 400

    user_id = data.get("user_id")
    nuevo_rol = data.get("nuevo_rol")
    
    if not user_id or not nuevo_rol:
        return jsonify({"msg": "Faltan parámetros 'user_id' o 'nuevo_rol'"}), 400

    # Verificar que el usuario autenticado es admin
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para cambiar roles"}), 403

    error = cambiar_rol_usuario(user_id, nuevo_rol)
    if error:
        return jsonify(error), 400
    return jsonify({"msg": f"Rol de usuario {user_id} actualizado a {nuevo_rol}"}), 200


# ------------------ Rutas para Equipos ------------------ #
## Rutas para obtener y listar equipos
@app.route('/api/equipos', methods=['GET'])
def route_equipos():
    # Recuperar parámetros de la query string
    conferencia = request.args.get('conferencia')
    division = request.args.get('division')
    orden = request.args.get('orden')
    
    # Si se pasa al menos un filtro, usamos la función de filtrado; de lo contrario, listamos todos.
    if conferencia or division or orden:
        print(f"Filtrando: Conferencia: {conferencia}, División: {division}, Orden: {orden}")
        respuesta, status = filtrar_equipos_logica(conferencia, division, orden)
    else:
        respuesta, status = listar_equipos()
    
    return jsonify(respuesta), status

## Rutas para obtener un equipo por ID
@app.route('/api/equipos/<int:id_equipo>', methods=['GET'])
def route_obtener_equipo(id_equipo):
    respuesta, status = obtener_equipo(id_equipo)
    return jsonify(respuesta), status


# ------------------ Rutas para Jugadores ------------------ #
## Ruta para obtener o filtrar jugadores
@app.route('/api/jugadores', methods=['GET'])
def route_jugadores():
    # Recupera parámetros de la query string
    letra_apellido = request.args.get('letra_apellido')
    equipo = request.args.get('equipo', type=int)
    posicion = request.args.get('posicion')
    
    # Si se pasa al menos un filtro, usa la función de filtrado; de lo contrario, lista todos.
    if letra_apellido or equipo or posicion:
        respuesta, status = filtrar_jugadores_logica(letra_apellido, equipo, posicion)
    else:
        respuesta, status = listar_jugadores()
    
    return jsonify(respuesta), status

## Rutas para obtener un jugador por ID
@app.route('/api/jugadores/<int:id_jugador>', methods=['GET'])
def route_obtener_jugador(id_jugador):
    respuesta, status = obtener_jugador(id_jugador)
    return jsonify(respuesta), status


# ------------------ Rutas para Lesiones_Jugador ------------------ #
# GET: Listar todas las lesiones de jugadores
@app.route('/api/lesiones_jugador', methods=['GET'])
def route_listar_lesiones():
    lista = listar_lesiones()
    return jsonify(lista), 200

# GET: Obtener lesión por ID
@app.route('/api/lesiones_jugador/<int:lesion_id>', methods=['GET'])
def route_obtener_lesion(lesion_id):
    respuesta, status = obtener_lesion_by_ID(lesion_id)
    return jsonify(respuesta), status

# GET: Obtener posibles lesiones de jugadores
@app.route('/api/posibles_lesiones_jugador', methods=['GET'])
def route_obtener_posibles_lesiones():
    respuesta, status = obtener_posibles_lesiones()
    return jsonify(respuesta), status

# DELETE: Eliminar lesiones antiguas automáticamente
@app.route('/api/lesiones_jugador/limpiar', methods=['DELETE'])
@jwt_required()
def route_limpiar_lesiones():
    # Solo verificar que el usuario está autenticado
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual:
        return jsonify({"msg": "No autorizado"}), 403

    respuesta, status = limpiar_lesiones_antiguas()
    return jsonify(respuesta), status

# POST: Crear una nueva lesión (por ejemplo, para agregar de primeras una lesión)
@app.route('/api/lesiones_jugador', methods=['POST'])
@jwt_required()
def route_crear_lesion():
    # Verificar que el usuario autenticado es admin
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para crear lesiones"}), 403

    data = request.get_json()
    respuesta, status = crear_lesion(data)
    return jsonify(respuesta), status

# DELETE: Eliminar una lesión específica, pasando el id de la lesión en la URL
@app.route('/api/lesiones_jugador/<int:lesion_id>', methods=['DELETE'])
@jwt_required()
def route_eliminar_lesion(lesion_id):
    # Verificar que el usuario autenticado es admin
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para eliminar lesiones"}), 403

    respuesta, status = eliminar_lesion(lesion_id)
    return jsonify(respuesta), status

# PUT: Editar lesión by ID (admin)
@app.route('/api/lesiones_jugador/editar/<int:lesion_id>', methods=['PUT'])
@jwt_required()
def route_editar_lesion(lesion_id):
    # Verificar que el usuario autenticado es admin
    usuario_actual = Usuario.query.get(get_jwt_identity())
    if not usuario_actual or usuario_actual.rol != "admin":
        return jsonify({"msg": "No tienes permisos para editar lesiones"}), 403

    data = request.get_json()
    respuesta, status = editar_lesion(lesion_id, data)
    return jsonify(respuesta), status

# GET: Obtener lesión activa de un jugador por ID
@app.route('/api/lesiones_jugador/activa/<int:jugador_id>', methods=['GET'])
def api_get_lesion_activa(jugador_id):
    resultado, status = get_lesion_activa(jugador_id)
    return jsonify(resultado), status

# ------------------ Rutas para Enfrentamientos ------------------ #
# Listar todos los enfrentamientos
@app.route('/api/enfrentamientos', methods=['GET'])
def route_listar_enfrentamientos():
    respuesta, status = listar_enfrentamientos()
    return jsonify(respuesta), status

# Obtener un enfrentamiento por su ID
@app.route('/api/enfrentamientos/<int:id_enfrentamiento>', methods=['GET'])
def route_obtener_enfrentamiento(id_enfrentamiento):
    respuesta, status = obtener_enfrentamiento(id_enfrentamiento)
    return jsonify(respuesta), status

# Listar enfrentamientos de un equipo (local o visitante)
@app.route('/api/enfrentamientos/equipo/<int:id_equipo>', methods=['GET'])
def route_listar_enfrentamientos_equipo(id_equipo):
    respuesta, status = listar_enfrentamientos_equipo(id_equipo)
    return jsonify(respuesta), status

# Listar enfrentamientos en los que el equipo fue local
@app.route('/api/enfrentamientos/equipo/local/<int:id_equipo>', methods=['GET'])
def route_listar_enfrentamientos_equipo_local(id_equipo):
    respuesta, status = listar_enfrentamientos_equipo_local(id_equipo)
    return jsonify(respuesta), status

# Listar enfrentamientos en los que el equipo fue visitante
@app.route('/api/enfrentamientos/equipo/visitante/<int:id_equipo>', methods=['GET'])
def route_listar_enfrentamientos_equipo_visitante(id_equipo):
    respuesta, status = listar_enfrentamientos_equipo_visitante(id_equipo)
    return jsonify(respuesta), status

# Listar enfrentamientos por fecha (la fecha se pasa como cadena, por ejemplo "2025-03-01")
@app.route('/api/enfrentamientos/fecha/<fecha>', methods=['GET'])
def route_listar_enfrentamientos_fecha(fecha):
    respuesta, status = listar_enfrentamientos_fecha(fecha)
    return jsonify(respuesta), status

# ------------------ Rutas para Jugador_Partido ------------------ #
## Ruta para obtener o filtrar registros de Jugador_Partido
@app.route('/api/jugador_partido', methods=['GET'])
def route_jugador_partido():
    # Recuperar parámetros de la query string
    enfrentamiento_id = request.args.get('enfrentamiento_id', type=int)
    jugador_id = request.args.get('jugador_id', type=int)
    order_by = request.args.get('order_by')
    order_dir = request.args.get('order_dir', "desc")   ## Por defecto, orden descendente

    # Si se pasa algún filtro o parámetro de orden, se usa el método de filtrado; de lo contrario, se listan todos.
    if enfrentamiento_id or jugador_id or order_by:
        respuesta, status = filtrar_jugador_partido_logica(enfrentamiento_id, jugador_id, order_by, order_dir)
    else:
        respuesta, status = listar_jugador_partido()
    
    return jsonify(respuesta), status

@app.route('/api/jugador_partido/jugador/<int:jugador_id>', methods=['GET'])
def obtener_jugador_partido_por_jugador_id(jugador_id):
    respuesta, status = get_jugador_partido_por_jugador_id(jugador_id)
    return jsonify(respuesta), status

@app.route('/api/jugador_partido/enfrentamiento/<int:enfrentamiento_id>', methods=['GET'])
def obtener_jugador_partido_por_enfrentamiento_id(enfrentamiento_id):
    respuesta, status = get_jugador_partido_por_enfrentamiento_id(enfrentamiento_id)
    return jsonify(respuesta), status

# ------------------ Rutas para Estadisticas_Avanzadas_Jugador ------------------ #
## Ruta para obtener o filtrar estadísticas avanzadas
@app.route('/api/estadisticas_avanzadas', methods=['GET'])
def route_estadisticas_avanzadas():
    jugador_id = request.args.get('jugador_id', type=int)
    temporada_id = request.args.get('temporada_id', type=int)
    order_by = request.args.get('order_by')
    order_dir = request.args.get('order_dir', "desc")
    
    # Si se pasa algún filtro u ordenamiento, se utiliza el método de filtrado; de lo contrario, se listan todos.
    if jugador_id or temporada_id or order_by:
        respuesta, status = filtrar_estadisticas_avanzadas_logica(jugador_id, temporada_id, order_by, order_dir)
    else:
        respuesta, status = listar_estadisticas_avanzadas()
    
    return jsonify(respuesta), status

## Ruta para obtener un registro por ID
@app.route('/api/estadisticas_avanzadas/<int:id_estadisticas>', methods=['GET'])
def route_obtener_estadisticas(id_estadisticas):
    respuesta, status = obtener_estadisticas_avanzadas(id_estadisticas)
    return jsonify(respuesta), status

## Ruta para crear un nuevo registro
@app.route('/api/estadisticas_avanzadas', methods=['POST'])
def route_crear_estadisticas():
    data = request.get_json()
    respuesta, status = crear_estadisticas_avanzadas(data)
    return jsonify(respuesta), status

## Ruta para actualizar un registro existente
@app.route('/api/estadisticas_avanzadas/<int:id_estadisticas>', methods=['PUT'])
def route_actualizar_estadisticas(id_estadisticas):
    data = request.get_json()
    respuesta, status = actualizar_estadisticas_avanzadas(id_estadisticas, data)
    return jsonify(respuesta), status

@app.route('/api/estadisticas_avanzadas/<int:jugador_id>/<int:temporada_id>', methods=['GET'])
def route_estadisticas_avanzadas_jugadorId_temporadaId(jugador_id, temporada_id):
    estadisticas = estadisticas_avanzadas_jugador_existente(jugador_id, temporada_id)
    if estadisticas:
        return jsonify({
            "partidos_jugados": estadisticas.partidos_jugados,
            "minutos_jugados": estadisticas.minutos_jugados,
            "puntos": estadisticas.puntos,
            "asistencias": estadisticas.asistencias,
            "rebotes_ofensivos": estadisticas.rebotes_ofensivos,
            "rebotes_defensivos": estadisticas.rebotes_defensivos,
            "rebotes_totales": estadisticas.rebotes_totales,
            "robos": estadisticas.robos,
            "tapones": estadisticas.tapones,
            "perdidas_balon": estadisticas.perdidas_balon,
            "faltas_cometidas": estadisticas.faltas_cometidas,
            "tiros_de_campo_intentados": estadisticas.tiros_de_campo_intentados,
            "porcentaje_tiros_de_campo": estadisticas.porcentaje_tiros_de_campo,
            "triples_intentados": estadisticas.triples_intentados,
            "porcentaje_triples": estadisticas.porcentaje_triples,
            "tiros_de_dos_intentados": estadisticas.tiros_de_dos_intentados,
            "porcentaje_tiros_de_dos": estadisticas.porcentaje_tiros_de_dos,
            "porcentaje_efectivo_tiros_de_campo": estadisticas.porcentaje_efectivo_tiros_de_campo,
            "tiros_libres_intentados": estadisticas.tiros_libres_intentados,
            "porcentaje_tiros_libres": estadisticas.porcentaje_tiros_libres,
            "rating_ofensivo": estadisticas.rating_ofensivo,
            "rating_defensivo": estadisticas.rating_defensivo,
            "player_efficiency_rating": estadisticas.player_efficiency_rating,
            "usage_porcentage": estadisticas.usage_porcentage,
            "win_share_ofensivo": estadisticas.win_share_ofensivo,
            "win_share_defensivo": estadisticas.win_share_defensivo,
            "win_share_total": estadisticas.win_share_total,
            "box_plus_minus": estadisticas.box_plus_minus
        }), 200
    else:
        return jsonify({"msg": "No se encontraron estadísticas avanzadas para el jugador y temporada especificados"}), 404
    

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