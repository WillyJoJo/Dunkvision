from app import db
from app.models import Enfrentamiento, Estadisticas_Avanzadas_Jugador, Jugador, Jugador_Partido, Lesiones_Jugador
import statistics
from datetime import date, datetime

def listar_lesiones():
    """
    Consulta todas las lesiones registradas en la tabla Lesiones_Jugador y las devuelve
    como una lista de diccionarios para facilitar su serialización.
    """
    lesiones = db.session.query(Lesiones_Jugador).all()
    lista_lesiones = []
    for lesion in lesiones:
        lesion_data = {
            "id": lesion.id_lesion,
            "jugador_id": lesion.jugador_id,
            "tipo_lesion": lesion.tipo_lesion,
            "fecha_recuperacion_estimada": lesion.fecha_recuperacion_estimada.isoformat() if lesion.fecha_recuperacion_estimada else None
        }
        lista_lesiones.append(lesion_data)
    return lista_lesiones, 200

def obtener_lesion_by_ID(lesion_id):
    """
    Obtiene los detalles de una lesión específica a partir de su ID.
    """
    # Buscar la lesión por ID
    lesion = db.session.query(Lesiones_Jugador).get(lesion_id)
    if not lesion:
        return {"error": "Lesión no encontrada."}, 404

    # Crear un diccionario con los detalles de la lesión
    lesion_data = {
        "id": lesion.id_lesion,
        "jugador_id": lesion.jugador_id,
        "tipo_lesion": lesion.tipo_lesion,
        "fecha_recuperacion_estimada": lesion.fecha_recuperacion_estimada.isoformat() if lesion.fecha_recuperacion_estimada else None
    }

    return {"lesion": lesion_data}, 200

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
    lesiones_agregadas = 0

    stats = db.session.query(Estadisticas_Avanzadas_Jugador).all()

    for stat in stats:
        if stat.partidos_jugados == 0:
            continue

        avg_minutos = stat.minutos_jugados / stat.partidos_jugados

        jugador = db.session.query(Jugador).get(stat.jugador_id)
        if not jugador:
            continue

        equipo_id = jugador.equipo_id

        last_four_matches = db.session.query(Enfrentamiento).filter(
            (Enfrentamiento.equipo1_id == equipo_id) | (Enfrentamiento.equipo2_id == equipo_id)
        ).order_by(Enfrentamiento.fecha.desc()).limit(4).all()
        if not last_four_matches:
            continue

        convocado_in_last_four = any(
            db.session.query(Jugador_Partido).filter_by(
                jugador_id=stat.jugador_id,
                enfrentamiento_id=match.id_enfrentamiento
            ).first() for match in last_four_matches
        )

        lesion_existente = db.session.query(Lesiones_Jugador).filter_by(jugador_id=stat.jugador_id).first()
        if lesion_existente:
            continue

        lesion_detectada = False

        if stat.partidos_jugados < 10:
            if avg_minutos > 15:
                if not convocado_in_last_four:
                    lesion_detectada = True
                else:
                    continue
            else:
                continue
        else:
            if avg_minutos < 15:
                if not convocado_in_last_four:
                    lesion_detectada = True
            else:
                if not convocado_in_last_four:
                    lesion_detectada = True
                else:
                    last_games = db.session.query(Jugador_Partido).filter_by(jugador_id=stat.jugador_id) \
                                    .order_by(Jugador_Partido.enfrentamiento_id.desc()).limit(3).all()
                    if last_games:
                        minutos_list = [game.minutos_jugados for game in last_games]
                        promedio_ultimos = sum(minutos_list) / len(minutos_list)
                        std_dev = statistics.stdev(minutos_list) if len(minutos_list) > 1 else 0

                        cond1 = promedio_ultimos < 0.33 * avg_minutos
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
            lesiones_agregadas += 1

    db.session.commit()
    mensaje = f"Posibles lesiones actualizadas correctamente. Se han agregado {lesiones_agregadas} lesiones."
    print(mensaje)
    return {"message": mensaje}, 200

