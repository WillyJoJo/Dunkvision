from app import app, db
from app.models import (
    Enfrentamiento, Contexto_Partido, Historial_Enfrentamientos,
    Estadisticas_Avanzadas_Equipo, Estadisticas_Avanzadas_Jugador,
    Jugador, Equipo, Jugador_Partido
)
from sqlalchemy import or_, and_
import pandas as pd
import numpy as np


def obtener_valor_racha(racha):
    if not racha:
        return 0
    try:
        if '-' in racha:
            partes = racha.split('-')
            return int(partes[0]) - int(partes[1])
    except Exception:
        return 0


def obtener_dataset_entrenamiento():
    with app.app_context():
        enfrentamientos = (
            db.session.query(Enfrentamiento)
            .join(Contexto_Partido, Contexto_Partido.enfrentamiento_id == Enfrentamiento.id_enfrentamiento)
            .all()
        )

        jugadores_stats = {
            est.jugador_id: est
            for est in db.session.query(Estadisticas_Avanzadas_Jugador).all()
        }

        datos = []

        for enf in enfrentamientos:
            contexto = enf.contexto
            if not contexto or enf.puntos_equipo1 is None or enf.puntos_equipo2 is None:
                continue

            historial = db.session.query(Historial_Enfrentamientos).filter(
                or_(
                    and_(Historial_Enfrentamientos.equipo1_id == enf.equipo1_id,
                         Historial_Enfrentamientos.equipo2_id == enf.equipo2_id),
                    and_(Historial_Enfrentamientos.equipo1_id == enf.equipo2_id,
                         Historial_Enfrentamientos.equipo2_id == enf.equipo1_id)
                )
            ).first()

            victorias1 = historial.victorias_equipo1 if historial and historial.equipo1_id == enf.equipo1_id else historial.victorias_equipo2 if historial else 0
            victorias2 = historial.victorias_equipo2 if historial and historial.equipo2_id == enf.equipo2_id else historial.victorias_equipo1 if historial else 0

            estad_eq1 = db.session.query(Estadisticas_Avanzadas_Equipo).filter_by(equipo_id=enf.equipo1_id).first()
            estad_eq2 = db.session.query(Estadisticas_Avanzadas_Equipo).filter_by(equipo_id=enf.equipo2_id).first()
            if not estad_eq1 or not estad_eq2:
                continue

            jugadores_eq1 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo1_id).all()
            jugadores_eq2 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo2_id).all()

            jugadores_disponibles1 = [j for j in jugadores_eq1 if j.id_jugador in jugadores_stats]
            jugadores_disponibles2 = [j for j in jugadores_eq2 if j.id_jugador in jugadores_stats]

            ws_total_eq1 = sum([jugadores_stats[j.id_jugador].win_share_total or 0 for j in jugadores_disponibles1])
            ws_total_eq2 = sum([jugadores_stats[j.id_jugador].win_share_total or 0 for j in jugadores_disponibles2])

            def stats_jugador_partido(equipo_id):
                stats = db.session.query(Jugador_Partido).filter_by(
                    enfrentamiento_id=enf.id_enfrentamiento,
                    equipo_id=equipo_id
                ).all()
                if not stats:
                    return {}
                return {
                    "puntos": sum(s.puntos or 0 for s in stats),
                    "asistencias": sum(s.asistencias or 0 for s in stats),
                    "minutos": sum(s.minutos_jugados or 0 for s in stats),
                    "pct_tiros": np.mean([s.porcentaje_tiros_de_campo for s in stats if s.porcentaje_tiros_de_campo is not None]) or 0,
                    "pct_triples": np.mean([s.porcentaje_triples for s in stats if s.porcentaje_triples is not None]) or 0,
                    "pct_libres": np.mean([s.porcentaje_tiros_libres for s in stats if s.porcentaje_tiros_libres is not None]) or 0,
                }

            stats_eq1 = stats_jugador_partido(enf.equipo1_id)
            stats_eq2 = stats_jugador_partido(enf.equipo2_id)

            equipo1_gana = 1 if enf.puntos_equipo1 > enf.puntos_equipo2 else 0

            datos.append({
                "dias_descanso_eq1": contexto.dias_descanso_equipo1,
                "dias_descanso_eq2": contexto.dias_descanso_equipo2,
                "racha_eq1": obtener_valor_racha(contexto.racha_equipo1),
                "racha_eq2": obtener_valor_racha(contexto.racha_equipo2),
                "victorias_eq1_vs_eq2": victorias1,
                "victorias_eq2_vs_eq1": victorias2,
                "delta_rating_of": (estad_eq1.rating_ofensivo or 0) - (estad_eq2.rating_ofensivo or 0),
                "delta_rating_def": (estad_eq1.rating_defensivo or 0) - (estad_eq2.rating_defensivo or 0),
                "delta_margen_victoria": (estad_eq1.margen_de_victoria or 0) - (estad_eq2.margen_de_victoria or 0),
                "delta_simple_rating": (estad_eq1.simple_rating_system or 0) - (estad_eq2.simple_rating_system or 0),
                "delta_ws_total": ws_total_eq1 - ws_total_eq2,
                "delta_racha": obtener_valor_racha(contexto.racha_equipo1) - obtener_valor_racha(contexto.racha_equipo2),
                "puntos_eq1": stats_eq1.get("puntos", 0),
                "puntos_eq2": stats_eq2.get("puntos", 0),
                "asistencias_eq1": stats_eq1.get("asistencias", 0),
                "asistencias_eq2": stats_eq2.get("asistencias", 0),
                "minutos_eq1": stats_eq1.get("minutos", 0),
                "minutos_eq2": stats_eq2.get("minutos", 0),
                "pct_tiros_eq1": stats_eq1.get("pct_tiros", 0),
                "pct_tiros_eq2": stats_eq2.get("pct_tiros", 0),
                "pct_triples_eq1": stats_eq1.get("pct_triples", 0),
                "pct_triples_eq2": stats_eq2.get("pct_triples", 0),
                "pct_libres_eq1": stats_eq1.get("pct_libres", 0),
                "pct_libres_eq2": stats_eq2.get("pct_libres", 0),
                "equipo1_gana": equipo1_gana
            })

        df = pd.DataFrame(datos)
        return df


if __name__ == "__main__":
    df = obtener_dataset_entrenamiento()
    if df.empty:
        print("❌ No se generó ningún dato.")
    else:
        df.to_csv("dataset_prediccion.csv", index=False)
        print("📄 Dataset exportado a 'dataset_prediccion.csv'")