from app import db

class Equipo(db.Model):
    __tablename__ = 'Equipo'  # Nombre de la tabla en la base de datos
    id_equipo = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    jugadores = db.relationship('Jugador', backref='equipo', lazy=True)
    enfrentamientos1 = db.relationship('Enfrentamiento', backref='equipo1', foreign_keys='Enfrentamiento.equipo1_id')
    enfrentamientos2 = db.relationship('Enfrentamiento', backref='equipo2', foreign_keys='Enfrentamiento.equipo2_id')
    historial_enfrentamientos1 = db.relationship('Historial_Enfrentamientos', backref='equipo1_historial', foreign_keys='Historial_Enfrentamientos.equipo1_id')
    historial_enfrentamientos2 = db.relationship('Historial_Enfrentamientos', backref='equipo2_historial', foreign_keys='Historial_Enfrentamientos.equipo2_id')


class Jugador(db.Model):
    __tablename__ = 'Jugador'  # Nombre de la tabla en la base de datos
    id_jugador = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    equipo_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    posicion = db.Column(db.String(50), nullable=False)
    partidos = db.relationship('Jugador_Partido', backref='jugador', lazy=True)
    lesiones = db.relationship('Lesiones_Jugador', backref='jugador', lazy=True)


class Enfrentamiento(db.Model):
    __tablename__ = 'Enfrentamiento'  # Nombre de la tabla en la base de datos
    id_enfrentamiento = db.Column(db.Integer, primary_key=True)
    equipo1_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    equipo2_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    puntos_equipo1 = db.Column(db.Integer)
    puntos_equipo2 = db.Column(db.Integer)
    fecha = db.Column(db.Date)
    jugadores_partido = db.relationship('Jugador_Partido', backref='enfrentamiento', lazy=True)
    contexto = db.relationship('Contexto_Partido', backref='enfrentamiento', lazy=True)


class Jugador_Partido(db.Model):
    __tablename__ = 'Jugador_Partido'  # Nombre de la tabla en la base de datos
    id_jugador_partido = db.Column(db.Integer, primary_key=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey('Jugador.id_jugador'))
    enfrentamiento_id = db.Column(db.Integer, db.ForeignKey('Enfrentamiento.id_enfrentamiento'))
    minutos_jugados = db.Column(db.Integer)
    puntos = db.Column(db.Integer)
    asistencias = db.Column(db.Integer)
    rebotes_ofensivos = db.Column(db.Integer)
    rebotes_defensivos = db.Column(db.Integer)
    robos = db.Column(db.Integer)
    tapones = db.Column(db.Integer)
    perdidas_balon = db.Column(db.Integer)
    faltas_cometidas = db.Column(db.Integer)
    faltas_recibidas = db.Column(db.Integer)
    porcentaje_tiros_de_campo = db.Column(db.Float)
    porcentaje_triples = db.Column(db.Float)
    porcentaje_tiros_libres = db.Column(db.Float)


class Contexto_Partido(db.Model):
    __tablename__ = 'Contexto_Partido'  # Nombre de la tabla en la base de datos
    id_contexto = db.Column(db.Integer, primary_key=True)
    enfrentamiento_id = db.Column(db.Integer, db.ForeignKey('Enfrentamiento.id_enfrentamiento'))
    dias_descanso_equipo1 = db.Column(db.Integer)
    dias_descanso_equipo2 = db.Column(db.Integer)
    racha_equipo1 = db.Column(db.String(50))
    racha_equipo2 = db.Column(db.String(50))


class Lesiones_Jugador(db.Model):
    __tablename__ = 'Lesiones_Jugador'  # Nombre de la tabla en la base de datos
    id_lesion = db.Column(db.Integer, primary_key=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey('Jugador.id_jugador'))
    enfrentamiento_id = db.Column(db.Integer, db.ForeignKey('Enfrentamiento.id_enfrentamiento'))
    tipo_lesion = db.Column(db.String(100))


class Historial_Enfrentamientos(db.Model):
    __tablename__ = 'Historial_Enfrentamientos'  # Nombre de la tabla en la base de datos
    id_historial = db.Column(db.Integer, primary_key=True)
    equipo1_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    equipo2_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    victorias_equipo1 = db.Column(db.Integer, default=0)
    victorias_equipo2 = db.Column(db.Integer, default=0)

class VistaEquipoPartido(db.Model):
    __tablename__ = 'Vista_Equipo_Partido' # Nombre de la vista en la base de datos
    __table_args__ = {'info': {'viewonly': True}}  # Indica que es una vista de solo lectura

    equipo_id = db.Column(db.Integer, primary_key=True)  # Necesario para que SQLAlchemy lo maneje
    enfrentamiento_id = db.Column(db.Integer, primary_key=True)
    puntos_equipo = db.Column(db.Integer)
    rebotes_totales = db.Column(db.Integer)
    asistencias_totales = db.Column(db.Integer)
    perdidas_totales = db.Column(db.Integer)
    faltas_totales = db.Column(db.Integer)
    faltas_recibidas_totales = db.Column(db.Integer)
    porcentaje_tiros_campo_equipo = db.Column(db.Float)


class VistaEstadisticasJugador(db.Model):
    __tablename__ = 'Vista_Estadisticas_Jugador'  # Nombre de la vista en la base de datos
    __table_args__ = {'extend_existing': True}  # Para evitar conflictos si la vista ya existe

    # Define una clave primaria
    jugador_id = db.Column(db.Integer, primary_key=True)  # Establece jugador_id como clave primaria
    equipo_id = db.Column(db.Integer)
    enfrentamiento_id = db.Column(db.Integer)
    puntos = db.Column(db.Integer)
    asistencias = db.Column(db.Integer)
    rebotes_totales = db.Column(db.Integer)
    perdidas_balon = db.Column(db.Integer)
    porcentaje_tiros_de_campo = db.Column(db.Float)
    porcentaje_tiros_libres = db.Column(db.Float)
    uso_porcentaje_equipo = db.Column(db.Float)
    eficiencia_jugador = db.Column(db.Float)
    rating_ofensivo = db.Column(db.Float)
    rating_defensivo = db.Column(db.Float)
    win_shares = db.Column(db.Float)