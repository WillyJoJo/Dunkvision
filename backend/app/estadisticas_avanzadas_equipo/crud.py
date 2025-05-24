from app.models import Estadisticas_Avanzadas_Equipo
from app import db
from sqlalchemy import func

def listar_estadisticas_avanzadas_equipo():
    registros = Estadisticas_Avanzadas_Equipo.query.all()
    lista = []
    for reg in registros:
        lista.append({
            "id_estadisticas": reg.id_estadisticas,
            "equipo_id": reg.equipo_id,
            "temporada_id": reg.temporada_id,
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
            "strength_of_schedule": reg.strength_of_schedule,
            "simple_rating_system": reg.simple_rating_system,
            "ritmo": reg.ritmo,
            "margen_de_victoria": reg.margen_de_victoria,
            "victorias": reg.victorias,
            "derrotas": reg.derrotas
        })
    return lista, 200

def estadisticas_avanzadas_equipo_existente(equipo_id, temporada_id):
    return Estadisticas_Avanzadas_Equipo.query.filter_by(
        equipo_id=equipo_id,
        temporada_id=temporada_id
    ).first()

def obtener_media_estadisticas_avanzadas_equipo_por_temporada(temporada_id):
    promedio = db.session.query(
        func.avg(Estadisticas_Avanzadas_Equipo.puntos).label("puntos"),
        func.avg(Estadisticas_Avanzadas_Equipo.asistencias).label("asistencias"),
        func.avg(Estadisticas_Avanzadas_Equipo.rebotes_ofensivos).label("rebotes_ofensivos"),
        func.avg(Estadisticas_Avanzadas_Equipo.rebotes_defensivos).label("rebotes_defensivos"),
        func.avg(Estadisticas_Avanzadas_Equipo.rebotes_totales).label("rebotes_totales"),
        func.avg(Estadisticas_Avanzadas_Equipo.robos).label("robos"),
        func.avg(Estadisticas_Avanzadas_Equipo.tapones).label("tapones"),
        func.avg(Estadisticas_Avanzadas_Equipo.perdidas_balon).label("perdidas_balon"),
        func.avg(Estadisticas_Avanzadas_Equipo.faltas_cometidas).label("faltas_cometidas"),
        func.avg(Estadisticas_Avanzadas_Equipo.tiros_de_campo_intentados).label("tiros_de_campo_intentados"),
        func.avg(Estadisticas_Avanzadas_Equipo.porcentaje_tiros_de_campo).label("porcentaje_tiros_de_campo"),
        func.avg(Estadisticas_Avanzadas_Equipo.triples_intentados).label("triples_intentados"),
        func.avg(Estadisticas_Avanzadas_Equipo.porcentaje_triples).label("porcentaje_triples"),
        func.avg(Estadisticas_Avanzadas_Equipo.tiros_de_dos_intentados).label("tiros_de_dos_intentados"),
        func.avg(Estadisticas_Avanzadas_Equipo.porcentaje_tiros_de_dos).label("porcentaje_tiros_de_dos"),
        func.avg(Estadisticas_Avanzadas_Equipo.porcentaje_efectivo_tiros_de_campo).label("porcentaje_efectivo_tiros_de_campo"),
        func.avg(Estadisticas_Avanzadas_Equipo.tiros_libres_intentados).label("tiros_libres_intentados"),
        func.avg(Estadisticas_Avanzadas_Equipo.porcentaje_tiros_libres).label("porcentaje_tiros_libres"),
        func.avg(Estadisticas_Avanzadas_Equipo.rating_ofensivo).label("rating_ofensivo"),
        func.avg(Estadisticas_Avanzadas_Equipo.rating_defensivo).label("rating_defensivo"),
        func.avg(Estadisticas_Avanzadas_Equipo.strength_of_schedule).label("strength_of_schedule"),
        func.avg(Estadisticas_Avanzadas_Equipo.simple_rating_system).label("simple_rating_system"),
        func.avg(Estadisticas_Avanzadas_Equipo.ritmo).label("ritmo"),
        func.avg(Estadisticas_Avanzadas_Equipo.margen_de_victoria).label("margen_de_victoria"),
        func.avg(Estadisticas_Avanzadas_Equipo.victorias).label("victorias"),
        func.avg(Estadisticas_Avanzadas_Equipo.derrotas).label("derrotas")
    ).filter(
        Estadisticas_Avanzadas_Equipo.temporada_id == temporada_id
    ).first()

    resultado = {col: getattr(promedio, col) for col in promedio._fields}

    # Forzar a 0 las estadísticas centradas en promedio 0
    resultado["strength_of_schedule"] = 0
    resultado["simple_rating_system"] = 0
    resultado["margen_de_victoria"] = 0

    return resultado, 200