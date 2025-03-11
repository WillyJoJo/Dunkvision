-- Crear la base de datos si no existe y usarla
CREATE DATABASE IF NOT EXISTS dunkvision;
USE dunkvision;

-- Tabla Usuario
CREATE TABLE IF NOT EXISTS Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario'
);

-- Tabla Equipo
CREATE TABLE IF NOT EXISTS Equipo (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    conferencia VARCHAR(50) NOT NULL,
    division VARCHAR(50) NOT NULL,
    record VARCHAR(10)
);

-- Tabla Jugador (se añade la columna posicion)
CREATE TABLE IF NOT EXISTS Jugador (
    id_jugador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    equipo_id INT,
    posicion VARCHAR(50) NOT NULL, -- Nueva columna para la posición del jugador
    FOREIGN KEY (equipo_id) REFERENCES Equipo(id_equipo)
);

-- Tabla Enfrentamiento
CREATE TABLE IF NOT EXISTS Enfrentamiento (
    id_enfrentamiento INT(10) ZEROFILL AUTO_INCREMENT PRIMARY KEY,
    equipo1_id INT,
    equipo2_id INT,
    puntos_equipo1 INT,
    puntos_equipo2 INT,
    fecha DATE,
    FOREIGN KEY (equipo1_id) REFERENCES Equipo(id_equipo),
    FOREIGN KEY (equipo2_id) REFERENCES Equipo(id_equipo)
);

-- Tabla intermedia Jugador_Partido para vincular jugadores con los partidos en los que participan
CREATE TABLE IF NOT EXISTS Jugador_Partido (
    id_jugador_partido INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
	enfrentamiento_id INT(10) UNSIGNED ZEROFILL NOT NULL,
    minutos_jugados INT,
    puntos INT,
    asistencias INT,
    rebotes_ofensivos INT,
    rebotes_defensivos INT,
    robos INT,
    tapones INT,
    perdidas_balon INT,
    faltas_cometidas INT,
    faltas_recibidas INT,
    porcentaje_tiros_de_campo FLOAT,
    porcentaje_triples FLOAT,
    porcentaje_tiros_libres FLOAT,
    FOREIGN KEY (jugador_id) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (enfrentamiento_id) REFERENCES Enfrentamiento(id_enfrentamiento)
);

-- Tabla Contexto_Partido para añadir detalles del contexto de cada enfrentamiento
CREATE TABLE IF NOT EXISTS Contexto_Partido (
    id_contexto INT AUTO_INCREMENT PRIMARY KEY,
	enfrentamiento_id INT(10) UNSIGNED ZEROFILL NOT NULL,
    dias_descanso_equipo1 INT,
    dias_descanso_equipo2 INT,
    racha_equipo1 VARCHAR(50),
    racha_equipo2 VARCHAR(50),
    FOREIGN KEY (enfrentamiento_id) REFERENCES Enfrentamiento(id_enfrentamiento)
);

-- Tabla Lesiones_Jugador para registrar las lesiones de los jugadores
CREATE TABLE IF NOT EXISTS Lesiones_Jugador (
    id_lesion INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
	fecha_recuperacion_estimada DATE,
    tipo_lesion VARCHAR(100),
    FOREIGN KEY (jugador_id) REFERENCES Jugador(id_jugador)
);

-- Tabla Historial_Enfrentamientos para registrar las victorias entre dos equipos
CREATE TABLE IF NOT EXISTS Historial_Enfrentamientos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    equipo1_id INT,
    equipo2_id INT,
    victorias_equipo1 INT DEFAULT 0,
    victorias_equipo2 INT DEFAULT 0,
    FOREIGN KEY (equipo1_id) REFERENCES Equipo(id_equipo),
    FOREIGN KEY (equipo2_id) REFERENCES Equipo(id_equipo),
    CONSTRAINT equipo_unico CHECK (equipo1_id <> equipo2_id)
);

-- Tabla enumerado de temporada
CREATE TABLE IF NOT EXISTS Temporada (
    id_temporada INT AUTO_INCREMENT PRIMARY KEY,
    nombre_temporada VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla Estadísticas_avanzadas_jugador (estadísticas calculadas del jugador por partido)
-- Asociada a un jugador (id_jugador) y a una temporada (id_temporada)
CREATE TABLE IF NOT EXISTS Estadisticas_avanzadas_jugador (
    id_estadisticas INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
    temporada_id INT,
    partidos_jugados INT,
    minutos_jugados INT,
    puntos INT,
    asistencias INT,
    rebotes_ofensivos INT,
    rebotes_defensivos INT,
    rebotes_totales INT,
    robos INT,
    tapones INT,
    perdidas_balon INT,
    faltas_cometidas INT,
    tiros_de_campo_intentados INT,
    porcentaje_tiros_de_campo FLOAT,
    triples_intentados INT,
    porcentaje_triples FLOAT,
    tiros_de_dos_intentados INT,
    porcentaje_tiros_de_dos FLOAT,
    porcentaje_efectivo_tiros_de_campo FLOAT,
    tiros_libres_intentados INT,
    porcentaje_tiros_libres FLOAT,
    rating_ofensivo FLOAT,
    rating_defensivo FLOAT,
    player_efficiency_rating FLOAT,
    porcentaje_de_uso FLOAT,
    win_share_ofensivo FLOAT,
    win_share_defensivo FLOAT,
    win_share_total FLOAT,
    box_plus_minus FLOAT,
    FOREIGN KEY (jugador_id) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (temporada_id) REFERENCES Temporada(id_temporada)
);



--
--
--

-- Tabla para las estadísticas promedio del equipo por temporada

