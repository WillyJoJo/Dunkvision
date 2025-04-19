from app import app, db
from app.models import (
    Enfrentamiento, Contexto_Partido, Lesiones_Jugador, Historial_Enfrentamientos,
    Estadisticas_Avanzadas_Equipo, Estadisticas_Avanzadas_Jugador, Jugador, Equipo
)
from sqlalchemy import or_, and_
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib


def obtener_valor_racha(racha):
    if not racha:
        return 0
    try:
        # Caso tipo '3-2'
        if '-' in racha:
            partes = racha.split('-')
            return int(partes[0]) - int(partes[1])
        # Caso tipo 'WWLLW'
        victorias = sum(1 for c in racha.upper() if c == 'W')
        derrotas = sum(1 for c in racha.upper() if c == 'L')
        return victorias - derrotas
    except Exception:
        return 0


def obtener_dataset_entrenamiento():
    with app.app_context():
        enfrentamientos = (
            db.session.query(Enfrentamiento)
            .join(Contexto_Partido, Contexto_Partido.enfrentamiento_id == Enfrentamiento.id_enfrentamiento)
            .all()
        )

        datos = []

        for enf in enfrentamientos:
            contexto = enf.contexto
            if not contexto:
                continue

            # Historial de enfrentamientos
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

            # Lesiones
            lesiones_eq1 = db.session.query(Lesiones_Jugador).join(Jugador).filter(
                Jugador.equipo_id == enf.equipo1_id,
                Lesiones_Jugador.fecha_recuperacion_estimada >= enf.fecha
            ).count()

            lesiones_eq2 = db.session.query(Lesiones_Jugador).join(Jugador).filter(
                Jugador.equipo_id == enf.equipo2_id,
                Lesiones_Jugador.fecha_recuperacion_estimada >= enf.fecha
            ).count()

            # Estadísticas avanzadas de equipos
            estad_eq1 = db.session.query(Estadisticas_Avanzadas_Equipo).filter_by(
                equipo_id=enf.equipo1_id).first()
            estad_eq2 = db.session.query(Estadisticas_Avanzadas_Equipo).filter_by(
                equipo_id=enf.equipo2_id).first()

            if not estad_eq1 or not estad_eq2:
                continue

            # Estadísticas de jugadores disponibles (win_share_total)
            jugadores_eq1 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo1_id).all()
            jugadores_eq2 = db.session.query(Jugador).filter_by(equipo_id=enf.equipo2_id).all()

            ids_lesionados = db.session.query(Lesiones_Jugador.jugador_id).filter(
                Lesiones_Jugador.fecha_recuperacion_estimada >= enf.fecha
            ).all()
            ids_lesionados = [id[0] for id in ids_lesionados]

            jugadores_disponibles1 = [j for j in jugadores_eq1 if j.id_jugador not in ids_lesionados]
            jugadores_disponibles2 = [j for j in jugadores_eq2 if j.id_jugador not in ids_lesionados]

            ws_total_eq1 = 0
            for j in jugadores_disponibles1:
                est = db.session.query(Estadisticas_Avanzadas_Jugador).filter_by(jugador_id=j.id_jugador).first()
                if est:
                    ws_total_eq1 += est.win_share_total or 0

            ws_total_eq2 = 0
            for j in jugadores_disponibles2:
                est = db.session.query(Estadisticas_Avanzadas_Jugador).filter_by(jugador_id=j.id_jugador).first()
                if est:
                    ws_total_eq2 += est.win_share_total or 0

            # Resultado del partido
            if enf.puntos_equipo1 is None or enf.puntos_equipo2 is None:
                continue  # Saltar enfrentamientos sin resultado
            
            equipo1_gana = 1 if enf.puntos_equipo1 > enf.puntos_equipo2 else 0


            datos.append({
                "dias_descanso_equipo1": contexto.dias_descanso_equipo1,
                "dias_descanso_equipo2": contexto.dias_descanso_equipo2,
                "racha_equipo1": obtener_valor_racha(contexto.racha_equipo1),
                "racha_equipo2": obtener_valor_racha(contexto.racha_equipo2),
                "lesiones_equipo1": lesiones_eq1,
                "lesiones_equipo2": lesiones_eq2,
                "victorias_equipo1_vs_equipo2": victorias1,
                "victorias_equipo2_vs_equipo1": victorias2,
                "rating_ofensivo_equipo1": estad_eq1.rating_ofensivo,
                "rating_defensivo_equipo1": estad_eq1.rating_defensivo,
                "rating_ofensivo_equipo2": estad_eq2.rating_ofensivo,
                "rating_defensivo_equipo2": estad_eq2.rating_defensivo,
                "win_share_total_jugadores1": ws_total_eq1,
                "win_share_total_jugadores2": ws_total_eq2,
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

    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ Precisión del modelo: {accuracy:.2f}")

    joblib.dump(model, "modelo_prediccion_partidos.pkl")
    print("📦 Modelo guardado como 'modelo_prediccion_partidos.pkl'")


if __name__ == "__main__":
    entrenar_y_guardar_modelo()