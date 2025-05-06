from flask import Flask
from flask_cors import CORS
from config import Config
from app.extensions import db, jwt, mail, init_serializer

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)
jwt.init_app(app)
mail.init_app(app)

# ✅ Inicializar serializer correctamente
init_serializer(app)

# Registro de Blueprints
from app.jugador.routes import jugador_bp
from app.equipo.routes import equipo_bp
from app.estadisticas_avanzadas_jugador.routes import estadisticas_bp
from app.auth.routes import auth_bp
from app.lesiones_jugador.routes import lesiones_bp
from app.enfrentamiento.routes import enfrentamientos_bp
from app.jugador_partido.routes import jugador_partido_bp

app.register_blueprint(jugador_bp)
app.register_blueprint(equipo_bp)
app.register_blueprint(estadisticas_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(lesiones_bp)
app.register_blueprint(enfrentamientos_bp)
app.register_blueprint(jugador_partido_bp)

from app import routes  # solo si tienes rutas aún sin modular
