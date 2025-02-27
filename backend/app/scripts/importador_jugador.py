import requests
import time

# Configuración de la API de la NBA
NBA_API_URL = "https://stats.nba.com/stats/boxscoretraditionalv2"

HEADERS = {
    "Host": "stats.nba.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://www.nba.com/",
    "Connection": "keep-alive"
}

# Archivo donde guardaremos el script SQL
sql_file_path = "insert_jugadores.sql"

# **IMPORTANTE**: Empezamos desde el último partido hacia el primero para obtener el equipo más reciente del jugador
start_id = 835  # Último partido
end_id = 61  # Primer partido

# Conjunto para evitar insertar jugadores duplicados en este script
jugadores_insertados = set()

# Abrir el archivo SQL
with open(sql_file_path, "w", encoding="utf-8") as file:
    file.write("INSERT INTO Jugador (id_jugador, nombre, equipo_id, posicion) VALUES\n")

    valores = []

    for game_id in range(start_id, end_id - 1, -1):  # Recorremos en orden descendente
        game_id_str = f"002240{game_id:04d}"  
        print(f"📊 Consultando partido: {game_id_str}")

        response = requests.get(NBA_API_URL, headers=HEADERS, params={"GameID": game_id_str}, timeout=10)
        if response.status_code != 200:
            print(f"⚠️ No se pudo obtener el partido {game_id_str}")
            continue
        
        data = response.json()
        estadisticas_jugadores = data["resultSets"][0]["rowSet"]

        for stats in estadisticas_jugadores:
            jugador_id = stats[4]  
            nombre = stats[5].replace("'", "''")  # Escapar apóstrofes para SQL
            equipo_id = stats[1]  
            posicion = stats[7] or "N/A"  # Si no hay posición, poner "N/A"

            # 🚨 **Evitar jugadores duplicados en este script**
            if jugador_id in jugadores_insertados:
                continue  
            
            jugadores_insertados.add(jugador_id)

            # Crear la línea SQL para guardar el insert
            valores.append(f"({jugador_id}, '{nombre}', {equipo_id}, '{posicion}')")

    # Guardar en el archivo SQL
    if valores:
        file.write(",\n".join(valores) + ";\n")

print(f"\n✅ Script SQL generado correctamente en: {sql_file_path}")
