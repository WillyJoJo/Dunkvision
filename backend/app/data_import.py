from nba_api.stats.static import teams
from app import db
from app.models import Equipo

# IMPORTAR EQUIPOS DE LA NBA
def importar_equipos_nba():
    """Importa equipos de la NBA a la base de datos."""
    # Obtener los equipos de la NBA
    equipos_nba = teams.get_teams()

    # Iterar sobre los equipos y agregarlos a la base de datos
    for equipo in equipos_nba:
        id_equipo = equipo['id']
        nombre_equipo = equipo['full_name']

        # Verificar si el equipo ya existe en la base de datos
        if not Equipo.query.filter_by(id_equipo=id_equipo).first():
            nuevo_equipo = Equipo(id_equipo=id_equipo, nombre=nombre_equipo)
            db.session.add(nuevo_equipo)
    
    # Confirmar los cambios en la base de datos
    db.session.commit()
