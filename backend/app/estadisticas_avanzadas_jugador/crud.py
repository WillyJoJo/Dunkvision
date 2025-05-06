from app.models import Estadisticas_Avanzadas_Jugador
from app import db

def listar_estadisticas_avanzadas():
    registros = Estadisticas_Avanzadas_Jugador.query.all()
    lista = []
    for reg in registros:
        lista.append({
            "id_estadisticas": reg.id_estadisticas,
            "jugador_id": reg.jugador_id,
            "temporada_id": reg.temporada_id,
            "partidos_jugados": reg.partidos_jugados,
            "minutos_jugados": reg.minutos_jugados,
            "puntos": reg.puntos,
            "asistencias": reg.asistencias,
            "rebotes_ofensivos": reg.rebotes_ofensivos,
            "rebotes_defensivos": reg.rebotes_defensivos,
            "rebotes_totales": reg.rebotes_totales,
            "robos": reg.robos,
            "tapones": reg.tapones,
            "perdidas_balon": reg.perdidas_balon,
            "faltas_cometidas": reg.faltas_cometidas,
            "tiros_de_campo_intentados": reg.tiros_de_campo_intentados,
            "porcentaje_tiros_de_campo": reg.porcentaje_tiros_de_campo,
            "triples_intentados": reg.triples_intentados,
            "porcentaje_triples": reg.porcentaje_triples,
            "tiros_de_dos_intentados": reg.tiros_de_dos_intentados,
            "porcentaje_tiros_de_dos": reg.porcentaje_tiros_de_dos,
            "porcentaje_efectivo_tiros_de_campo": reg.porcentaje_efectivo_tiros_de_campo,
            "tiros_libres_intentados": reg.tiros_libres_intentados,
            "porcentaje_tiros_libres": reg.porcentaje_tiros_libres,
            "rating_ofensivo": reg.rating_ofensivo,
            "rating_defensivo": reg.rating_defensivo,
            "player_efficiency_rating": reg.player_efficiency_rating,
            "usage_porcentage": reg.usage_porcentage,
            "win_share_ofensivo": reg.win_share_ofensivo,
            "win_share_defensivo": reg.win_share_defensivo,
            "win_share_total": reg.win_share_total,
            "box_plus_minus": reg.box_plus_minus
        })
    return lista, 200

def estadisticas_avanzadas_jugador_existente(jugador_id, temporada_id):
    return Estadisticas_Avanzadas_Jugador.query.filter_by(
        jugador_id=jugador_id,
        temporada_id=temporada_id
    ).first()