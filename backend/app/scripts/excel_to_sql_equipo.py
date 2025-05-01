import os
import configparser
import pandas as pd
from pathlib import Path

def sql_value(val):
    """
    Convierte el valor en una cadena válida para SQL:
    - Si val es NaN o None, devuelve 'null'.
    - Si es cadena, la devuelve entre comillas simples, escapando apóstrofes.
    - En caso contrario, la convierte directamente a cadena.
    """
    if pd.isna(val) or val is None:
        return "null"
    elif isinstance(val, str):
        # Escapa apóstrofes y envuelve la cadena en comillas simples
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    else:
        return str(val)

def excel_to_sql_equipos(
    input_excel_file,
    output_sql_file,
    sheet_name=0,
    table_name="Estadisticas_Avanzadas_Equipo"
):
    """
    Lee un Excel con columnas (equipo_id, puntos, asistencias, ..., derrotas),
    toma temporada_id de config.ini, y genera un archivo .sql con una
    sola sentencia INSERT para la tabla Estadisticas_Avanzadas_Equipo.
    """
    # 1. Cargar config.ini para obtener temporada_id
    config = configparser.ConfigParser()
    config_file = os.path.join(os.path.dirname(__file__), "config.ini")
    if not os.path.exists(config_file):
        raise FileNotFoundError(f"El archivo config.ini no se encontró en: {config_file}")
    config.read(config_file)
    if "GAME_CONFIG" not in config:
        raise KeyError("La sección 'GAME_CONFIG' no se encontró en config.ini.")
    temporada_id = config["GAME_CONFIG"]["temporada"]

    # 2. Leer el Excel
    df = pd.read_excel(input_excel_file, sheet_name=sheet_name)

    # 3. Preparar las columnas que vamos a insertar (en el orden deseado)
    columns_str = (
        "equipo_id, temporada_id, puntos, asistencias, rebotes_ofensivos, rebotes_defensivos, "
        "rebotes_totales, robos, tapones, perdidas_balon, faltas_cometidas, "
        "tiros_de_campo_intentados, porcentaje_tiros_de_campo, triples_intentados, porcentaje_triples, "
        "tiros_de_dos_intentados, porcentaje_tiros_de_dos, porcentaje_efectivo_tiros_de_campo, "
        "tiros_libres_intentados, porcentaje_tiros_libres, rating_ofensivo, rating_defensivo, "
        "strength_of_schedule, simple_rating_system, ritmo, margen_de_victoria, victorias, derrotas"
    )

    # 4. Recorrer cada fila y construir la parte VALUES
    value_rows = []
    for index, row in df.iterrows():
        # Convertir cada campo a string SQL (reemplazando NaN por null)
        equipo_id = sql_value(row["equipo_id"])
        puntos = sql_value(row["puntos"])
        asistencias = sql_value(row["asistencias"])
        reb_of = sql_value(row["rebotes_ofensivos"])
        reb_def = sql_value(row["rebotes_defensivos"])
        reb_tot = sql_value(row["rebotes_totales"])
        robos = sql_value(row["robos"])
        tapones = sql_value(row["tapones"])
        perdidas = sql_value(row["perdidas_balon"])
        faltas = sql_value(row["faltas_cometidas"])
        tiros_campo_int = sql_value(row["tiros_de_campo_intentados"])
        pct_tiros_campo = sql_value(row["porcentaje_tiros_de_campo"])
        triples_int = sql_value(row["triples_intentados"])
        pct_triples = sql_value(row["porcentaje_triples"])
        tiros_dos_int = sql_value(row["tiros_de_dos_intentados"])
        pct_tiros_dos = sql_value(row["porcentaje_tiros_de_dos"])
        pct_efectivo = sql_value(row["porcentaje_efectivo_tiros_de_campo"])
        tiros_libres_int = sql_value(row["tiros_libres_intentados"])
        pct_tiros_libres = sql_value(row["porcentaje_tiros_libres"])
        rating_of = sql_value(row["rating_ofensivo"])
        rating_def = sql_value(row["rating_defensivo"])
        strength_of_schedule = sql_value(row["strength_of_schedule"])
        simple_rating_system = sql_value(row["simple_rating_system"])
        ritmo = sql_value(row["ritmo"])
        margen_victoria = sql_value(row["margen_de_victoria"])
        victorias = sql_value(row["victorias"])
        derrotas = sql_value(row["derrotas"])

        # Construir la tupla de valores
        value_str = (
            f"({equipo_id}, {temporada_id}, {puntos}, {asistencias}, {reb_of}, {reb_def}, "
            f"{reb_tot}, {robos}, {tapones}, {perdidas}, {faltas}, {tiros_campo_int}, {pct_tiros_campo}, "
            f"{triples_int}, {pct_triples}, {tiros_dos_int}, {pct_tiros_dos}, {pct_efectivo}, "
            f"{tiros_libres_int}, {pct_tiros_libres}, {rating_of}, {rating_def}, {strength_of_schedule}, "
            f"{simple_rating_system}, {ritmo}, {margen_victoria}, {victorias}, {derrotas})"
        )
        value_rows.append(value_str)

    # 5. Crear la sentencia INSERT completa
    full_insert = (
        f"INSERT INTO {table_name} ({columns_str}) VALUES\n" +
        ",\n".join(value_rows) +
        ";"
    )

    # 6. Guardar en un archivo .sql
    with open(output_sql_file, "w", encoding="utf-8") as sql_file:
        sql_file.write(full_insert)

    print(f"Archivo SQL generado correctamente en: {output_sql_file}")

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent  # scripts/
    input_excel = (base_dir / "../../../docs/estadisticas_equipo.xlsx").resolve()
    output_sql = (base_dir / "../sql/lista_estadisticas_avanzadas_equipo.sql").resolve()

    excel_to_sql_equipos(input_excel, output_sql)
