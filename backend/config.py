# config.py
import os
from dotenv import load_dotenv
import sys

# Load environment variables from .env file
load_dotenv()

class Config:
    # Validate required environment variables
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

    if not all([DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET_KEY]):
        sys.exit("Error: Missing required environment variables (DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET_KEY)")

    # Construct the database URI
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Validate JWT secret key strength
    if len(JWT_SECRET_KEY) < 32:
        sys.exit("Error: JWT_SECRET_KEY must be at least 32 characters long for security.")
