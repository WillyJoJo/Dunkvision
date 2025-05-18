from app.models import Estadisticas_Avanzadas_Equipo
from app import db

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

def estadisticas_avanzadas_equipo_existente(equipo_id):
    return Estadisticas_Avanzadas_Equipo.query.filter_by(equipo_id=equipo_id).first()
