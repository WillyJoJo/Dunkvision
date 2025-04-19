# backend/run.py

from app import app, db
from flask.cli import AppGroup
import click
from app.scripts.entrenar_modelo import entrenar_y_guardar_modelo

# Comando personalizado con Flask CLI
train_cli = AppGroup("train")

@train_cli.command("model")
def train_model():
    """Entrena y guarda el modelo de predicción de partidos."""
    click.echo("Entrenando modelo de predicción...")
    entrenar_y_guardar_modelo()
    click.echo("✅ Modelo entrenado y guardado correctamente.")

# Registrar el grupo en la app
app.cli.add_command(train_cli)

if __name__ == '__main__':
    app.run(debug=True)