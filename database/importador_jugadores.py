import json
with open('historic.json', 'r', encoding='utf-8') as file:
    with open ('players.sql','w',encoding='utf-8') as file2:
        data = file.read()
        json_data = json.loads(data)
        datos = json_data['resultSets'][0]['rowSet']
        file2.write("INSERT INTO players (player_id,player_name,team_id,team_name) VALUES ")

        for player in datos:
            if player[-1] != "2024":
                continue
            player_id = player[0]
            player_name = str(player[2] + " " + player[1]).replace("'","")
            team_id = player[4]
            position = player[11]
            file2.write(f"({player_id},'{player_name}',{team_id},'{position}'),\n")
        
    print("Archivo players.sql creado con éxito")
    