def limpiar_lesiones_antiguas():
    """
    Elimina de la tabla Lesiones_Jugador aquellas lesiones que tengan
    una fecha_recuperacion_estimada definida (no nula) y que sea anterior a la fecha de hoy.
    """
    hoy = date.today()
    lesiones_a_eliminar = db.session.query(Lesiones_Jugador).filter(
        Lesiones_Jugador.fecha_recuperacion_estimada.isnot(None),
        Lesiones_Jugador.fecha_recuperacion_estimada < hoy
    ).all()

    for lesion in lesiones_a_eliminar:
        db.session.delete(lesion)
    
    db.session.commit()
    
    mensaje = f"Se han eliminado {len(lesiones_a_eliminar)} lesiones con fecha de recuperación anterior a hoy."
    print(mensaje)
    return {"message": mensaje}, 200

def crear_lesion(data):
    """
    Crea una nueva lesión en la tabla Lesiones_Jugador.
    Se espera un diccionario con:
      - "jugador_id": (int) ID del jugador
      - "fecha_recuperacion_estimada": (str, opcional) Fecha en formato "YYYY-MM-DD"
      - "tipo_lesion": (str, opcional) Tipo de lesión (por defecto "Por confirmar")
    """
    if "jugador_id" not in data:
        return {"error": "Falta el campo 'jugador_id'."}, 400

    try:
        jugador_id = int(data["jugador_id"])
    except ValueError:
        return {"error": "'jugador_id' debe ser un entero."}, 400

    fecha_str = data.get("fecha_recuperacion_estimada")
    fecha_recuperacion = None
    if fecha_str:
        try:
            fecha_recuperacion = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Formato de fecha incorrecto, se espera YYYY-MM-DD."}, 400

    tipo_lesion = data.get("tipo_lesion", "Por confirmar")

    nueva_lesion = Lesiones_Jugador(
        jugador_id=jugador_id,
        fecha_recuperacion_estimada=fecha_recuperacion,
        tipo_lesion=tipo_lesion
    )
    db.session.add(nueva_lesion)
    db.session.commit()

    mensaje = f"Lesión agregada exitosamente con id {nueva_lesion.id_lesion}."
    print(mensaje)
    return {"message": mensaje, "id_lesion": nueva_lesion.id_lesion}, 201

def eliminar_lesion(lesion_id):
    """
    Elimina una lesión de la tabla Lesiones_Jugador a partir de su id.
    """
    lesion = db.session.query(Lesiones_Jugador).get(lesion_id)
    if not lesion:
        return {"error": "Lesión no encontrada."}, 404

    db.session.delete(lesion)
    db.session.commit()

    mensaje = f"Lesión con id {lesion_id} eliminada correctamente."
    print(mensaje)
    return {"message": mensaje}, 200

def editar_lesion(lesion_id, data):
    """
    Edita una lesión existente en la tabla Lesiones_Jugador.
    Se espera un diccionario con los campos a actualizar:
      - "fecha_recuperacion_estimada": (str, opcional) Fecha en formato "YYYY-MM-DD"
      - "tipo_lesion": (str, opcional) Tipo de lesión
    """
    # Buscar la lesión por ID
    lesion = db.session.query(Lesiones_Jugador).get(lesion_id)
    if not lesion:
        return {"error": "Lesión no encontrada."}, 404

    # Actualizar los campos proporcionados en el diccionario `data`
    fecha_str = data.get("fecha_recuperacion_estimada")
    if fecha_str:
        try:
            lesion.fecha_recuperacion_estimada = datetime.strptime(fecha_str, "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Formato de fecha incorrecto, se espera YYYY-MM-DD."}, 400

    tipo_lesion = data.get("tipo_lesion")
    if tipo_lesion:
        lesion.tipo_lesion = tipo_lesion

    # Guardar los cambios en la base de datos
    db.session.commit()

    mensaje = f"Lesión con id {lesion_id} actualizada correctamente."
    print(mensaje)
    return {"message": mensaje}, 200
