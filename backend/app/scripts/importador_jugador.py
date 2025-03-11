import requests
import configparser

# 1) Cargamos el archivo config.ini
config = configparser.ConfigParser()
config.read("config.ini") 

# 2) Leemos las secciones
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
output_sql_file = config["SQL_CONFIG"]["ficherosql_jugador"]

# Conjunto para evitar insertar jugadores duplicados en este script
jugadores_insertados = set()

# Abrir el archivo SQL
with open(output_sql_file, "w", encoding="utf-8") as file:
    file.write("INSERT INTO Jugador (id_jugador, nombre, equipo_id, posicion) VALUES\n")

    valores = []

    for game_id in range(last_id, start_id - 1, -1):  # Recorremos en orden descendente
        game_id_str = f"{competicion}{temporada}{game_id:05d}"  
        print(f"Consultando partido: {game_id_str}")

        response = requests.get(NBA_API_URL, headers=HEADERS, params={"GameID": game_id_str}, timeout=10)
        if response.status_code != 200:
            print(f"No se pudo obtener el partido {game_id_str}")
            continue
        
        data = response.json()
        estadisticas_jugadores = data["resultSets"][0]["rowSet"]

        for stats in estadisticas_jugadores:
            jugador_id = stats[4]  
            nombre = stats[5].replace("'", "''")  # Escapar apóstrofes para SQL
            equipo_id = stats[1]  
            posicion = stats[7] or "N/A"  # Si no hay posición, poner "N/A"

            # Evitar jugadores duplicados en este script
            if jugador_id in jugadores_insertados:
                continue  
            
            jugadores_insertados.add(jugador_id)

            # Crear la línea SQL para guardar el insert
            valores.append(f"({jugador_id}, '{nombre}', {equipo_id}, '{posicion}')")

    # Guardar en el archivo SQL
    if valores:
        file.write(",\n".join(valores) + ";\n")

print(f"\nScript SQL generado correctamente en: {output_sql_file}")
