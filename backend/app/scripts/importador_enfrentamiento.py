import requests
import json
import time

# Configuración de la API de la NBA
NBA_API_URL = "https://stats.nba.com/stats/boxscoresummaryv2"

HEADERS = {
    "Host": "stats.nba.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.nba.com/",
    "Connection": "keep-alive"
}

# Configuración de IDs de partido
start_id = 831  # Partido de la temporada por el que empieza a buscar
max_games = 9  # Cantidad de partidos a buscar
output_sql_file = "insert_partidos.sql"

# Abrir archivo para escribir los INSERT
with open(output_sql_file, "w", encoding="utf-8") as file2:
    file2.write("INSERT INTO Enfrentamiento (equipo1_id, equipo2_id, puntos_equipo1, puntos_equipo2, fecha) VALUES\n")

    valores = []

    for i in range(max_games):
        game_id = f"002240{start_id + i:04d}"  # Asegura que sean 4 dígitos correctamente
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
            line_score = data["resultSets"][5]["rowSet"]  # LineScore

            fecha = game_summary[0].split("T")[0]  # Extraer solo la parte de la fecha (YYYY-MM-DD)
            equipo_local_id = game_summary[6]
            equipo_visitante_id = game_summary[7]

            # Buscar los puntos asegurando que se asignen al equipo correcto
            puntos_local = "NULL"
            puntos_visitante = "NULL"

            for team_stats in line_score:
                team_id = team_stats[3]  # ID del equipo en LineScore
                puntos = team_stats[-1]  # Última columna es el puntaje total del equipo

                if team_id == equipo_local_id:
                    puntos_local = puntos
                elif team_id == equipo_visitante_id:
                    puntos_visitante = puntos

            # Crear la línea de inserción con NULL en caso de que no haya puntos
            valores.append(f"({equipo_local_id}, {equipo_visitante_id}, {puntos_local}, {puntos_visitante}, '{fecha}')")

            print(f"Partido {game_id} agregado correctamente.")

        except Exception as e:
            print(f"Error al procesar {game_id}: {e}")

        time.sleep(1)  # Evita bloqueos por exceso de peticiones

    # Guardar los valores en el archivo SQL
    if valores:
        file2.write(",\n".join(valores) + ";\n")

print(f"\nArchivo SQL generado: {output_sql_file}")
