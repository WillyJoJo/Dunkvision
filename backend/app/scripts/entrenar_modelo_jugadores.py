import os
import pandas as pd
import joblib
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from app import app, db
from app.models import (
    Enfrentamiento, Contexto_Partido, Historial_Enfrentamientos,
    Estadisticas_Avanzadas_Jugador, Jugador
)
from sqlalchemy import or_, and_


def obtener_valor_racha(racha):
    if not racha:
        return 0
    try:
        if '-' in racha:
            partes = racha.split('-')
            return int(partes[0]) - int(partes[1])
    except Exception:
        return 0


def media_ponderada(jugadores, stats_dict, atributo):
    numerador = sum((getattr(stats_dict[j.id_jugador], atributo, 0) or 0) *
                    (getattr(stats_dict[j.id_jugador], "minutos_jugados", 0) or 0)
                    for j in jugadores if j.id_jugador in stats_dict)
    denominador = sum((getattr(stats_dict[j.id_jugador], "minutos_jugados", 0) or 0)
                      for j in jugadores if j.id_jugador in stats_dict)
    return numerador / denominador if denominador else 0


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

            datos.append({
                "delta_ws_total": sum((jugadores_stats[j.id_jugador].win_share_total or 0) for j in jugadores_eq1 if j.id_jugador in jugadores_stats) -
                                  sum((jugadores_stats[j.id_jugador].win_share_total or 0) for j in jugadores_eq2 if j.id_jugador in jugadores_stats),
                "delta_ws_of": sum((jugadores_stats[j.id_jugador].win_share_ofensivo or 0) for j in jugadores_eq1 if j.id_jugador in jugadores_stats) -
                               sum((jugadores_stats[j.id_jugador].win_share_ofensivo or 0) for j in jugadores_eq2 if j.id_jugador in jugadores_stats),
                "delta_ws_def": sum((jugadores_stats[j.id_jugador].win_share_defensivo or 0) for j in jugadores_eq1 if j.id_jugador in jugadores_stats) -
                                sum((jugadores_stats[j.id_jugador].win_share_defensivo or 0) for j in jugadores_eq2 if j.id_jugador in jugadores_stats),
                "delta_per": media_ponderada(jugadores_eq1, jugadores_stats, "player_efficiency_rating") -
                             media_ponderada(jugadores_eq2, jugadores_stats, "player_efficiency_rating"),
                "delta_usg": media_ponderada(jugadores_eq1, jugadores_stats, "usage_porcentage") -
                             media_ponderada(jugadores_eq2, jugadores_stats, "usage_porcentage"),
                "delta_bpm": media_ponderada(jugadores_eq1, jugadores_stats, "box_plus_minus") -
                             media_ponderada(jugadores_eq2, jugadores_stats, "box_plus_minus"),
                "delta_rating_of_jug": media_ponderada(jugadores_eq1, jugadores_stats, "rating_ofensivo") -
                                       media_ponderada(jugadores_eq2, jugadores_stats, "rating_ofensivo"),
                "delta_rating_def_jug": media_ponderada(jugadores_eq1, jugadores_stats, "rating_defensivo") -
                                        media_ponderada(jugadores_eq2, jugadores_stats, "rating_defensivo"),
                "delta_efg": media_ponderada(jugadores_eq1, jugadores_stats, "porcentaje_efectivo_tiros_de_campo") -
                             media_ponderada(jugadores_eq2, jugadores_stats, "porcentaje_efectivo_tiros_de_campo"),

                # Estats tradicionales
                "delta_puntos": media_ponderada(jugadores_eq1, jugadores_stats, "puntos") -
                                media_ponderada(jugadores_eq2, jugadores_stats, "puntos"),
                "delta_asistencias": media_ponderada(jugadores_eq1, jugadores_stats, "asistencias") -
                                     media_ponderada(jugadores_eq2, jugadores_stats, "asistencias"),
                "delta_rebotes_totales": media_ponderada(jugadores_eq1, jugadores_stats, "rebotes_totales") -
                                         media_ponderada(jugadores_eq2, jugadores_stats, "rebotes_totales"),
                "delta_robos": media_ponderada(jugadores_eq1, jugadores_stats, "robos") -
                               media_ponderada(jugadores_eq2, jugadores_stats, "robos"),
                "delta_tapones": media_ponderada(jugadores_eq1, jugadores_stats, "tapones") -
                                 media_ponderada(jugadores_eq2, jugadores_stats, "tapones"),
                "delta_tiros_libres": media_ponderada(jugadores_eq1, jugadores_stats, "porcentaje_tiros_libres") -
                                      media_ponderada(jugadores_eq2, jugadores_stats, "porcentaje_tiros_libres"),
                "delta_faltas_cometidas": media_ponderada(jugadores_eq2, jugadores_stats, "faltas_cometidas") -
                                          media_ponderada(jugadores_eq1, jugadores_stats, "faltas_cometidas"),
                "delta_perdidas_balon": media_ponderada(jugadores_eq2, jugadores_stats, "perdidas_balon") -
                                        media_ponderada(jugadores_eq1, jugadores_stats, "perdidas_balon"),

                # Resultado del partido
                "equipo1_gana": 1 if enf.puntos_equipo1 > enf.puntos_equipo2 else 0
            })

        return pd.DataFrame(datos)

def entrenar_y_guardar_modelo():
    df = obtener_dataset_entrenamiento()
    if df.empty:
        print("❌ No hay datos suficientes para entrenar el modelo.")
        return

    X = df.drop(columns=["equipo1_gana"])
    y = df["equipo1_gana"]

    # Aplicar pesos personalizados
    X["delta_ws_total"] *= 4
    X["delta_ws_of"] *= 3
    X["delta_ws_def"] *= 3
    X["delta_per"] *= 2
    X["delta_usg"] *= 2
    X["delta_bpm"] *= 2
    X["delta_rating_of_jug"] *= 1.5
    X["delta_rating_def_jug"] *= 1.5
    X["delta_efg"] *= 2

    X["delta_puntos"] *= 3
    X["delta_asistencias"] *= 2.5
    X["delta_rebotes_totales"] *= 2
    X["delta_robos"] *= 1.5
    X["delta_tapones"] *= 1.5
    X["delta_tiros_libres"] *= 1
    X["delta_faltas_cometidas"] *= 1.5
    X["delta_perdidas_balon"] *= 2

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    modelo = LogisticRegression(max_iter=1000, class_weight="balanced", solver="liblinear", random_state=42)
    modelo.fit(X_train, y_train)

    y_pred = modelo.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Precisión del modelo (LogReg): {acc:.2f}")

    ruta_modelo = os.path.join(os.path.dirname(__file__), "modelo_prediccion_jugadores.pkl")
    joblib.dump(modelo, ruta_modelo)

    # Visualización de importancia (coeficientes absolutos)
    importancias = abs(modelo.coef_[0])
    plt.figure(figsize=(12, 6))
    plt.barh(X.columns, importancias)
    plt.title("Importancia de variables (coeficientes Regresión Logística)")
    plt.tight_layout()
    plt.savefig(os.path.join(os.path.dirname(__file__), "importancia_variables_jugadores.png"))


if __name__ == "__main__":
    entrenar_y_guardar_modelo()