from app import db
from app.models import Enfrentamiento, Historial_Enfrentamientos
from sqlalchemy.sql import func, case

def actualizar_historial():
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

    for equipo1_id, equipo2_id, victorias1, victorias2 in resultados:
        historial = Historial_Enfrentamientos.query.filter_by(
            equipo1_id=equipo1_id, equipo2_id=equipo2_id
        ).first()

        if historial:
            historial.victorias_equipo1 = victorias1
            historial.victorias_equipo2 = victorias2
        else:
            db.session.add(Historial_Enfrentamientos(
                equipo1_id=equipo1_id,
                equipo2_id=equipo2_id,
                victorias_equipo1=victorias1,
                victorias_equipo2=victorias2
            ))

    db.session.commit()
    return {"mensaje": "Historial actualizado correctamente"}, 200


def obtener_historial_formateado():
    historial = Historial_Enfrentamientos.query.all()
    resultado = [
        {
            "equipo1_id": h.equipo1_id,
            "equipo2_id": h.equipo2_id,
            "historial_equipo1_equipo2": f"{h.victorias_equipo1}-{h.victorias_equipo2}"
        }
        for h in historial
    ]
    return resultado, 200


def obtener_historial_por_equipo(equipo1_id):
    historial = Historial_Enfrentamientos.query.filter_by(equipo1_id=equipo1_id).order_by(
        Historial_Enfrentamientos.equipo2_id.asc()).all()
    resultado = [
        {
            "equipo1_id": h.equipo1_id,
            "equipo2_id": h.equipo2_id,
            "resultado": f"{h.victorias_equipo1}-{h.victorias_equipo2}"
        }
        for h in historial
    ]
    return resultado, 200