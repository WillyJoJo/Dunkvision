from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, mail

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
jwt.init_app(app)
mail.init_app(app)

from app import routes  # IMPORTAR AL FINAL SIEMPRE
