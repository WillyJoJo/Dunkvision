from flask import Blueprint, request, jsonify
from app.estadisticas_avanzadas_equipo.crud import (
    listar_estadisticas_avanzadas_equipo,
    estadisticas_avanzadas_equipo_existente
)

estadisticas_equipo_bp = Blueprint('estadisticas_equipo_bp', __name__, url_prefix='/api/estadisticas_avanzadas_equipo')

## GET: Listar estadísticas avanzadas de todos los equipos
@estadisticas_equipo_bp.route('', methods=['GET'])
def route_estadisticas_avanzadas_equipo():
    respuesta, status = listar_estadisticas_avanzadas_equipo()
    return jsonify(respuesta), status

## GET: Estadísticas avanzadas por equipo_id y temporada_id
@estadisticas_equipo_bp.route('/<int:equipo_id>/<int:temporada_id>', methods=['GET'])
def route_estadisticas_equipoId(equipo_id, temporada_id):
    estadisticas = estadisticas_avanzadas_equipo_existente(equipo_id, temporada_id)
    if estadisticas:
        return jsonify({
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
            "strength_of_schedule": estadisticas.strength_of_schedule,
            "simple_rating_system": estadisticas.simple_rating_system,
            "ritmo": estadisticas.ritmo,
            "margen_de_victoria": estadisticas.margen_de_victoria,
            "victorias": estadisticas.victorias,
            "derrotas": estadisticas.derrotas
        }), 200
    else:
        return jsonify({"msg": "No se encontraron estadísticas avanzadas para el equipo y temporada especificados"}), 404