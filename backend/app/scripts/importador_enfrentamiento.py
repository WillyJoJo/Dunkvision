import requests
import time
import configparser

# 1) Cargamos el archivo config.ini
config = configparser.ConfigParser()
config.read("config.ini") 

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

    valores = []

    for i in range(max_games):
        # Usamos el prefijo definido en el .ini
        game_id = f"{competicion}{temporada}{start_id + i:05d}"
        params = {"GameID": game_id}

        print(f"Consultando partido: {game_id}")

        try:
            response = requests.get(NBA_API_URL, headers=HEADERS, params=params)
            if response.status_code != 200:
                print(f"No se pudo obtener el partido {game_id} (Código {response.status_code})")
                continue

            data = response.json()

            # Extraer datos esenciales
            game_summary = data["resultSets"][0]["rowSet"][0]  # GameSummary
            line_score = data["resultSets"][5]["rowSet"]       # LineScore

            fecha = game_summary[0].split("T")[0]  # Extraer solo la parte de la fecha (YYYY-MM-DD)
            equipo_local_id = game_summary[6]
            equipo_visitante_id = game_summary[7]

            puntos_local = "NULL"
            puntos_visitante = "NULL"

            for team_stats in line_score:
                team_id = team_stats[3]  # ID del equipo
                puntos = team_stats[-1]  # Última columna: puntuación total

                if team_id == equipo_local_id:
                    puntos_local = puntos
                elif team_id == equipo_visitante_id:
                    puntos_visitante = puntos

            valores.append(f"({equipo_local_id}, {equipo_visitante_id}, {puntos_local}, {puntos_visitante}, '{fecha}')")

            print(f"Partido {game_id} agregado correctamente.")

        except Exception as e:
            print(f"Error al procesar {game_id}: {e}")

        time.sleep(1)  # Evita bloqueos por exceso de peticiones

    # Guardar los valores en el archivo SQL
    if valores:
        file2.write(",\n".join(valores) + ";\n")

print(f"\nArchivo SQL generado: {output_sql_file}")
