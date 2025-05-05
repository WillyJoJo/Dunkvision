import requests
import math
import configparser
from app import app, db
from app.models import Jugador, Jugador_Partido
from pathlib import Path

BLOQUE_MAX = 500

# 1) Cargar configuración
config = configparser.ConfigParser()
base_dir = Path(__file__).resolve().parent
config_path = base_dir / "../config.ini"
config.read(config_path)

NBA_API_URL = config["NBA_API"]["url_jugador"]

HEADERS = {
    "Host": config["HEADERS"]["host"],
    "User-Agent": config["HEADERS"]["user_agent"],
    "Accept": config["HEADERS"]["accept"],
    "Referer": config["HEADERS"]["referer"],
    "Connection": config["HEADERS"]["connection"]
}

competicion = config["GAME_CONFIG"]["competicion"]
temporada = config["GAME_CONFIG"]["temporada"]
start_id = int(config["GAME_CONFIG"]["start_id"])
last_id = int(config["GAME_CONFIG"]["last_id"])
output_sql_file = config["SQL_CONFIG"]["ficherosql_jugador_partido"]

def convertir_minutos(minutos_str):
    """Convierte una cadena 'MM:SS' a minutos redondeados."""
    if not minutos_str or "DNP" in minutos_str or "Did Not Dress" in minutos_str or "Inactive" in minutos_str:
        return 0
    try:
        partes = minutos_str.split(":")
        minutos = float(partes[0])
        segundos = int(partes[1]) if len(partes) > 1 else 0
        minutos_totales = math.floor(minutos) + (segundos / 60)
        return round(minutos_totales)
    except ValueError:
        return 0

with app.app_context():
    valores = []

    for game_id in range(start_id, last_id + 1):
        game_id_str = f"{competicion}{temporada}{game_id:05d}"
        print(f"Consultando partido: {game_id_str}")

        try:
            response = requests.get(NBA_API_URL, headers=HEADERS, params={"GameID": game_id_str}, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"No se pudo obtener el partido {game_id_str}: {e}")
            continue

        data = response.json()
        estadisticas_jugadores = data["resultSets"][0]["rowSet"]

        for stats in estadisticas_jugadores:
            jugador_id = stats[4]
            equipo_id = stats[1]
            enfrentamiento_id = game_id_str

            # Validar si el jugador está en la BD
            if not db.session.get(Jugador, jugador_id):
                print(f"[IGNORADO] Jugador {jugador_id} no está en la BD. Omitido.")
                continue

            # Evitar duplicados
            ya_existia = db.session.query(Jugador_Partido).filter_by(
                jugador_id=jugador_id,
                enfrentamiento_id=enfrentamiento_id
            ).first()
            if ya_existia:
                print(f"[DUPLICADO] Jugador {jugador_id} ya tiene estadísticas en {enfrentamiento_id}, omitiendo.")
                continue

            minutos_jugados = convertir_minutos(stats[9])
            if minutos_jugados == 0:
                print(f"Jugador {jugador_id} no jugó en {enfrentamiento_id}, omitiendo...")
                continue

            puntos = stats[27] or 0
            asistencias = stats[22] or 0
            rebotes_ofensivos = stats[19] or 0
            rebotes_defensivos = stats[20] or 0
            robos = stats[23] or 0
            tapones = stats[24] or 0
            perdidas_balon = stats[25] or 0
            faltas_cometidas = stats[26] or 0
            faltas_recibidas = 0  # No disponible
            porcentaje_tiros_de_campo = stats[12] or 0
            porcentaje_triples = stats[15] or 0
            porcentaje_tiros_libres = stats[18] or 0

            valores.append(
                f"SELECT {jugador_id}, {equipo_id}, '{enfrentamiento_id}', {minutos_jugados}, {puntos}, {asistencias}, "
                f"{rebotes_ofensivos}, {rebotes_defensivos}, {robos}, {tapones}, {perdidas_balon}, {faltas_cometidas}, "
                f"{faltas_recibidas}, {porcentaje_tiros_de_campo}, {porcentaje_triples}, {porcentaje_tiros_libres}"
            )

    if valores:
        bloques = [valores[i:i+BLOQUE_MAX] for i in range(0, len(valores), BLOQUE_MAX)]

        with open(output_sql_file, "w", encoding="utf-8") as file:
            for idx, bloque in enumerate(bloques):
                if idx > 0:
                    file.write("\n-- ====================================\n\n")

                file.write("""INSERT INTO Jugador_Partido (
    jugador_id, equipo_id, enfrentamiento_id, minutos_jugados, puntos, asistencias, 
    rebotes_ofensivos, rebotes_defensivos, robos, tapones, perdidas_balon, 
    faltas_cometidas, faltas_recibidas, porcentaje_tiros_de_campo, 
    porcentaje_triples, porcentaje_tiros_libres
)
SELECT * FROM (
""")
                file.write("\nUNION ALL\n".join(bloque))
                file.write("""
) AS datos (
    jugador_id, equipo_id, enfrentamiento_id, minutos_jugados, puntos, asistencias,
    rebotes_ofensivos, rebotes_defensivos, robos, tapones, perdidas_balon,
    faltas_cometidas, faltas_recibidas, porcentaje_tiros_de_campo,
    porcentaje_triples, porcentaje_tiros_libres
)
WHERE EXISTS (
    SELECT 1 FROM Jugador j WHERE j.id_jugador = datos.jugador_id
);
""")
        print(f"\nScript SQL dividido generado correctamente en: {output_sql_file}")
    else:
        print("No se encontraron datos válidos para insertar.")