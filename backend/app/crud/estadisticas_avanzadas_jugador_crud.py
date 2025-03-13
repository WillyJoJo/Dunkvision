from app.models import Estadisticas_Avanzadas_Jugador
from app import db

## Método GET Estadísticas Avanzadas por ID
def obtener_estadisticas_avanzadas(id_estadisticas):
    registro = Estadisticas_Avanzadas_Jugador.query.get(id_estadisticas)
    if not registro:
        return {"error": "Registro no encontrado"}, 404
    return {
        "id_estadisticas": registro.id_estadisticas,
        "jugador_id": registro.jugador_id,
        "temporada_id": registro.temporada_id,
        "partidos_jugados": registro.partidos_jugados,
        "minutos_jugados": registro.minutos_jugados,
        "puntos": registro.puntos,
        "asistencias": registro.asistencias,
        "rebotes_ofensivos": registro.rebotes_ofensivos,
        "rebotes_defensivos": registro.rebotes_defensivos,
        "rebotes_totales": registro.rebotes_totales,
        "robos": registro.robos,
        "tapones": registro.tapones,
        "perdidas_balon": registro.perdidas_balon,
        "faltas_cometidas": registro.faltas_cometidas,
        "tiros_de_campo_intentados": registro.tiros_de_campo_intentados,
        "porcentaje_tiros_de_campo": registro.porcentaje_tiros_de_campo,
        "triples_intentados": registro.triples_intentados,
        "porcentaje_triples": registro.porcentaje_triples,
        "tiros_de_dos_intentados": registro.tiros_de_dos_intentados,
        "porcentaje_tiros_de_dos": registro.porcentaje_tiros_de_dos,
        "porcentaje_efectivo_tiros_de_campo": registro.porcentaje_efectivo_tiros_de_campo,
        "tiros_libres_intentados": registro.tiros_libres_intentados,
        "porcentaje_tiros_libres": registro.porcentaje_tiros_libres,
        "rating_ofensivo": registro.rating_ofensivo,
        "rating_defensivo": registro.rating_defensivo,
        "player_efficiency_rating": registro.player_efficiency_rating,
        "usage_porcentage": registro.usage_porcentage,
        "win_share_ofensivo": registro.win_share_ofensivo,
        "win_share_defensivo": registro.win_share_defensivo,
        "win_share_total": registro.win_share_total,
        "box_plus_minus": registro.box_plus_minus
    }, 200

## Método GET Listar todas las Estadísticas Avanzadas
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

## Método GET Filtrar y ordenar Estadísticas Avanzadas
def filtrar_estadisticas_avanzadas_logica(jugador_id=None, temporada_id=None, order_by=None, order_dir="desc"):
    """
    Permite filtrar por jugador_id y temporada_id y ordenar por cualquier estadística (excepto jugador_id y temporada_id).
    
    Parámetros:
      - jugador_id: Filtrar por el id del jugador (opcional)
      - temporada_id: Filtrar por el id de la temporada (opcional)
      - order_by: Nombre de la columna a ordenar (por ejemplo, 'puntos', 'asistencias', etc.)
      - order_dir: 'asc' para ascendente o 'desc' para descendente (por defecto 'desc')
    """
    consulta = Estadisticas_Avanzadas_Jugador.query

    if jugador_id:
        consulta = consulta.filter(Estadisticas_Avanzadas_Jugador.jugador_id == jugador_id)
    if temporada_id:
        consulta = consulta.filter(Estadisticas_Avanzadas_Jugador.temporada_id == temporada_id)

    # Definir las columnas permitidas para ordenar (no se ordena por jugador_id ni temporada_id)
    allowed_order_columns = [
        "partidos_jugados", "minutos_jugados", "puntos", "asistencias", 
        "rebotes_ofensivos", "rebotes_defensivos", "rebotes_totales",
        "robos", "tapones", "perdidas_balon", "faltas_cometidas",
        "tiros_de_campo_intentados", "porcentaje_tiros_de_campo",
        "triples_intentados", "porcentaje_triples", "tiros_de_dos_intentados",
        "porcentaje_tiros_de_dos", "porcentaje_efectivo_tiros_de_campo",
        "tiros_libres_intentados", "porcentaje_tiros_libres",
        "rating_ofensivo", "rating_defensivo", "player_efficiency_rating",
        "usage_porcentage", "win_share_ofensivo", "win_share_defensivo",
        "win_share_total", "box_plus_minus"
    ]

    if order_by in allowed_order_columns:
        columna = getattr(Estadisticas_Avanzadas_Jugador, order_by)
        if order_dir == "asc":
            consulta = consulta.order_by(columna.asc())
        else:
            consulta = consulta.order_by(columna.desc())
    
    registros = consulta.all()
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

