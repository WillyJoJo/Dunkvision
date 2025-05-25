from app.models import Estadisticas_Avanzadas_Jugador
from app import db
from sqlalchemy import func, null

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
    
def obtener_media_estadisticas_avanzadas_jugador_por_temporada(temporada_id):
    promedio = db.session.query(
        func.avg(Estadisticas_Avanzadas_Jugador.puntos).label("puntos"),
        func.avg(Estadisticas_Avanzadas_Jugador.asistencias).label("asistencias"),
        func.avg(Estadisticas_Avanzadas_Jugador.rebotes_ofensivos).label("rebotes_ofensivos"),
        func.avg(Estadisticas_Avanzadas_Jugador.rebotes_defensivos).label("rebotes_defensivos"),
        func.avg(Estadisticas_Avanzadas_Jugador.rebotes_totales).label("rebotes_totales"),
        func.avg(Estadisticas_Avanzadas_Jugador.robos).label("robos"),
        func.avg(Estadisticas_Avanzadas_Jugador.tapones).label("tapones"),
        func.avg(Estadisticas_Avanzadas_Jugador.perdidas_balon).label("perdidas_balon"),
        func.avg(Estadisticas_Avanzadas_Jugador.faltas_cometidas).label("faltas_cometidas"),
        func.avg(Estadisticas_Avanzadas_Jugador.tiros_de_campo_intentados).label("tiros_de_campo_intentados"),
        func.avg(Estadisticas_Avanzadas_Jugador.triples_intentados).label("triples_intentados"),
        func.avg(Estadisticas_Avanzadas_Jugador.tiros_de_dos_intentados).label("tiros_de_dos_intentados"),
        func.avg(Estadisticas_Avanzadas_Jugador.tiros_libres_intentados).label("tiros_libres_intentados"),
        func.avg(Estadisticas_Avanzadas_Jugador.rating_ofensivo).label("rating_ofensivo"),
        func.avg(Estadisticas_Avanzadas_Jugador.rating_defensivo).label("rating_defensivo"),
        func.avg(Estadisticas_Avanzadas_Jugador.player_efficiency_rating).label("player_efficiency_rating"),
        func.avg(Estadisticas_Avanzadas_Jugador.usage_porcentage).label("usage_porcentage"),
        func.avg(Estadisticas_Avanzadas_Jugador.win_share_ofensivo).label("win_share_ofensivo"),
        func.avg(Estadisticas_Avanzadas_Jugador.win_share_defensivo).label("win_share_defensivo"),
        func.avg(Estadisticas_Avanzadas_Jugador.win_share_total).label("win_share_total"),
        func.avg(Estadisticas_Avanzadas_Jugador.box_plus_minus).label("box_plus_minus"),
        func.avg(Estadisticas_Avanzadas_Jugador.partidos_jugados).label("partidos_jugados"),
        func.avg(Estadisticas_Avanzadas_Jugador.minutos_jugados).label("minutos_jugados")
    ).filter(
        Estadisticas_Avanzadas_Jugador.temporada_id == temporada_id
    ).first()

    if promedio is None:
        return {}, 404

    resultado = {col: float(getattr(promedio, col)) if getattr(promedio, col) is not None else None for col in promedio._fields}

    # Sobrescribir con los valores manuales
    resultado["porcentaje_tiros_de_campo"] = 0.467
    resultado["porcentaje_triples"] = 0.360
    resultado["porcentaje_tiros_de_dos"] = 0.545
    resultado["porcentaje_efectivo_tiros_de_campo"] = 0.543
    resultado["porcentaje_tiros_libres"] = 0.780

    return resultado, 200