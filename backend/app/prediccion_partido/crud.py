import os
import joblib
import pandas as pd
from app import db
from app.models import Jugador, Estadisticas_Avanzadas_Jugador

def predecir_partido(equipo1_id, equipo2_id,
                     jugadores_lesionados=[], jugadores_fichados=[]):

    modelo_path = os.path.join(os.path.dirname(__file__), "..", "scripts", "modelo_prediccion_jugadores.pkl")
    modelo = joblib.load(modelo_path)

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

    # Mostrar plantilla final de cada equipo
    print("\n====== PLANTILLAS AJUSTADAS ======")

    def mostrar_plantilla(label, jugadores):
        print(f"\n>>> {label}")
        for j in jugadores:
            nombre = j.get("nombre", "Desconocido") if isinstance(j, dict) else j.nombre
            jugador_id = j.get("id_jugador") if isinstance(j, dict) else j.id_jugador
            print(f"{jugador_id} - {nombre}")

    mostrar_plantilla("PLANTILLA EQUIPO 1 FINAL", jugadores_disponibles1)
    mostrar_plantilla("PLANTILLA EQUIPO 2 FINAL", jugadores_disponibles2)

    def calcular_peso(minutos):
        if minutos <= 0:
            return 0
        elif minutos < 10:
            return (minutos / 36) ** 1
        elif minutos < 20:
            return (minutos / 36) ** 2
        elif minutos < 30:
            return (minutos / 36) ** 3
        else:
            return (minutos / 36) ** 4

    def media_ponderada_exponencial(jugadores, atributo, equipo):
        total_peso = 0
        total_valor = 0
        print(f"\n--- PESOS '{atributo.upper()}' - EQUIPO {equipo} ---")
        for j in jugadores:
            if isinstance(j, dict):
                min_j = j.get("minutos_jugados", 0)
                val_j = j.get(atributo, 0)
                nombre = j.get("nombre", "Desconocido")
                jid = j.get("id_jugador", "N/A")
            else:
                stats = db.session.query(Estadisticas_Avanzadas_Jugador).filter_by(jugador_id=j.id_jugador).first()
                if not stats:
                    continue
                min_j = stats.minutos_jugados or 0
                val_j = getattr(stats, atributo, 0) or 0
                nombre = j.nombre
                jid = j.id_jugador

            peso = calcular_peso(min_j)
            print(f"{jid} - {nombre}: minutos = {min_j}, peso = {peso:.3f}, valor = {val_j}")
            total_peso += peso
            total_valor += peso * val_j
        return total_valor / total_peso if total_peso else 0

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
        "delta_per": media_ponderada_exponencial(jugadores_disponibles1, "player_efficiency_rating", 1) - media_ponderada_exponencial(jugadores_disponibles2, "player_efficiency_rating", 2),
        "delta_usg": media_ponderada_exponencial(jugadores_disponibles1, "usage_porcentage", 1) - media_ponderada_exponencial(jugadores_disponibles2, "usage_porcentage", 2),
        "delta_bpm": media_ponderada_exponencial(jugadores_disponibles1, "box_plus_minus", 1) - media_ponderada_exponencial(jugadores_disponibles2, "box_plus_minus", 2),
        "delta_rating_of_jug": media_ponderada_exponencial(jugadores_disponibles1, "rating_ofensivo", 1) - media_ponderada_exponencial(jugadores_disponibles2, "rating_ofensivo", 2),
        "delta_rating_def_jug": media_ponderada_exponencial(jugadores_disponibles1, "rating_defensivo", 1) - media_ponderada_exponencial(jugadores_disponibles2, "rating_defensivo", 2),
        "delta_efg": media_ponderada_exponencial(jugadores_disponibles1, "porcentaje_efectivo_tiros_de_campo", 1) - media_ponderada_exponencial(jugadores_disponibles2, "porcentaje_efectivo_tiros_de_campo", 2),

        # Tradicionales
        "delta_puntos": media_ponderada_exponencial(jugadores_disponibles1, "puntos", 1) - media_ponderada_exponencial(jugadores_disponibles2, "puntos", 2),
        "delta_asistencias": media_ponderada_exponencial(jugadores_disponibles1, "asistencias", 1) - media_ponderada_exponencial(jugadores_disponibles2, "asistencias", 2),
        "delta_rebotes_totales": media_ponderada_exponencial(jugadores_disponibles1, "rebotes_totales", 1) - media_ponderada_exponencial(jugadores_disponibles2, "rebotes_totales", 2),
        "delta_robos": media_ponderada_exponencial(jugadores_disponibles1, "robos", 1) - media_ponderada_exponencial(jugadores_disponibles2, "robos", 2),
        "delta_tapones": media_ponderada_exponencial(jugadores_disponibles1, "tapones", 1) - media_ponderada_exponencial(jugadores_disponibles2, "tapones", 2),
        "delta_tiros_libres": media_ponderada_exponencial(jugadores_disponibles1, "porcentaje_tiros_libres", 1) - media_ponderada_exponencial(jugadores_disponibles2, "porcentaje_tiros_libres", 2),
        "delta_faltas_cometidas": media_ponderada_exponencial(jugadores_disponibles2, "faltas_cometidas", 2) - media_ponderada_exponencial(jugadores_disponibles1, "faltas_cometidas", 1),
        "delta_perdidas_balon": media_ponderada_exponencial(jugadores_disponibles2, "perdidas_balon", 2) - media_ponderada_exponencial(jugadores_disponibles1, "perdidas_balon", 1),
    }])

    # Aplicar mismos pesos que en el entrenamiento
    datos["delta_ws_total"] *= 4
    datos["delta_ws_of"] *= 3
    datos["delta_ws_def"] *= 3
    datos["delta_per"] *= 2
    datos["delta_usg"] *= 2
    datos["delta_bpm"] *= 2
    datos["delta_rating_of_jug"] *= 1.5
    datos["delta_rating_def_jug"] *= 1.5
    datos["delta_efg"] *= 2

    datos["delta_puntos"] *= 3
    datos["delta_asistencias"] *= 2.5
    datos["delta_rebotes_totales"] *= 2
    datos["delta_robos"] *= 1.5
    datos["delta_tapones"] *= 1.5
    datos["delta_tiros_libres"] *= 1
    datos["delta_faltas_cometidas"] *= 1.5
    datos["delta_perdidas_balon"] *= 2

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