# config.py
import os
from dotenv import load_dotenv
import sys

# Load environment variables from .env file
load_dotenv()

class Config:
    # Database
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME')

    # Seguridad
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    SECRET_KEY = os.getenv('SECRET_KEY') or JWT_SECRET_KEY  # Reutilizas una u otra

    # Validaciones
    if not all([DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET_KEY]):
        sys.exit("Error: Missing required environment variables (DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET_KEY)")

    if len(JWT_SECRET_KEY) < 32:
        sys.exit("Error: JWT_SECRET_KEY must be at least 32 characters long for security.")

    # SQLAlchemy
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Flask-Mail
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

    if not all([MAIL_USERNAME, MAIL_PASSWORD]):
        sys.exit("Error: Missing email credentials (MAIL_USERNAME, MAIL_PASSWORD)")

    # Frontend URL for password reset links
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
