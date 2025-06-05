# exportar_dataset_modelo_jugadores.py

import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app import app, db
from app.models import (
    Enfrentamiento, Contexto_Partido, Estadisticas_Avanzadas_Jugador,
    Jugador, Jugador_Partido
)
import pandas as pd


def media(jugadores, atributo, jugadores_stats):
    valores = []
    for j in jugadores:
        if j.id_jugador in jugadores_stats:
            valor = getattr(jugadores_stats[j.id_jugador], atributo, None)
            if valor is not None:
                valores.append(valor)
    return sum(valores) / len(valores) if valores else 0


def media_partido(equipo_id, enfrentamiento_id, atributo):
    filas = db.session.query(Jugador_Partido).filter_by(
        equipo_id=equipo_id,
        enfrentamiento_id=enfrentamiento_id
    ).all()
    valores = [getattr(fp, atributo, None) for fp in filas if getattr(fp, atributo, None) is not None]
    return sum(valores) / len(valores) if valores else None


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

            jugadores_eq1 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo1_id).all()
            jugadores_eq2 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo2_id).all()

            delta_dict = {
                "delta_ws_total": media(jugadores_eq1, "win_share_total", jugadores_stats) - media(jugadores_eq2, "win_share_total", jugadores_stats),
                "delta_ws_of": media(jugadores_eq1, "win_share_ofensivo", jugadores_stats) - media(jugadores_eq2, "win_share_ofensivo", jugadores_stats),
                "delta_ws_def": media(jugadores_eq1, "win_share_defensivo", jugadores_stats) - media(jugadores_eq2, "win_share_defensivo", jugadores_stats),
                "delta_per": media(jugadores_eq1, "player_efficiency_rating", jugadores_stats) - media(jugadores_eq2, "player_efficiency_rating", jugadores_stats),
                "delta_usg": media(jugadores_eq1, "usage_porcentage", jugadores_stats) - media(jugadores_eq2, "usage_porcentage", jugadores_stats),
                "delta_bpm": media(jugadores_eq1, "box_plus_minus", jugadores_stats) - media(jugadores_eq2, "box_plus_minus", jugadores_stats),
                "delta_rating_of_jug": media(jugadores_eq1, "rating_ofensivo", jugadores_stats) - media(jugadores_eq2, "rating_ofensivo", jugadores_stats),
                "delta_rating_def_jug": media(jugadores_eq1, "rating_defensivo", jugadores_stats) - media(jugadores_eq2, "rating_defensivo", jugadores_stats),
                "delta_efg": media(jugadores_eq1, "porcentaje_efectivo_tiros_de_campo", jugadores_stats) - media(jugadores_eq2, "porcentaje_efectivo_tiros_de_campo", jugadores_stats),
                "delta_faltas_cometidas": media(jugadores_eq2, "faltas_cometidas", jugadores_stats) - media(jugadores_eq1, "faltas_cometidas", jugadores_stats),
                "delta_perdidas_balon": media(jugadores_eq2, "perdidas_balon", jugadores_stats) - media(jugadores_eq1, "perdidas_balon", jugadores_stats),
                "delta_puntos": media(jugadores_eq1, "puntos", jugadores_stats) - media(jugadores_eq2, "puntos", jugadores_stats),
                "delta_asistencias": media(jugadores_eq1, "asistencias", jugadores_stats) - media(jugadores_eq2, "asistencias", jugadores_stats),
                "delta_rebotes_totales": media(jugadores_eq1, "rebotes_totales", jugadores_stats) - media(jugadores_eq2, "rebotes_totales", jugadores_stats),
                "delta_robos": media(jugadores_eq1, "robos", jugadores_stats) - media(jugadores_eq2, "robos", jugadores_stats),
                "delta_tapones": media(jugadores_eq1, "tapones", jugadores_stats) - media(jugadores_eq2, "tapones", jugadores_stats),
                "delta_tiros_libres": media(jugadores_eq1, "porcentaje_tiros_libres", jugadores_stats) - media(jugadores_eq2, "porcentaje_tiros_libres", jugadores_stats),

                "delta_real_puntos": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "puntos") or 0) - (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "puntos") or 0),
                "delta_real_asistencias": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "asistencias") or 0) - (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "asistencias") or 0),
                "delta_real_reb_def": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "rebotes_defensivos") or 0) - (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "rebotes_defensivos") or 0),
                "delta_real_robos": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "robos") or 0) - (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "robos") or 0),
                "delta_real_tapones": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "tapones") or 0) - (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "tapones") or 0),

                "equipo1_gana": 1 if enf.puntos_equipo1 > enf.puntos_equipo2 else 0
            }

            if any(v is not None for k, v in delta_dict.items() if k.startswith("delta_real_")):
                datos.append(delta_dict)

        return pd.DataFrame(datos)


if __name__ == "__main__":
    df = obtener_dataset_entrenamiento()
    if df.empty:
        print("❌ No se generó ningún dato.")
    else:
        nombre_archivo = "dataset_entrenamiento_jugadores.csv"
        df.to_csv(nombre_archivo, index=False)
        print(f"📄 Dataset exportado correctamente a '{nombre_archivo}'")