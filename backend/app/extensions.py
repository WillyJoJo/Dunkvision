from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from itsdangerous import URLSafeTimedSerializer

serializer = None

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()

def init_serializer(app):
    global serializer
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])