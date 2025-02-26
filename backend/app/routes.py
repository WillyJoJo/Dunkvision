import requests
from app import app
from app import db  #Importante importar la base de datos
from flask import jsonify
from app.models import Equipo
from flask import request, jsonify
from .data_import import importar_equipos_nba

# Ruta por defecto que devuelve 'Hello World'
@app.route('/')
def hello_world():
    return "¡Bienvenido a DUNKVISION!"

@app.route('/api/importar_equipos', methods=['POST'])
def importar_equipos():
    importar_equipos_nba()
    return jsonify({'message': 'Equipos importados exitosamente!'}), 200

@app.route('/api/nba/stats_partido', methods=['GET'])
def obtener_stats_partido_nba():
    game_id = "0022400820"  # TIMBERWOLVES VS. THUNDER 2025-02-23
    url = "https://stats.nba.com/stats/boxscoretraditionalv2"
    params = {
        "GameID": game_id,
        "StartPeriod": 1,
        "EndPeriod": 10,
        "StartRange": 0,
        "EndRange": 55800,
        "RangeType": 2
    }
    
    headers = {
        "Host": "stats.nba.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.nba.com/",
        "Connection": "keep-alive"
    }

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({'error': 'No se pudieron obtener los datos de la NBA'}), response.status_code
    
@app.route('/api/nba/stats_resumen_partido', methods=['GET'])
def obtener_resumen_partido_nba():
    game_id = "0022400809"  # KNICKS VS. BOSTON 2024-10-22 PRIMER PARTIDO DE LA TEMPORADA
    url = "https://stats.nba.com/stats/boxscoresummaryv2"
    params = {
        "GameID": game_id
    }
    
    headers = {
        "Host": "stats.nba.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://www.nba.com/",
        "Connection": "keep-alive"
    }

    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        return jsonify(response.json()), 200
    else:
        return jsonify({'error': 'No se pudieron obtener los datos de la NBA'}), response.status_code
