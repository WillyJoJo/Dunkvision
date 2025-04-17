from app import db

class Usuario(db.Model):
    __tablename__ = "usuario"
    id = db.Column(db.Integer, primary_key=True)
    nombre_usuario = db.Column(db.String(50), unique=True)
    email = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(255))
    rol = db.Column(db.String(20), default="usuario")  # si ponemos admin, el usuario será administrador


class Equipo(db.Model):
    __tablename__ = 'Equipo'
    id_equipo = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    conferencia = db.Column(db.String(50), nullable=False)
    division = db.Column(db.String(50), nullable=False)
    jugadores = db.relationship('Jugador', backref='equipo', lazy=True)


class Jugador(db.Model):
    __tablename__ = 'Jugador'
    id_jugador = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    equipo_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    posicion = db.Column(db.String(50), nullable=False)
    partidos = db.relationship('Jugador_Partido', backref='jugador', lazy=True)
    lesiones = db.relationship('Lesiones_Jugador', backref='jugador', lazy=True)


class Enfrentamiento(db.Model):
    __tablename__ = 'Enfrentamiento'
    id_enfrentamiento = db.Column(db.Integer, primary_key=True, autoincrement=True)
    equipo1_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    equipo2_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    puntos_equipo1 = db.Column(db.Integer)
    puntos_equipo2 = db.Column(db.Integer)
    fecha = db.Column(db.Date)
    jugadores_partido = db.relationship('Jugador_Partido', backref='enfrentamiento', lazy=True)


class Jugador_Partido(db.Model):
    __tablename__ = 'Jugador_Partido'
    id_jugador_partido = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey('Jugador.id_jugador'))
    equipo_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
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
    __tablename__ = 'Lesiones_Jugador'
    id_lesion = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey('Jugador.id_jugador'))
    fecha_recuperacion_estimada = db.Column(db.Date)
    tipo_lesion = db.Column(db.String(100))


class Historial_Enfrentamientos(db.Model):
    __tablename__ = 'Historial_Enfrentamientos'
    id_historial = db.Column(db.Integer, primary_key=True, autoincrement=True)
    equipo1_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    equipo2_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'))
    victorias_equipo1 = db.Column(db.Integer, default=0)
    victorias_equipo2 = db.Column(db.Integer, default=0)

class Temporada(db.Model):
    __tablename__ = 'Temporada'
    id_temporada = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_temporada = db.Column(db.String(50), nullable=False, unique=True)
    
class Estadisticas_Avanzadas_Jugador(db.Model):
    __tablename__ = 'Estadisticas_Avanzadas_Jugador'
    
    id_estadisticas = db.Column(db.Integer, primary_key=True, autoincrement=True)
    jugador_id = db.Column(db.Integer, db.ForeignKey('Jugador.id_jugador'), nullable=False)
    temporada_id = db.Column(db.Integer, db.ForeignKey('Temporada.id_temporada'), nullable=False)
    partidos_jugados = db.Column(db.Integer)
    minutos_jugados = db.Column(db.Integer)
    puntos = db.Column(db.Integer)
    asistencias = db.Column(db.Integer)
    rebotes_ofensivos = db.Column(db.Integer)
    rebotes_defensivos = db.Column(db.Integer)
    rebotes_totales = db.Column(db.Integer)
    robos = db.Column(db.Integer)
    tapones = db.Column(db.Integer)
    perdidas_balon = db.Column(db.Integer)
    faltas_cometidas = db.Column(db.Integer)
    tiros_de_campo_intentados = db.Column(db.Integer)
    porcentaje_tiros_de_campo = db.Column(db.Float)
    triples_intentados = db.Column(db.Integer)
    porcentaje_triples = db.Column(db.Float)
    tiros_de_dos_intentados = db.Column(db.Integer)
    porcentaje_tiros_de_dos = db.Column(db.Float)
    porcentaje_efectivo_tiros_de_campo = db.Column(db.Float)
    tiros_libres_intentados = db.Column(db.Integer)
    porcentaje_tiros_libres = db.Column(db.Float)
    rating_ofensivo = db.Column(db.Float)
    rating_defensivo = db.Column(db.Float)
    player_efficiency_rating = db.Column(db.Float)
    usage_porcentage = db.Column(db.Float)
    win_share_ofensivo = db.Column(db.Float)
    win_share_defensivo = db.Column(db.Float)
    win_share_total = db.Column(db.Float)
    box_plus_minus = db.Column(db.Float)


class Estadisticas_Avanzadas_Equipo(db.Model):
    __tablename__ = 'Estadisticas_Avanzadas_Equipo'
    
    id_estadisticas = db.Column(db.Integer, primary_key=True, autoincrement=True)
    equipo_id = db.Column(db.Integer, db.ForeignKey('Equipo.id_equipo'), nullable=False)
    temporada_id = db.Column(db.Integer, db.ForeignKey('Temporada.id_temporada'), nullable=False)
    puntos = db.Column(db.Integer)
    asistencias = db.Column(db.Integer)
    rebotes_ofensivos = db.Column(db.Integer)
    rebotes_defensivos = db.Column(db.Integer)
    rebotes_totales = db.Column(db.Integer)
    robos = db.Column(db.Integer)
    tapones = db.Column(db.Integer)
    perdidas_balon = db.Column(db.Integer)
    faltas_cometidas = db.Column(db.Integer)
    tiros_de_campo_intentados = db.Column(db.Integer)
    porcentaje_tiros_de_campo = db.Column(db.Float)
    triples_intentados = db.Column(db.Integer)
    porcentaje_triples = db.Column(db.Float)
    tiros_de_dos_intentados = db.Column(db.Integer)
    porcentaje_tiros_de_dos = db.Column(db.Float)
    porcentaje_efectivo_tiros_de_campo = db.Column(db.Float)
    tiros_libres_intentados = db.Column(db.Integer)
    porcentaje_tiros_libres = db.Column(db.Float)
    rating_ofensivo = db.Column(db.Float)
    rating_defensivo = db.Column(db.Float)
    strength_of_schedule = db.Column(db.Float)
    simple_rating_system = db.Column(db.Float)
    ritmo = db.Column(db.Float)
    margen_de_victoria = db.Column(db.Float)
    victorias = db.Column(db.Integer)
    derrotas = db.Column(db.Integer)

