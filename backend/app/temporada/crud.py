from app import db
from app.models import Temporada
from datetime import date

def listar_temporadas():
    temporadas = Temporada.query.all()
    resultado = [
        {"id": t.id_temporada, "nombre": t.nombre_temporada}
        for t in temporadas
    ]
    return resultado, 200

def crear_temporada_si_no_existe():
    hoy = date.today()
    
    # Si estamos en julio o más adelante
    if hoy.month >= 7:
        id_temporada = hoy.year - 2000  # Ej: 2025 -> id 25
        nombre_temporada = f"{hoy.year % 100}/{(hoy.year + 1) % 100}"  # "25/26"

        # Buscar si ya existe
        existente = Temporada.query.filter_by(id_temporada=id_temporada).first()
        if not existente:
            nueva = Temporada(id_temporada=id_temporada, nombre_temporada=nombre_temporada)
            db.session.add(nueva)
            db.session.commit()
            return {"mensaje": "Temporada creada", "temporada": nombre_temporada}, 201
        else:
            return {"mensaje": "Ya existe la temporada actual"}, 200
    else:
        return {"mensaje": "No es necesario crear temporada aún"}, 200