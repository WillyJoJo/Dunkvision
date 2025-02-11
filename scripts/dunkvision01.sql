-- Crear la base de datos si no existe y usarla
CREATE DATABASE IF NOT EXISTS dunkvision;
USE dunkvision;

-- Tabla Equipo
CREATE TABLE Equipo (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Tabla Jugador
CREATE TABLE Jugador (
    id_jugador INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    equipo_id INT,
    FOREIGN KEY (equipo_id) REFERENCES Equipo(id_equipo)
);

-- Tabla Enfrentamiento
CREATE TABLE Enfrentamiento (
    id_enfrentamiento INT AUTO_INCREMENT PRIMARY KEY,
    equipo1_id INT,
    equipo2_id INT,
    puntos_equipo1 INT,
    puntos_equipo2 INT,
    fecha DATE,
    FOREIGN KEY (equipo1_id) REFERENCES Equipo(id_equipo),
    FOREIGN KEY (equipo2_id) REFERENCES Equipo(id_equipo)
);

-- Tabla intermedia Jugador_Partido para vincular jugadores con los partidos en los que participan
CREATE TABLE Jugador_Partido (
    id_jugador_partido INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
    enfrentamiento_id INT,
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
CREATE TABLE Contexto_Partido (
    id_contexto INT AUTO_INCREMENT PRIMARY KEY,
    enfrentamiento_id INT,
    dias_descanso_equipo1 INT,
    dias_descanso_equipo2 INT,
    racha_equipo1 VARCHAR(50),
    racha_equipo2 VARCHAR(50),
    FOREIGN KEY (enfrentamiento_id) REFERENCES Enfrentamiento(id_enfrentamiento)
);

-- Tabla Lesiones_Jugador para registrar las lesiones de los jugadores
CREATE TABLE Lesiones_Jugador (
    id_lesion INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT,
    enfrentamiento_id INT,
    tipo_lesion VARCHAR(100),
    FOREIGN KEY (jugador_id) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (enfrentamiento_id) REFERENCES Enfrentamiento(id_enfrentamiento)
);

-- Tabla Historial_Enfrentamientos para registrar las victorias entre dos equipos
CREATE TABLE Historial_Enfrentamientos (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    equipo1_id INT,
    equipo2_id INT,
    victorias_equipo1 INT DEFAULT 0,
    victorias_equipo2 INT DEFAULT 0,
    FOREIGN KEY (equipo1_id) REFERENCES Equipo(id_equipo),
    FOREIGN KEY (equipo2_id) REFERENCES Equipo(id_equipo),
    CONSTRAINT equipo_unico CHECK (equipo1_id <> equipo2_id)
);

