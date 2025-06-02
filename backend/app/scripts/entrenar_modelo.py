from app import app, db
from app.models import (
    Enfrentamiento, Contexto_Partido, Historial_Enfrentamientos,
    Estadisticas_Avanzadas_Equipo, Estadisticas_Avanzadas_Jugador,
    Jugador, Equipo
)
from sqlalchemy import or_, and_
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt
import numpy as np
import joblib


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

                "delta_puntos": (estad_eq1.puntos or 0) - (estad_eq2.puntos or 0),
                "delta_asistencias": (estad_eq1.asistencias or 0) - (estad_eq2.asistencias or 0),
                "delta_rebotes": (estad_eq1.rebotes_totales or 0) - (estad_eq2.rebotes_totales or 0),
                "delta_robos": (estad_eq1.robos or 0) - (estad_eq2.robos or 0),
                "delta_tapones": (estad_eq1.tapones or 0) - (estad_eq2.tapones or 0),
                "delta_pct_tiros": (estad_eq1.porcentaje_tiros_de_campo or 0) - (estad_eq2.porcentaje_tiros_de_campo or 0),
                "delta_pct_triples": (estad_eq1.porcentaje_triples or 0) - (estad_eq2.porcentaje_triples or 0),
                "delta_pct_dos": (estad_eq1.porcentaje_tiros_de_dos or 0) - (estad_eq2.porcentaje_tiros_de_dos or 0),
                "delta_pct_efectivo": (estad_eq1.porcentaje_efectivo_tiros_de_campo or 0) - (estad_eq2.porcentaje_efectivo_tiros_de_campo or 0),
                "delta_pct_libres": (estad_eq1.porcentaje_tiros_libres or 0) - (estad_eq2.porcentaje_tiros_libres or 0),
                "delta_ritmo": (estad_eq1.ritmo or 0) - (estad_eq2.ritmo or 0),
                "delta_sos": (estad_eq1.strength_of_schedule or 0) - (estad_eq2.strength_of_schedule or 0),
                "delta_victorias": (estad_eq1.victorias or 0) - (estad_eq2.victorias or 0),
                "delta_derrotas": (estad_eq1.derrotas or 0) - (estad_eq2.derrotas or 0),

                "equipo1_gana": equipo1_gana
            })

        df = pd.DataFrame(datos)
        return df


def entrenar_y_guardar_modelo():
    df = obtener_dataset_entrenamiento()
    if df.empty:
        print("❌ No hay datos suficientes para entrenar el modelo.")
        return

    X = df.drop(columns=["equipo1_gana"])
    y = df["equipo1_gana"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=300, class_weight="balanced", random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ Precisión del modelo: {accuracy:.2f}")

    joblib.dump(model, "modelo_prediccion_partidos.pkl")
    print("📦 Modelo guardado como 'modelo_prediccion_partidos.pkl'")

    # Gráfico de importancia
    importancias = model.feature_importances_
    caracteristicas = X.columns
    indices = np.argsort(importancias)[::-1]

    plt.figure(figsize=(12, 6))
    plt.bar(range(len(importancias)), importancias[indices])
    plt.xticks(range(len(importancias)), caracteristicas[indices], rotation=90)
    plt.title("Importancia de cada variable en el modelo")
    plt.tight_layout()
    plt.savefig("importancia_variables.png")
    print("📊 Gráfico de importancia guardado como 'importancia_variables.png'")


if __name__ == "__main__":
    entrenar_y_guardar_modelo()