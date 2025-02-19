from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Esto habilita CORS en todas las rutas de la aplicación
CORS(app) 

# Configuración de MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Dunkvision1333@localhost:3306/dunkvision'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

from app import routes
