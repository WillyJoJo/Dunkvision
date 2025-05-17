from app.models import Jugador_Partido
from sqlalchemy import or_
from app import db
from sqlalchemy import func, cast, String

def listar_jugador_partido():
    registros = Jugador_Partido.query.all()
    return [_serializar_registro(reg) for reg in registros], 200

def filtrar_jugador_partido_logica(enfrentamiento_id=None, jugador_id=None, order_by=None, order_dir="desc"):
    consulta = Jugador_Partido.query

    if enfrentamiento_id:
        consulta = consulta.filter(Jugador_Partido.enfrentamiento_id == enfrentamiento_id)
    if jugador_id:
        consulta = consulta.filter(Jugador_Partido.jugador_id == jugador_id)

    allowed_order_columns = [
        "minutos_jugados", "puntos", "asistencias", "rebotes_ofensivos", "rebotes_defensivos",
        "robos", "tapones", "perdidas_balon", "faltas_cometidas", "faltas_recibidas",
        "porcentaje_tiros_de_campo", "porcentaje_triples", "porcentaje_tiros_libres"
    ]

    if order_by in allowed_order_columns:
        columna = getattr(Jugador_Partido, order_by)
        consulta = consulta.order_by(columna.asc() if order_dir == "asc" else columna.desc())

    registros = consulta.all()
    return [_serializar_registro(reg) for reg in registros], 200

def get_jugador_partido_por_jugador_id(jugador_id):
    registros = Jugador_Partido.query.filter_by(jugador_id=jugador_id).all()
    return [_serializar_registro(reg) for reg in registros], 200

def get_jugador_partido_por_enfrentamiento_id(enfrentamiento_id):
    registros = Jugador_Partido.query.filter_by(enfrentamiento_id=enfrentamiento_id).all()
    return [_serializar_registro(reg) for reg in registros], 200

def _serializar_registro(reg):
    return {
        "id_jugador_partido": reg.id_jugador_partido,
        "jugador_id": reg.jugador_id,
        "equipo_id": reg.equipo_id,
        "enfrentamiento_id": reg.enfrentamiento_id,
        "minutos_jugados": reg.minutos_jugados,
        "puntos": reg.puntos,
        "asistencias": reg.asistencias,
        "rebotes_ofensivos": reg.rebotes_ofensivos,
        "rebotes_defensivos": reg.rebotes_defensivos,
        "robos": reg.robos,
        "tapones": reg.tapones,
        "perdidas_balon": reg.perdidas_balon,
        "faltas_cometidas": reg.faltas_cometidas,
        "faltas_recibidas": reg.faltas_recibidas,
        "porcentaje_tiros_de_campo": reg.porcentaje_tiros_de_campo,
        "porcentaje_triples": reg.porcentaje_triples,
        "porcentaje_tiros_libres": reg.porcentaje_tiros_libres
    }

def filtrar_jugador_partido_logica(enfrentamiento_id=None, jugador_id=None, temporada_id=None, order_by=None, order_dir="desc"):
    consulta = Jugador_Partido.query

    if enfrentamiento_id:
        consulta = consulta.filter(Jugador_Partido.enfrentamiento_id == enfrentamiento_id)
    if jugador_id:
        consulta = consulta.filter(Jugador_Partido.jugador_id == jugador_id)
    if temporada_id:
        temporada_str = str(temporada_id).zfill(2)
        consulta = consulta.filter(
            func.substr(cast(Jugador_Partido.enfrentamiento_id, String), 4, 2) == temporada_str
        )

    allowed_order_columns = [
        "minutos_jugados", "puntos", "asistencias", "rebotes_ofensivos", "rebotes_defensivos",
        "robos", "tapones", "perdidas_balon", "faltas_cometidas", "faltas_recibidas",
        "porcentaje_tiros_de_campo", "porcentaje_triples", "porcentaje_tiros_libres"
    ]

    if order_by in allowed_order_columns:
        columna = getattr(Jugador_Partido, order_by)
        consulta = consulta.order_by(columna.asc() if order_dir == "asc" else columna.desc())

    registros = consulta.all()
    print("🟢 ENFRENTAMIENTOS encontrados:", [r.enfrentamiento_id for r in registros])

    return [_serializar_registro(reg) for reg in registros], 200