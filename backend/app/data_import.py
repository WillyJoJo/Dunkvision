from app import db
from app.models import Equipo, Enfrentamiento, Estadisticas_Avanzadas_Jugador, Historial_Enfrentamientos, Contexto_Partido, Jugador, Jugador_Partido, Lesiones_Jugador
from sqlalchemy.sql import func, case
import statistics

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


def obtener_posibles_lesiones():
    """
    Identifica posibles lesiones en jugadores basándose en la convocatoria y el rendimiento reciente.
    
    Ajustes:
      - Si un jugador tiene menos de 10 partidos jugados en la temporada, se omite la evaluación,
        a menos que su promedio de minutos sea mayor de 15.
      - Para jugadores con menos de 10 partidos (y promedio >15):
            Se marca como posible lesión únicamente si NO han sido convocados en ninguno de los 4 últimos enfrentamientos.
      - Para jugadores con 10 o más partidos:
            * Si el promedio es menor a 15: se marca posible lesión si NO han sido convocados en los 4 últimos enfrentamientos.
            * Si el promedio es de 15 o más: se marca como posible lesión si NO han sido convocados en los 4 últimos partidos, 
              o, si han sido convocados, se evalúa el rendimiento en una ventana de 3 partidos y se detecta un desempeño significativamente inferior.
              
    Se evita duplicar registros en la tabla Lesiones_Jugador.
    Los registros se insertan con tipo_lesion "Por confirmar" y sin fecha de recuperación.
    """
    # Obtener estadísticas avanzadas de cada jugador
    stats = db.session.query(Estadisticas_Avanzadas_Jugador).all()

    for stat in stats:
        if stat.partidos_jugados == 0:
            continue

        # Calcular el promedio de minutos jugados en la temporada
        avg_minutos = stat.minutos_jugados / stat.partidos_jugados

        # Obtener el jugador para conocer su equipo
        jugador = db.session.query(Jugador).get(stat.jugador_id)
        if not jugador:
            continue

        equipo_id = jugador.equipo_id

        # Obtener los 4 últimos enfrentamientos del equipo (ordenados por fecha descendente)
        last_four_matches = db.session.query(Enfrentamiento).filter(
            (Enfrentamiento.equipo1_id == equipo_id) | (Enfrentamiento.equipo2_id == equipo_id)
        ).order_by(Enfrentamiento.fecha.desc()).limit(4).all()
        if not last_four_matches:
            continue

        # Verificar si el jugador fue convocado en alguno de los 4 últimos enfrentamientos
        convocado_in_last_four = any(
            db.session.query(Jugador_Partido).filter_by(
                jugador_id=stat.jugador_id,
                enfrentamiento_id=match.id_enfrentamiento
            ).first() for match in last_four_matches
        )

        # Evitar duplicar registros de lesión para el jugador
        lesion_existente = db.session.query(Lesiones_Jugador).filter_by(jugador_id=stat.jugador_id).first()
        if lesion_existente:
            continue

        lesion_detectada = False

        # Evaluación para jugadores con menos de 10 partidos jugados
        if stat.partidos_jugados < 10:
            # Solo se evalúa si el promedio de minutos es mayor a 15
            if avg_minutos > 15:
                if not convocado_in_last_four:
                    lesion_detectada = True
                else:
                    continue  # Si ha sido convocado, se asume que ya está en acción
            else:
                continue  # Se omite la evaluación para quienes tienen avg <= 15 y pocos partidos
        else:
            # Para jugadores con 10 o más partidos jugados
            if avg_minutos < 15:
                # Se marca posible lesión si NO han sido convocados en los 4 últimos enfrentamientos
                if not convocado_in_last_four:
                    lesion_detectada = True
            else:
                # Si el promedio es de 15 o más minutos:
                if not convocado_in_last_four:
                    lesion_detectada = True
                else:
                    # Si han sido convocados, evaluar el rendimiento en una ventana de 3 partidos
                    last_games = db.session.query(Jugador_Partido).filter_by(jugador_id=stat.jugador_id) \
                                    .order_by(Jugador_Partido.enfrentamiento_id.desc()).limit(3).all()
                    if last_games:
                        minutos_list = [game.minutos_jugados for game in last_games]
                        promedio_ultimos = sum(minutos_list) / len(minutos_list)
                        std_dev = statistics.stdev(minutos_list) if len(minutos_list) > 1 else 0

                        # Condición 1: Promedio de los últimos 3 partidos menor al 33% del promedio de temporada.
                        cond1 = promedio_ultimos < 0.33 * avg_minutos
                        # Condición 2: El último partido es al menos 2 desviaciones estándar inferior al promedio reciente.
                        cond2 = last_games[0].minutos_jugados < (promedio_ultimos - 2 * std_dev)
                        if cond1 or cond2:
                            lesion_detectada = True

        if lesion_detectada:
            nueva_lesion = Lesiones_Jugador(
                jugador_id=stat.jugador_id,
                fecha_recuperacion_estimada=None,
                tipo_lesion="Por confirmar"
            )
            db.session.add(nueva_lesion)

    db.session.commit()
    mensaje = "Posibles lesiones actualizadas correctamente."
    print(mensaje)
    return {"message": mensaje}, 200