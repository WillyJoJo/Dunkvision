from app.models import Jugador_Partido
from sqlalchemy import or_
from app import db

##REVISAR
## Método GET Listar todos los registros de Jugador_Partido
def listar_jugador_partido():
    registros = Jugador_Partido.query.all()
    lista = []
    for reg in registros:
        lista.append({
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
        })
    return lista, 200

## Método GET Filtrar y ordenar registros de Jugador_Partido
def filtrar_jugador_partido_logica(enfrentamiento_id=None, jugador_id=None, order_by=None, order_dir="desc"):
    """
    Filtra registros de Jugador_Partido según:
      - enfrentamiento_id
      - jugador_id
    Y permite ordenar según una estadística en orden ascendente o descendente.
    
    Parámetros:
      - order_by: Nombre de la columna a ordenar (por ejemplo, 'puntos', 'asistencias', etc.)
      - order_dir: 'asc' para ascendente o 'desc' para descendente (por defecto 'desc')
    """
    consulta = Jugador_Partido.query

    if enfrentamiento_id:
        consulta = consulta.filter(Jugador_Partido.enfrentamiento_id == enfrentamiento_id)
    if jugador_id:
        consulta = consulta.filter(Jugador_Partido.jugador_id == jugador_id)

    # Definir las columnas permitidas para el ordenamiento
    allowed_order_columns = [
        "minutos_jugados", "puntos", "asistencias", "rebotes_ofensivos", "rebotes_defensivos",
        "robos", "tapones", "perdidas_balon", "faltas_cometidas", "faltas_recibidas",
        "porcentaje_tiros_de_campo", "porcentaje_triples", "porcentaje_tiros_libres"
    ]
    
    if order_by in allowed_order_columns:
        columna = getattr(Jugador_Partido, order_by)
        if order_dir == "asc":
            consulta = consulta.order_by(columna.asc())
        else:
            consulta = consulta.order_by(columna.desc())
    
    registros = consulta.all()
    lista = []
    for reg in registros:
        lista.append({
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
        })
    return lista, 200

def get_jugador_partido_por_jugador_id(jugador_id):
    registros = Jugador_Partido.query.filter_by(jugador_id=jugador_id).all()
    lista = []
    for reg in registros:
        lista.append({
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
        })
    return lista, 200

def get_jugador_partido_por_enfrentamiento_id(enfrentamiento_id):
    registros = Jugador_Partido.query.filter_by(enfrentamiento_id=enfrentamiento_id).all()
    lista = []
    for reg in registros:
        lista.append({
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
        })
    return lista, 200