-- Crear la base de datos si no existe y usarla
CREATE DATABASE IF NOT EXISTS dunkvision;
USE dunkvision;

-- Tabla Equipo
CREATE TABLE IF NOT EXISTS Equipo (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
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
CREATE TABLE IF NOT EXISTS Jugador_Partido (
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
CREATE TABLE IF NOT EXISTS Contexto_Partido (
    id_contexto INT AUTO_INCREMENT PRIMARY KEY,
    enfrentamiento_id INT,
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
    enfrentamiento_id INT,
    tipo_lesion VARCHAR(100),
    FOREIGN KEY (jugador_id) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (enfrentamiento_id) REFERENCES Enfrentamiento(id_enfrentamiento)
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

-- Vista para las estadísticas del equipo por partido
CREATE VIEW Vista_Equipo_Partido AS
SELECT 
    j.equipo_id,
    jp.enfrentamiento_id,
    SUM(jp.puntos) AS puntos_equipo,
    SUM(jp.rebotes_ofensivos + jp.rebotes_defensivos) AS rebotes_totales,
    SUM(jp.asistencias) AS asistencias_totales,
    SUM(jp.perdidas_balon) AS perdidas_totales,
    SUM(jp.faltas_cometidas) AS faltas_totales,
    SUM(jp.faltas_recibidas) AS faltas_recibidas_totales,
    SUM(jp.porcentaje_tiros_de_campo * jp.minutos_jugados) / 
        SUM(jp.minutos_jugados) AS porcentaje_tiros_campo_equipo
FROM jugador_partido jp
JOIN jugador j ON jp.jugador_id = j.id_jugador
GROUP BY j.equipo_id, jp.enfrentamiento_id;

-- Vista para las estadísticas avanzadas de los jugadores
CREATE OR REPLACE VIEW Vista_Estadisticas_Jugador AS
SELECT 
    jp.jugador_id,
    j.equipo_id,
    jp.enfrentamiento_id,
    jp.puntos,
    jp.asistencias,
    jp.rebotes_ofensivos + jp.rebotes_defensivos AS rebotes_totales,
    jp.perdidas_balon,
    jp.porcentaje_tiros_de_campo,
    jp.porcentaje_tiros_libres,

    -- Calcular uso porcentual del jugador en el equipo
    (jp.uso_porcentaje * 
        (SELECT SUM(uso_porcentaje) 
         FROM jugador_partido 
         WHERE enfrentamiento_id = jp.enfrentamiento_id 
           AND jugador_id IN (SELECT id_jugador FROM jugador WHERE equipo_id = j.equipo_id))
    ) AS uso_porcentaje_equipo,

    -- Calcular eficiencia del jugador (Ejemplo: PER básico)
    (jp.puntos + jp.rebotes_ofensivos + jp.rebotes_defensivos + jp.asistencias + jp.robos + jp.tapones 
    - jp.perdidas_balon) / NULLIF(jp.minutos_jugados, 0) AS eficiencia_jugador,

    -- Rating ofensivo y defensivo (simplificado)
    (jp.puntos / NULLIF(jp.minutos_jugados, 0)) * 100 AS rating_ofensivo,
    ((jp.rebotes_ofensivos + jp.rebotes_defensivos + jp.robos + jp.tapones) 
    / NULLIF(jp.minutos_jugados, 0)) * 100 AS rating_defensivo,

    -- Win Shares (simplificado basado en contribución a puntos y defensa)
    ((jp.puntos * 0.5) + ((jp.rebotes_ofensivos + jp.rebotes_defensivos + jp.robos + jp.tapones) * 0.3) 
    - (jp.perdidas_balon * 0.4)) / 100 AS win_shares

FROM jugador_partido jp
JOIN jugador j ON jp.jugador_id = j.id_jugador;

