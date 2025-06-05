import os
import joblib
import pandas as pd
from app import db
from app.models import Jugador, Estadisticas_Avanzadas_Jugador


def predecir_partido(equipo1_id, equipo2_id,
                     jugadores_lesionados=[], jugadores_fichados=[]):

    modelo_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "modelo_prediccion_jugadores_xgb.pkl")
    modelo, columnas_esperadas = joblib.load(modelo_path)  # <- ahora cargamos también las columnas

    ids_lesionados = set(jugadores_lesionados)

    jugadores_eq1 = db.session.query(Jugador).filter_by(equipo_id=equipo1_id).all()
    jugadores_eq2 = db.session.query(Jugador).filter_by(equipo_id=equipo2_id).all()

    jugadores_fichados_eq1 = [j for j in jugadores_fichados if j["equipo_id"] == equipo1_id]
    jugadores_fichados_eq2 = [j for j in jugadores_fichados if j["equipo_id"] == equipo2_id]

    ids_fichados_desde_eq1 = {j["id_jugador"] for j in jugadores_fichados if j["equipo_id"] == equipo2_id}
    ids_fichados_desde_eq2 = {j["id_jugador"] for j in jugadores_fichados if j["equipo_id"] == equipo1_id}

    jugadores_disponibles1 = [
        j for j in jugadores_eq1
        if j.id_jugador not in ids_lesionados and j.id_jugador not in ids_fichados_desde_eq1
    ]
    jugadores_disponibles2 = [
        j for j in jugadores_eq2
        if j.id_jugador not in ids_lesionados and j.id_jugador not in ids_fichados_desde_eq2
    ]

    jugadores_disponibles1 += jugadores_fichados_eq1
    jugadores_disponibles2 += jugadores_fichados_eq2

    def mostrar_plantilla(label, jugadores):
        print(f"\n>>> {label}")
        for j in jugadores:
            nombre = j.get("nombre", "Desconocido") if isinstance(j, dict) else j.nombre
            jugador_id = j.get("id_jugador") if isinstance(j, dict) else j.id_jugador
            print(f"{jugador_id} - {nombre}")

    mostrar_plantilla("PLANTILLA EQUIPO 1 FINAL", jugadores_disponibles1)
    mostrar_plantilla("PLANTILLA EQUIPO 2 FINAL", jugadores_disponibles2)

    def media(jugadores, atributo):
        valores = []
        for j in jugadores:
            if isinstance(j, dict):
                val = j.get(atributo)
                if val is not None:
                    valores.append(val)
            else:
                stats = db.session.query(Estadisticas_Avanzadas_Jugador).filter_by(jugador_id=j.id_jugador).first()
                if stats:
                    val = getattr(stats, atributo, None)
                    if val is not None:
                        valores.append(val)
        return sum(valores) / len(valores) if valores else 0

    def suma(jugadores, atributo):
        total = 0
        for j in jugadores:
            if isinstance(j, dict):
                total += j.get(atributo, 0)
            else:
                stats = db.session.query(Estadisticas_Avanzadas_Jugador).filter_by(jugador_id=j.id_jugador).first()
                if stats:
                    total += getattr(stats, atributo, 0) or 0
        return total

    datos = pd.DataFrame([{
        "delta_ws_total": suma(jugadores_disponibles1, "win_share_total") - suma(jugadores_disponibles2, "win_share_total"),
        "delta_ws_of": suma(jugadores_disponibles1, "win_share_ofensivo") - suma(jugadores_disponibles2, "win_share_ofensivo"),
        "delta_ws_def": suma(jugadores_disponibles1, "win_share_defensivo") - suma(jugadores_disponibles2, "win_share_defensivo"),
        "delta_per": media(jugadores_disponibles1, "player_efficiency_rating") - media(jugadores_disponibles2, "player_efficiency_rating"),
        "delta_usg": media(jugadores_disponibles1, "usage_porcentage") - media(jugadores_disponibles2, "usage_porcentage"),
        "delta_bpm": media(jugadores_disponibles1, "box_plus_minus") - media(jugadores_disponibles2, "box_plus_minus"),
        "delta_rating_of_jug": media(jugadores_disponibles1, "rating_ofensivo") - media(jugadores_disponibles2, "rating_ofensivo"),
        "delta_rating_def_jug": media(jugadores_disponibles1, "rating_defensivo") - media(jugadores_disponibles2, "rating_defensivo"),
        "delta_efg": media(jugadores_disponibles1, "porcentaje_efectivo_tiros_de_campo") - media(jugadores_disponibles2, "porcentaje_efectivo_tiros_de_campo"),
        "delta_puntos": media(jugadores_disponibles1, "puntos") - media(jugadores_disponibles2, "puntos"),
        "delta_asistencias": media(jugadores_disponibles1, "asistencias") - media(jugadores_disponibles2, "asistencias"),
        "delta_rebotes_totales": media(jugadores_disponibles1, "rebotes_totales") - media(jugadores_disponibles2, "rebotes_totales"),
        "delta_robos": media(jugadores_disponibles1, "robos") - media(jugadores_disponibles2, "robos"),
        "delta_tapones": media(jugadores_disponibles1, "tapones") - media(jugadores_disponibles2, "tapones"),
        "delta_tiros_libres": media(jugadores_disponibles1, "porcentaje_tiros_libres") - media(jugadores_disponibles2, "porcentaje_tiros_libres"),
        "delta_faltas_cometidas": media(jugadores_disponibles2, "faltas_cometidas") - media(jugadores_disponibles1, "faltas_cometidas"),
        "delta_perdidas_balon": media(jugadores_disponibles2, "perdidas_balon") - media(jugadores_disponibles1, "perdidas_balon"),
        "delta_real_puntos": media(jugadores_disponibles1, "puntos") - media(jugadores_disponibles2, "puntos"),
        "delta_real_asistencias": media(jugadores_disponibles1, "asistencias") - media(jugadores_disponibles2, "asistencias"),
        "delta_real_reb_def": media(jugadores_disponibles1, "rebotes_defensivos") - media(jugadores_disponibles2, "rebotes_defensivos"),
        "delta_real_robos": media(jugadores_disponibles1, "robos") - media(jugadores_disponibles2, "robos"),
        "delta_real_tapones": media(jugadores_disponibles1, "tapones") - media(jugadores_disponibles2, "tapones"),
    }])

    # 🔒 Reordenamos según columnas del modelo
    datos = datos[columnas_esperadas]

    print("\n---- FEATURES GENERADAS ----")
    for k, v in datos.iloc[0].items():
        print(f"{k}: {v:.4f}")
    print("Probas crudas:", modelo.predict_proba(datos)[0])

    resultado = int(modelo.predict(datos)[0])
    probas = modelo.predict_proba(datos)[0].tolist()

    return {
        "equipo1_gana": bool(resultado),
        "probabilidad_equipo1": round(probas[1] * 100, 2),
        "probabilidad_equipo2": round(probas[0] * 100, 2)
    }