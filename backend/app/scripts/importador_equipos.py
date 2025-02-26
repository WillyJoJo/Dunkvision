import json

# Mapeo completo de los equipos con sus IDs
equipos_ids = {
    "Atlanta Hawks": 1610612737,
    "Boston Celtics": 1610612738,
    "Brooklyn Nets": 1610612751,
    "Charlotte Hornets": 1610612766,
    "Chicago Bulls": 1610612741,
    "Cleveland Cavaliers": 1610612739,
    "Dallas Mavericks": 1610612742,
    "Denver Nuggets": 1610612743,
    "Detroit Pistons": 1610612765,
    "Golden State Warriors": 1610612744,
    "Houston Rockets": 1610612745,
    "Indiana Pacers": 1610612754,
    "LA Clippers": 1610612746,
    "Los Angeles Lakers": 1610612747,
    "Memphis Grizzlies": 1610612763,
    "Miami Heat": 1610612748,
    "Milwaukee Bucks": 1610612749,
    "Minnesota Timberwolves": 1610612750,
    "New Orleans Pelicans": 1610612740,
    "New York Knicks": 1610612752,
    "Oklahoma City Thunder": 1610612760,
    "Orlando Magic": 1610612753,
    "Philadelphia 76ers": 1610612755,
    "Phoenix Suns": 1610612756,
    "Portland Trail Blazers": 1610612757,
    "Sacramento Kings": 1610612758,
    "San Antonio Spurs": 1610612759,
    "Toronto Raptors": 1610612761,
    "Utah Jazz": 1610612762,
    "Washington Wizards": 1610612764
}


# Leer el archivo JSON con los partidos
with open('partidos.json', 'r', encoding='utf-8') as file:
    with open('partidos_insert.sql', 'w', encoding='utf-8') as file2:
        data = file.read()
        json_data = json.loads(data)

        file2.write("INSERT INTO Enfrentamiento (equipo1_id, equipo2_id, puntos_equipo1, puntos_equipo2, fecha) VALUES \n")

        valores = []

        for partido in json_data:
            equipo1 = equipos_ids.get(partido["HomeTeam"])
            equipo2 = equipos_ids.get(partido["AwayTeam"])

            if equipo1 is None or equipo2 is None:
                continue  # Saltamos si falta algún equipo en el diccionario
            
            puntos1 = partido["HomeTeamScore"]
            puntos2 = partido["AwayTeamScore"]
            fecha = partido["DateUtc"].replace("Z", "")  # Removemos la 'Z' de la fecha

            valores.append(f"({equipo1}, {equipo2}, {puntos1}, {puntos2}, '{fecha}')")

        file2.write(",\n".join(valores) + ";\n")

    print("Archivo partidos_insert.sql creado con éxito")
