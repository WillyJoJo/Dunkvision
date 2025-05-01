import requests
import time
import configparser
from requests.exceptions import RequestException

# 1) Cargamos el archivo config.ini
config = configparser.ConfigParser()
config.read("config.ini")  # ← como ya lo tenías

# 2) Leemos las secciones
NBA_API_URL = config["NBA_API"]["url_enfrentamiento"]

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
max_games = int(config["GAME_CONFIG"]["max_games"])
output_sql_file = config["SQL_CONFIG"]["ficherosql_enfrentamiento"]

# 3) Lógica del script
with open(output_sql_file, "w", encoding="utf-8") as file2:
    file2.write("INSERT INTO Enfrentamiento (equipo1_id, equipo2_id, puntos_equipo1, puntos_equipo2, fecha) VALUES\n")

    primera_linea = True

    for i in range(max_games):
        game_id = f"{competicion}{temporada}{start_id + i:05d}"
        params = {"GameID": game_id}
        print(f"Consultando partido: {game_id}")

        data = None
        for intento in range(3):  # Reintenta hasta 3 veces
            try:
                response = requests.get(NBA_API_URL, headers=HEADERS, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()
                break
            except RequestException as e:
                print(f"Error en el intento {intento + 1} para el partido {game_id}: {e}")
                time.sleep(3)
        else:
            print(f"No se pudo obtener el partido {game_id} tras 3 intentos.")
            continue

        try:
            game_summary = data["resultSets"][0]["rowSet"][0]
            line_score = data["resultSets"][5]["rowSet"]

            fecha = game_summary[0].split("T")[0]
            equipo_local_id = game_summary[6]
            equipo_visitante_id = game_summary[7]

            puntos_local = "NULL"
            puntos_visitante = "NULL"

            for team_stats in line_score:
                team_id = team_stats[3]
                puntos = team_stats[-1]

                if team_id == equipo_local_id:
                    puntos_local = puntos
                elif team_id == equipo_visitante_id:
                    puntos_visitante = puntos

            linea_sql = f"({equipo_local_id}, {equipo_visitante_id}, {puntos_local}, {puntos_visitante}, '{fecha}')"
            if not primera_linea:
                file2.write(",\n")
            file2.write(linea_sql)
            primera_linea = False

            print(f"Partido {game_id} agregado correctamente.")

        except Exception as e:
            print(f"Error al procesar datos del partido {game_id}: {e}")

        time.sleep(2)

    file2.write(";\n")

print(f"\nArchivo SQL generado: {output_sql_file}")