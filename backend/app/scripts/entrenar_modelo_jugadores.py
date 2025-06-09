import os
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from app import app, db
from app.models import (
    Enfrentamiento, Contexto_Partido, Estadisticas_Avanzadas_Jugador,
    Jugador, Jugador_Partido
)


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

        def media(jugadores, atributo):
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

        for enf in enfrentamientos:
            contexto = enf.contexto
            if not contexto or enf.puntos_equipo1 is None or enf.puntos_equipo2 is None:
                continue

            jugadores_eq1 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo1_id).all()
            jugadores_eq2 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo2_id).all()

            delta_dict = {
                # Promedios de temporada
                "delta_ws_total": media(jugadores_eq1, "win_share_total") - media(jugadores_eq2, "win_share_total"),
                "delta_ws_of": media(jugadores_eq1, "win_share_ofensivo") - media(jugadores_eq2, "win_share_ofensivo"),
                "delta_ws_def": media(jugadores_eq1, "win_share_defensivo") - media(jugadores_eq2, "win_share_defensivo"),
                "delta_per": media(jugadores_eq1, "player_efficiency_rating") - media(jugadores_eq2, "player_efficiency_rating"),
                "delta_usg": media(jugadores_eq1, "usage_porcentage") - media(jugadores_eq2, "usage_porcentage"),
                "delta_bpm": media(jugadores_eq1, "box_plus_minus") - media(jugadores_eq2, "box_plus_minus"),
                "delta_rating_of_jug": media(jugadores_eq1, "rating_ofensivo") - media(jugadores_eq2, "rating_ofensivo"),
                "delta_rating_def_jug": media(jugadores_eq1, "rating_defensivo") - media(jugadores_eq2, "rating_defensivo"),
                "delta_efg": media(jugadores_eq1, "porcentaje_efectivo_tiros_de_campo") - media(jugadores_eq2, "porcentaje_efectivo_tiros_de_campo"),
                "delta_faltas_cometidas": media(jugadores_eq2, "faltas_cometidas") - media(jugadores_eq1, "faltas_cometidas"),
                "delta_perdidas_balon": media(jugadores_eq2, "perdidas_balon") - media(jugadores_eq1, "perdidas_balon"),
                "delta_puntos": media(jugadores_eq1, "puntos") - media(jugadores_eq2, "puntos"),
                "delta_asistencias": media(jugadores_eq1, "asistencias") - media(jugadores_eq2, "asistencias"),
                "delta_rebotes_totales": media(jugadores_eq1, "rebotes_totales") - media(jugadores_eq2, "rebotes_totales"),
                "delta_robos": media(jugadores_eq1, "robos") - media(jugadores_eq2, "robos"),
                "delta_tapones": media(jugadores_eq1, "tapones") - media(jugadores_eq2, "tapones"),
                "delta_tiros_libres": media(jugadores_eq1, "porcentaje_tiros_libres") - media(jugadores_eq2, "porcentaje_tiros_libres"),

                # Datos reales del partido (Jugador_Partido)
                "delta_real_puntos": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "puntos") or 0) -
                                    (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "puntos") or 0),
                "delta_real_asistencias": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "asistencias") or 0) -
                                        (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "asistencias") or 0),
                "delta_real_reb_def": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "rebotes_defensivos") or 0) -
                                    (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "rebotes_defensivos") or 0),
                "delta_real_robos": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "robos") or 0) -
                                    (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "robos") or 0),
                "delta_real_tapones": (media_partido(enf.equipo1_id, enf.id_enfrentamiento, "tapones") or 0) -
                                    (media_partido(enf.equipo2_id, enf.id_enfrentamiento, "tapones") or 0),

                "equipo1_gana": 1 if enf.puntos_equipo1 > enf.puntos_equipo2 else 0
            }

            if any(v is not None for k, v in delta_dict.items() if k.startswith("delta_real_")):
                datos.append(delta_dict)

        return pd.DataFrame(datos)


def entrenar_y_guardar_modelo():
    df = obtener_dataset_entrenamiento()
    if df.empty:
        print("No hay datos suficientes para entrenar el modelo.")
        return
    
    columnas_ordenadas = [
    "delta_ws_total", "delta_ws_of", "delta_ws_def", "delta_per",
    "delta_usg", "delta_bpm", "delta_rating_of_jug", "delta_rating_def_jug",
    "delta_efg", "delta_puntos", "delta_asistencias", "delta_rebotes_totales",
    "delta_robos", "delta_tapones", "delta_tiros_libres",
    "delta_faltas_cometidas", "delta_perdidas_balon",
    "delta_real_puntos", "delta_real_asistencias", "delta_real_reb_def",
    "delta_real_robos", "delta_real_tapones"
]
    df = df[columnas_ordenadas + ["equipo1_gana"]]


    X = df.drop(columns=["equipo1_gana"])
    y = df["equipo1_gana"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    modelo = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42
    )

    modelo.fit(X_train, y_train)

    y_pred = modelo.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Precisión del modelo (XGBoost): {acc:.2f}")

    ruta_modelo = os.path.join(os.path.dirname(__file__), "modelo_prediccion_jugadores_xgb.pkl")
    joblib.dump((modelo, columnas_ordenadas), ruta_modelo)

    plt.figure(figsize=(12, 6))
    xgb.plot_importance(modelo, importance_type='gain', show_values=False)
    plt.title("Importancia de variables (XGBoost - Gain)")
    plt.tight_layout()
    plt.savefig(os.path.join(os.path.dirname(__file__), "importancia_variables_jugadores_xgb.png"))
    plt.show()


if __name__ == "__main__":
    entrenar_y_guardar_modelo()