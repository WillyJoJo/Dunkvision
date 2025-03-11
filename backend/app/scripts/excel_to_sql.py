import os
import configparser
import pandas as pd
from app import app, db
from app.models import Jugador

# Cargar la configuración desde config.ini
config = configparser.ConfigParser()
config_file = os.path.join(os.path.dirname(__file__), "config.ini")
if not os.path.exists(config_file):
    raise FileNotFoundError(f"El archivo config.ini no se encontró en: {config_file}")
config.read(config_file)
if "GAME_CONFIG" not in config:
    raise KeyError("La sección 'GAME_CONFIG' no se encontró en config.ini. Por favor, agrégala.")

def sql_value(val):
    """
    Devuelve 'null' si el valor es NaN o None; 
    si es una cadena, la devuelve entre comillas simples escapando apóstrofes;
    en otro caso, devuelve la representación en cadena del valor.
    """
    if pd.isna(val) or val is None:
        return "null"
    elif isinstance(val, str):
        # Escapa apóstrofes y envuelve la cadena en comillas simples
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    else:
        return str(val)

def excel_to_sql(
    input_excel_file,
    output_sql_file,
    sheet_name=0,
    table_name="Estadisticas_Avanzadas_Jugador"
):
    """
    Lee un archivo Excel con estadísticas de jugador (incluyendo la columna 'nombre'),
    busca en la tabla Jugador el id_jugador correspondiente y genera un archivo .sql
    con una única sentencia INSERT que contenga todas las filas, usando el valor de
    temporada_id definido en config.ini. Se sustituyen los valores vacíos por null.
    """
    with app.app_context():
        # Crea el diccionario nombre -> id_jugador
        jugadores = Jugador.query.all()
        nombre_id_map = {jugador.nombre.strip().lower(): jugador.id_jugador for jugador in jugadores}

        # Lee el Excel
        df = pd.read_excel(input_excel_file, sheet_name=sheet_name)

        # Lista para acumular cada grupo de valores
        value_rows = []
        for index, row in df.iterrows():
            # Comprobar si el valor en 'nombre' es nulo (NaN)
            if pd.isna(row["nombre"]):
                print(f"Advertencia: fila {index} omitida, valor 'nombre' no definido.")
                continue

            # Normaliza el nombre para la búsqueda
            nombre_excel = str(row["nombre"]).strip()
            nombre_normalizado = nombre_excel.replace("'", "''").lower()

            # Busca el id_jugador
            id_jugador = nombre_id_map.get(nombre_normalizado)
            if id_jugador is None:
                raise ValueError(f"No se encontró en la tabla Jugador el registro con nombre = '{nombre_excel}'")

            # Obtiene el valor de temporada_id desde el config
            temporada_id = config["GAME_CONFIG"]["temporada"]

            # Extrae las demás columnas aplicando sql_value para reemplazar NaN por null
            partidos_jugados = sql_value(row["partidos_jugados"])
            minutos_jugados = sql_value(row["minutos_jugados"])
            puntos = sql_value(row["puntos"])
            asistencias = sql_value(row["asistencias"])
            rebotes_ofensivos = sql_value(row["rebotes_ofensivos"])
            rebotes_defensivos = sql_value(row["rebotes_defensivos"])
            rebotes_totales = sql_value(row["rebotes_totales"])
            robos = sql_value(row["robos"])
            tapones = sql_value(row["tapones"])
            perdidas_balon = sql_value(row["perdidas_balon"])
            faltas_cometidas = sql_value(row["faltas_cometidas"])
            tiros_de_campo_intentados = sql_value(row["tiros_de_campo_intentados"])
            porcentaje_tiros_de_campo = sql_value(row["porcentaje_tiros_de_campo"])
            triples_intentados = sql_value(row["triples_intentados"])
            porcentaje_triples = sql_value(row["porcentaje_triples"])
            tiros_de_dos_intentados = sql_value(row["tiros_de_dos_intentados"])
            porcentaje_tiros_de_dos = sql_value(row["porcentaje_tiros_de_dos"])
            porcentaje_efectivo_tiros_de_campo = sql_value(row["porcentaje_efectivo_tiros_de_campo"])
            tiros_libres_intentados = sql_value(row["tiros_libres_intentados"])
            porcentaje_tiros_libres = sql_value(row["porcentaje_tiros_libres"])
            rating_ofensivo = sql_value(row["rating_ofensivo"])
            rating_defensivo = sql_value(row["rating_defensivo"])
            player_efficiency_rating = sql_value(row["player_efficiency_rating"])
            usage_porcentage = sql_value(row["usage_porcentage"])
            win_share_ofensivo = sql_value(row["win_share_ofensivo"])
            win_share_defensivo = sql_value(row["win_share_defensivo"])
            win_share_total = sql_value(row["win_share_total"])
            box_plus_minus = sql_value(row["box_plus_minus"])

            # Construye el grupo de valores para esta fila, incluyendo temporada_id
            value_str = (
                f"({id_jugador}, {temporada_id}, {partidos_jugados}, {minutos_jugados}, {puntos}, {asistencias}, "
                f"{rebotes_ofensivos}, {rebotes_defensivos}, {rebotes_totales}, {robos}, {tapones}, "
                f"{perdidas_balon}, {faltas_cometidas}, {tiros_de_campo_intentados}, {porcentaje_tiros_de_campo}, "
                f"{triples_intentados}, {porcentaje_triples}, {tiros_de_dos_intentados}, {porcentaje_tiros_de_dos}, "
                f"{porcentaje_efectivo_tiros_de_campo}, {tiros_libres_intentados}, {porcentaje_tiros_libres}, "
                f"{rating_ofensivo}, {rating_defensivo}, {player_efficiency_rating}, {usage_porcentage}, "
                f"{win_share_ofensivo}, {win_share_defensivo}, {win_share_total}, {box_plus_minus})"
            )
            value_rows.append(value_str)

        # Cadena con la lista de columnas, incluyendo temporada_id
        columns_str = (
            "jugador_id, temporada_id, partidos_jugados, minutos_jugados, puntos, asistencias, "
            "rebotes_ofensivos, rebotes_defensivos, rebotes_totales, robos, tapones, "
            "perdidas_balon, faltas_cometidas, tiros_de_campo_intentados, porcentaje_tiros_de_campo, "
            "triples_intentados, porcentaje_triples, tiros_de_dos_intentados, porcentaje_tiros_de_dos, "
            "porcentaje_efectivo_tiros_de_campo, tiros_libres_intentados, porcentaje_tiros_libres, "
            "rating_ofensivo, rating_defensivo, player_efficiency_rating, usage_porcentage, "
            "win_share_ofensivo, win_share_defensivo, win_share_total, box_plus_minus"
        )
        full_insert = f"INSERT INTO {table_name} ({columns_str}) VALUES\n" + ",\n".join(value_rows) + ";"

        with open(output_sql_file, "w", encoding="utf-8") as sql_file:
            sql_file.write(full_insert)

    print(f"Archivo SQL generado correctamente en: {output_sql_file}")

if __name__ == "__main__":
    input_excel = r"C:\Dunkvision\docs\estadisticas_jugador.xlsx"
    output_sql = r"C:\Dunkvision\backend\app\sql\lista_estadisticas_avanzadas_jugador.sql"
    excel_to_sql(input_excel, output_sql)
