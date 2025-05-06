from flask import Blueprint, request, jsonify
from app.estadisticas_avanzadas_jugador.crud import (
    listar_estadisticas_avanzadas,
    estadisticas_avanzadas_jugador_existente
)

estadisticas_bp = Blueprint('estadisticas_bp', __name__, url_prefix='/api/estadisticas_avanzadas')

## GET : Listar Estadisticas Avanzadas de todos los jugadores
@estadisticas_bp.route('', methods=['GET'])
def route_estadisticas_avanzadas():
    respuesta, status = listar_estadisticas_avanzadas()
    return jsonify(respuesta), status

## GET : Estadisticas Avanzadas by jugador_id y temporada_id
@estadisticas_bp.route('/<int:jugador_id>/<int:temporada_id>', methods=['GET'])
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