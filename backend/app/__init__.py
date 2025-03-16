from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

app = Flask(__name__)

# Esto habilita CORS en todas las rutas de la aplicación
CORS(app) 

# Configuración de MySQL
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Dunkvision1333@localhost:3306/dunkvision'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'Dunkvision1333'

jwt = JWTManager(app)

db = SQLAlchemy(app)

from app import routes  ## NO TOCAR, MUY IMPORTANTE
