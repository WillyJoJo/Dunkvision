from nba_api.stats.static import teams
from app import db
from app.models import Equipo, Enfrentamiento, Historial_Enfrentamientos
from sqlalchemy.sql import func, case


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

# ACTUALIZAR HISTORIAL ENFRENTAMIENTOS ENTRE EQUIPOS
def actualizar_historial():
    """Actualiza la tabla Historial_Enfrentamientos con el número de victorias entre equipos."""

    # Consulta para contar todas las victorias acumuladas entre cada par de equipos
    resultados = db.session.query(
        func.least(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id).label("equipo1_id"),
        func.greatest(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id).label("equipo2_id"),
        func.sum(
            case(
                (Enfrentamiento.equipo1_id < Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo1 > Enfrentamiento.puntos_equipo2),
                (Enfrentamiento.equipo1_id > Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo2 > Enfrentamiento.puntos_equipo1),
                else_=0
            )
        ).label("victorias_equipo1"),
        func.sum(
            case(
                (Enfrentamiento.equipo1_id < Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo2 > Enfrentamiento.puntos_equipo1),
                (Enfrentamiento.equipo1_id > Enfrentamiento.equipo2_id, 
                 Enfrentamiento.puntos_equipo1 > Enfrentamiento.puntos_equipo2),
                else_=0
            )
        ).label("victorias_equipo2")
    ).group_by(
        func.least(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id),
        func.greatest(Enfrentamiento.equipo1_id, Enfrentamiento.equipo2_id)
    ).all()

    # Insertar o actualizar en Historial_Enfrentamientos
    for equipo1_id, equipo2_id, victorias1, victorias2 in resultados:
        historial = db.session.query(Historial_Enfrentamientos).filter_by(
            equipo1_id=equipo1_id, equipo2_id=equipo2_id
        ).first()

        if historial:
            historial.victorias_equipo1 = victorias1
            historial.victorias_equipo2 = victorias2
        else:
            nuevo_historial = Historial_Enfrentamientos(
                equipo1_id=equipo1_id,
                equipo2_id=equipo2_id,
                victorias_equipo1=victorias1,
                victorias_equipo2=victorias2
            )
            db.session.add(nuevo_historial)

    # Confirmar los cambios en la base de datos
    db.session.commit()
    print("✅ Historial de enfrentamientos actualizado correctamente.")