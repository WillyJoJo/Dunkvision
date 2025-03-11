import ast

def extraer_ids(archivo):
    """
    Lee un archivo línea por línea, evaluando cada línea como una tupla
    y extrayendo el primer elemento (id).
    Devuelve un conjunto con los ids.
    """
    ids = set()
    with open(archivo, "r", encoding="utf-8") as f:
        for linea in f:
            linea = linea.strip().rstrip(',')
            if not linea:
                continue
            try:
                # Evalúa la línea de forma segura para obtener la tupla
                tupla = ast.literal_eval(linea)
                # Se asume que la tupla tiene al menos un elemento, que es el id
                if isinstance(tupla, tuple) and len(tupla) >= 1:
                    ids.add(tupla[0])
            except Exception as e:
                print(f"Error evaluando la línea: {linea}\n{e}")
    return ids

# Extraer los ids de ambos archivos
ids_insert = extraer_ids("insert_jugadores.txt")
ids_lista  = extraer_ids("lista_jugador.txt")

# Calcular los ids que están en insert_jugadores pero no en lista_jugador
ids_faltantes = ids_insert - ids_lista

# Imprimir los ids faltantes
print("IDs que faltan en 'lista_jugador.txt':")
for id in sorted(ids_faltantes):
    print(id)
