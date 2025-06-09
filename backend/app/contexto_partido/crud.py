from app import db
from app.models import Enfrentamiento, Contexto_Partido
from sqlalchemy.sql import func

def obtener_racha(equipo_id, fecha_partido):
    partidos = db.session.query(
        Enfrentamiento.puntos_equipo1,
        Enfrentamiento.puntos_equipo2,
        Enfrentamiento.equipo1_id
    ).filter(
        ((Enfrentamiento.equipo1_id == equipo_id) | (Enfrentamiento.equipo2_id == equipo_id)),
        Enfrentamiento.fecha < fecha_partido
    ).order_by(Enfrentamiento.fecha.desc()).limit(6).all()

    victorias, derrotas = 0, 0
    for p1, p2, eq1 in partidos:
        if (eq1 == equipo_id and p1 > p2) or (eq1 != equipo_id and p2 > p1):
            victorias += 1
        else:
            derrotas += 1
    return f"{victorias}-{derrotas}"

def calcular_contexto_partido():
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

    for id_enf, eq1, eq2, fecha, ultima1, ultima2 in descansos:
        dias1 = (fecha - ultima1).days if ultima1 else 0
        dias2 = (fecha - ultima2).days if ultima2 else 0
        racha1 = obtener_racha(eq1, fecha)
        racha2 = obtener_racha(eq2, fecha)

        contexto = Contexto_Partido.query.filter_by(enfrentamiento_id=id_enf).first()
        if contexto:
            contexto.dias_descanso_equipo1 = dias1
            contexto.dias_descanso_equipo2 = dias2
            contexto.racha_equipo1 = racha1
            contexto.racha_equipo2 = racha2
        else:
            db.session.add(Contexto_Partido(
                enfrentamiento_id=id_enf,
                dias_descanso_equipo1=dias1,
                dias_descanso_equipo2=dias2,
                racha_equipo1=racha1,
                racha_equipo2=racha2
            ))

    db.session.commit()
    return {"mensaje": "Contexto de partidos actualizado correctamente"}, 200

def calcular_contexto_partido():
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

    for id_enf, eq1, eq2, fecha, ultima1, ultima2 in descansos:
        dias1 = (fecha - ultima1).days if ultima1 else 0
        dias2 = (fecha - ultima2).days if ultima2 else 0
        racha1 = obtener_racha(eq1, fecha)
        racha2 = obtener_racha(eq2, fecha)

        contexto = Contexto_Partido.query.filter_by(enfrentamiento_id=id_enf).first()
        if contexto:
            contexto.dias_descanso_equipo1 = dias1
            contexto.dias_descanso_equipo2 = dias2
            contexto.racha_equipo1 = racha1
            contexto.racha_equipo2 = racha2
        else:
            db.session.add(Contexto_Partido(
                enfrentamiento_id=id_enf,
                dias_descanso_equipo1=dias1,
                dias_descanso_equipo2=dias2,
                racha_equipo1=racha1,
                racha_equipo2=racha2
            ))

    db.session.commit()
    return {"mensaje": "Contexto de partidos actualizado correctamente"}, 200