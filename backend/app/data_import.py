from app import db
from app.models import Enfrentamiento, Estadisticas_Avanzadas_Jugador, Historial_Enfrentamientos, Contexto_Partido, Jugador, Jugador_Partido, Lesiones_Jugador
from sqlalchemy.sql import func, case

# ACTUALIZAR HISTORIAL ENFRENTAMIENTOS ENTRE EQUIPOS
def actualizar_historial():
    """Actualiza la tabla Historial_Enfrentamientos con el número de victorias entre equipos."""

    # Consulta para contar todas las victorias acumuladas entre cada par de equipos
    resultados = db.session.query(
        func.least(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id).label("equipo1_id"),
        func.greatest(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id).label("equipo2_id"),
        func.sum(
            case(
                (Enfrentamiento.equipo1_id < Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo1 > Enfrentamiento.puntos_equipo2),
                (Enfrentamiento.equipo1_id > Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo2 > Enfrentamiento.puntos_equipo1),
                else_=0
            )
        ).label("victorias_equipo1"),
        func.sum(
            case(
                (Enfrentamiento.equipo1_id < Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo2 > Enfrentamiento.puntos_equipo1),
                (Enfrentamiento.equipo1_id > Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo1 > Enfrentamiento.puntos_equipo2),
                else_=0
            )
        ).label("victorias_equipo2")
    ).group_by(
        func.least(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id),
        func.greatest(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id)
    ).all()

    # Insertar o actualizar en Historial_Enfrentamientos
    for equipo1_id, equipo2_id, victorias1, victorias2 in resultados:
        historial = db.session.query(Historial_Enfrentamientos).filter_by(
            equipo1_id=equipo1_id, equipo2_id=equipo2_id
        ).first()

        if historial:
            historial.victorias_equipo1 = victorias1
            historial.victorias_equipo2 = victorias2
        else:
            nuevo_historial = Historial_Enfrentamientos(
                equipo1_id=equipo1_id,
                equipo2_id=equipo2_id,
                victorias_equipo1=victorias1,
                victorias_equipo2=victorias2
            )
            db.session.add(nuevo_historial)

    # Confirmar los cambios en la base de datos
    db.session.commit()
    print("Historial de enfrentamientos actualizado correctamente.")


# CALCULAR CONTEXTO PARTIDO DE ENFRENTAMIENTOS
def calcular_contexto_partido():
    """Calcula y actualiza los días de descanso y la racha antes de cada partido."""

    # Obtener los días de descanso usando LAG() en SQL
    descansos = db.session.query(
        Enfrentamiento.id_enfrentamiento,
        Enfrentamiento.equipo1_id,
        Enfrentamiento.equipo2_id,
        Enfrentamiento.fecha,
        func.lag(Enfrentamiento.fecha).over(
            partition_by=Enfrentamiento.equipo1_id, order_by=Enfrentamiento.fecha
        ).label("ultima_fecha_equipo1"),
        func.lag(Enfrentamiento.fecha).over(
            partition_by=Enfrentamiento.equipo2_id, order_by=Enfrentamiento.fecha
        ).label("ultima_fecha_equipo2")
    ).all()

    for id_enfrentamiento, equipo1_id, equipo2_id, fecha, ultima_fecha1, ultima_fecha2 in descansos:
        # Calcular días de descanso (0 si es el primer partido del equipo en la temporada)
        dias_descanso_equipo1 = (fecha - ultima_fecha1).days if ultima_fecha1 else 0
        dias_descanso_equipo2 = (fecha - ultima_fecha2).days if ultima_fecha2 else 0

        # Obtener racha de los últimos 6 partidos en formato "X-Y"
        racha_equipo1 = obtener_racha(equipo1_id, fecha)
        racha_equipo2 = obtener_racha(equipo2_id, fecha)

        # Insertar o actualizar en la tabla Contexto_Partido
        contexto = db.session.query(Contexto_Partido).filter_by(
            enfrentamiento_id=id_enfrentamiento
        ).first()

        if contexto:
            contexto.dias_descanso_equipo1 = dias_descanso_equipo1
            contexto.dias_descanso_equipo2 = dias_descanso_equipo2
            contexto.racha_equipo1 = racha_equipo1
            contexto.racha_equipo2 = racha_equipo2
        else:
            nuevo_contexto = Contexto_Partido(
                enfrentamiento_id=id_enfrentamiento,
                dias_descanso_equipo1=dias_descanso_equipo1,
                dias_descanso_equipo2=dias_descanso_equipo2,
                racha_equipo1=racha_equipo1,
                racha_equipo2=racha_equipo2
            )
            db.session.add(nuevo_contexto)

    db.session.commit()
    print("Contexto de partidos actualizado correctamente.")

def obtener_racha(equipo_id, fecha_partido):
    """Obtiene la racha de los últimos 6 partidos antes de la fecha del partido en formato 'X-Y'."""
    ultimos_partidos = db.session.query(
        Enfrentamiento.puntos_equipo1, 
        Enfrentamiento.puntos_equipo2,
        Enfrentamiento.equipo1_id
    ).filter(
        (Enfrentamiento.equipo1_id == equipo_id) | (Enfrentamiento.equipo2_id == equipo_id),
        Enfrentamiento.fecha < fecha_partido
    ).order_by(Enfrentamiento.fecha.desc()).limit(6).all()

    victorias = 0
    derrotas = 0

    for puntos1, puntos2, equipo1 in ultimos_partidos:
        if (equipo1 == equipo_id and puntos1 > puntos2) or (equipo1 != equipo_id and puntos2 > puntos1):
            victorias += 1
        else:
            derrotas += 1

    return f"{victorias}-{derrotas}"  # Formato "X-Y"