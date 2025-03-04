import requests
import time
import math

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
sql_file_path = "insert_jugador_partido.sql"

def convertir_minutos(minutos_str):
    """Convierte una cadena de minutos 'MM.SSSSSS:SS' en un valor entero de minutos.
    Si el jugador no jugó ('DNP - ...' o similar), devuelve 0."""
    if not minutos_str or "DNP" in minutos_str or "Did Not Dress" in minutos_str or "Inactive" in minutos_str:
        return 0  # Si el jugador no jugó, ponemos 0 minutos
    
    try:
        # Separar minutos y segundos
        partes = minutos_str.split(":")
        minutos = float(partes[0])  # Convertir a float para aceptar valores como "37.000000"
        segundos = int(partes[1]) if len(partes) > 1 else 0  # Si hay segundos, convertir a entero

        # Convertir a minutos enteros
        minutos_totales = math.floor(minutos) + (segundos / 60)

        return round(minutos_totales)  # Redondear a entero
    except ValueError:
        return 0  # Si hay algún otro valor inesperado, asumimos 0 minutos

# Definir manualmente el primer partido a consultar
start_id = 835  # Cambia este número según el partido desde donde quieras empezar

# Abrir el archivo para escribir las sentencias SQL
with open(sql_file_path, "w", encoding="utf-8") as file:
    file.write("INSERT INTO Jugador_Partido (jugador_id, enfrentamiento_id, minutos_jugados, puntos, asistencias, "
               "rebotes_ofensivos, rebotes_defensivos, robos, tapones, perdidas_balon, faltas_cometidas, faltas_recibidas, "
               "porcentaje_tiros_de_campo, porcentaje_triples, porcentaje_tiros_libres) VALUES\n")

    valores = []

    # Iterar sobre los siguientes 50 partidos desde el ID indicado
    for game_id in range(start_id, start_id + 1):  
        game_id_str = f"002240{game_id:04d}"  # Formato correcto del GameID

        print(f"Consultando partido: {game_id_str}")

        # Obtener los datos de la API
        response = requests.get(NBA_API_URL, headers=HEADERS, params={"GameID": game_id_str}, timeout=10)
        if response.status_code != 200:
            print(f"No se pudo obtener el partido {game_id_str}, código {response.status_code}")
            continue
        
        data = response.json()
        estadisticas_jugadores = data["resultSets"][0]["rowSet"]

        for stats in estadisticas_jugadores:
            game_id_api = stats[0]  # GAME_ID
            jugador_id = stats[4]  # PLAYER_ID
            minutos = stats[9]  # MIN (Formato "MM:SS")
            puntos = stats[27] or 0
            asistencias = stats[22] or 0
            rebotes_ofensivos = stats[19] or 0
            rebotes_defensivos = stats[20] or 0
            robos = stats[23] or 0
            tapones = stats[24] or 0
            perdidas_balon = stats[25] or 0
            faltas_cometidas = stats[26] or 0
            faltas_recibidas = 0  # No está en los datos, lo dejamos en 0
            porcentaje_tiros_de_campo = stats[12] or 0  # FG_PCT
            porcentaje_triples = stats[15] or 0  # FG3_PCT
            porcentaje_tiros_libres = stats[18] or 0  # FT_PCT

            # Convertir minutos "MM:SS" a enteros en minutos jugados
            minutos_jugados = convertir_minutos(minutos)

            # **Filtro: NO incluir jugadores que NO JUGARON (0 minutos)**
            if minutos_jugados == 0:
                print(f"Jugador {jugador_id} estuvo convocado pero no jugó en {game_id_str}, omitiendo...")
                continue  

            # Crear la línea SQL para este jugador en este partido
            valores.append(f"({jugador_id}, {game_id_str}, {minutos_jugados}, {puntos}, {asistencias}, "
                           f"{rebotes_ofensivos}, {rebotes_defensivos}, {robos}, {tapones}, {perdidas_balon}, "
                           f"{faltas_cometidas}, {faltas_recibidas}, {porcentaje_tiros_de_campo}, {porcentaje_triples}, "
                           f"{porcentaje_tiros_libres})")

    file.write(",\n".join(valores) + ";\n")

print(f"\nScript SQL generado correctamente en: {sql_file_path}")
