from app.models import Temporada

def listar_temporadas():
    temporadas = Temporada.query.all()
    resultado = [
        {"id": t.id_temporada, "nombre": t.nombre_temporada}
        for t in temporadas
    ]
    return resultado, 200