## Método POST Crear Estadísticas Avanzadas
def crear_estadisticas_avanzadas(data):
    nuevo_registro = Estadisticas_Avanzadas_Jugador(
        jugador_id=data.get("jugador_id"),
        temporada_id=data.get("temporada_id"),
        partidos_jugados=data.get("partidos_jugados"),
        minutos_jugados=data.get("minutos_jugados"),
        puntos=data.get("puntos"),
        asistencias=data.get("asistencias"),
        rebotes_ofensivos=data.get("rebotes_ofensivos"),
        rebotes_defensivos=data.get("rebotes_defensivos"),
        rebotes_totales=data.get("rebotes_totales"),
        robos=data.get("robos"),
        tapones=data.get("tapones"),
        perdidas_balon=data.get("perdidas_balon"),
        faltas_cometidas=data.get("faltas_cometidas"),
        tiros_de_campo_intentados=data.get("tiros_de_campo_intentados"),
        porcentaje_tiros_de_campo=data.get("porcentaje_tiros_de_campo"),
        triples_intentados=data.get("triples_intentados"),
        porcentaje_triples=data.get("porcentaje_triples"),
        tiros_de_dos_intentados=data.get("tiros_de_dos_intentados"),
        porcentaje_tiros_de_dos=data.get("porcentaje_tiros_de_dos"),
        porcentaje_efectivo_tiros_de_campo=data.get("porcentaje_efectivo_tiros_de_campo"),
        tiros_libres_intentados=data.get("tiros_libres_intentados"),
        porcentaje_tiros_libres=data.get("porcentaje_tiros_libres"),
        rating_ofensivo=data.get("rating_ofensivo"),
        rating_defensivo=data.get("rating_defensivo"),
        player_efficiency_rating=data.get("player_efficiency_rating"),
        usage_porcentage=data.get("usage_porcentage"),
        win_share_ofensivo=data.get("win_share_ofensivo"),
        win_share_defensivo=data.get("win_share_defensivo"),
        win_share_total=data.get("win_share_total"),
        box_plus_minus=data.get("box_plus_minus")
    )
    db.session.add(nuevo_registro)
    db.session.commit()
    return obtener_estadisticas_avanzadas(nuevo_registro.id_estadisticas)

## Método PUT Actualizar Estadísticas Avanzadas
def actualizar_estadisticas_avanzadas(id_estadisticas, data):
    registro = Estadisticas_Avanzadas_Jugador.query.get(id_estadisticas)
    if not registro:
        return {"error": "Registro no encontrado"}, 404

    registro.jugador_id = data.get("jugador_id", registro.jugador_id)
    registro.temporada_id = data.get("temporada_id", registro.temporada_id)
    registro.partidos_jugados = data.get("partidos_jugados", registro.partidos_jugados)
    registro.minutos_jugados = data.get("minutos_jugados", registro.minutos_jugados)
    registro.puntos = data.get("puntos", registro.puntos)
    registro.asistencias = data.get("asistencias", registro.asistencias)
    registro.rebotes_ofensivos = data.get("rebotes_ofensivos", registro.rebotes_ofensivos)
    registro.rebotes_defensivos = data.get("rebotes_defensivos", registro.rebotes_defensivos)
    registro.rebotes_totales = data.get("rebotes_totales", registro.rebotes_totales)
    registro.robos = data.get("robos", registro.robos)
    registro.tapones = data.get("tapones", registro.tapones)
    registro.perdidas_balon = data.get("perdidas_balon", registro.perdidas_balon)
    registro.faltas_cometidas = data.get("faltas_cometidas", registro.faltas_cometidas)
    registro.tiros_de_campo_intentados = data.get("tiros_de_campo_intentados", registro.tiros_de_campo_intentados)
    registro.porcentaje_tiros_de_campo = data.get("porcentaje_tiros_de_campo", registro.porcentaje_tiros_de_campo)
    registro.triples_intentados = data.get("triples_intentados", registro.triples_intentados)
    registro.porcentaje_triples = data.get("porcentaje_triples", registro.porcentaje_triples)
    registro.tiros_de_dos_intentados = data.get("tiros_de_dos_intentados", registro.tiros_de_dos_intentados)
    registro.porcentaje_tiros_de_dos = data.get("porcentaje_tiros_de_dos", registro.porcentaje_tiros_de_dos)
    registro.porcentaje_efectivo_tiros_de_campo = data.get("porcentaje_efectivo_tiros_de_campo", registro.porcentaje_efectivo_tiros_de_campo)
    registro.tiros_libres_intentados = data.get("tiros_libres_intentados", registro.tiros_libres_intentados)
    registro.porcentaje_tiros_libres = data.get("porcentaje_tiros_libres", registro.porcentaje_tiros_libres)
    registro.rating_ofensivo = data.get("rating_ofensivo", registro.rating_ofensivo)
    registro.rating_defensivo = data.get("rating_defensivo", registro.rating_defensivo)
    registro.player_efficiency_rating = data.get("player_efficiency_rating", registro.player_efficiency_rating)
    registro.usage_porcentage = data.get("usage_porcentage", registro.usage_porcentage)
    registro.win_share_ofensivo = data.get("win_share_ofensivo", registro.win_share_ofensivo)
    registro.win_share_defensivo = data.get("win_share_defensivo", registro.win_share_defensivo)
    registro.win_share_total = data.get("win_share_total", registro.win_share_total)
    registro.box_plus_minus = data.get("box_plus_minus", registro.box_plus_minus)

    db.session.commit()
    return obtener_estadisticas_avanzadas(registro.id_estadisticas)