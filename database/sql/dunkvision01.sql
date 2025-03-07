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

CREATE OR REPLACE VIEW Vista_Estadisticas_Jugador AS
SELECT 
    jp.jugador_id,
    j.equipo_id, -- este valor es el actual, ya que está en la tabla Jugador
    AVG(jp.puntos) AS puntos_promedio,
    AVG(jp.asistencias) AS asistencias_promedio,
    AVG(jp.rebotes_ofensivos + jp.rebotes_defensivos) AS rebotes_totales_promedio,
    AVG(jp.perdidas_balon) AS perdidas_promedio,
    AVG(jp.porcentaje_tiros_de_campo) AS porcentaje_tiros_de_campo_promedio,
    AVG(jp.porcentaje_tiros_libres) AS porcentaje_tiros_libres_promedio,
    AVG(jp.porcentaje_triples) AS porcentaje_triples_promedio,
    AVG(jp.minutos_jugados) AS minutos_jugados_promedio,
    AVG(jp.robos) AS robos_promedio,
    AVG(jp.tapones) AS tapones_promedio,
    AVG(jp.faltas_cometidas) AS faltas_cometidas_promedio,
    AVG(jp.faltas_recibidas) AS faltas_recibidas_promedio
    -- Uso de porcentaje del jugador (Percentage usage USG%)
    -- Eficiencia del jugador (Player Efficiency Rating PER)
    -- Rating ofensivo (Offensive Rating ORTG)
    -- Rating defensivo (Defensive Rating DRTG)
    -- Win Shares (WS Victorias Aportadas) 
FROM Jugador_Partido jp
JOIN Jugador j ON jp.jugador_id = j.id_jugador
GROUP BY jp.jugador_id, j.equipo_id;

-- Vista para las estadísticas del equipo por partido
CREATE OR REPLACE VIEW Vista_Equipo_Promedio AS
SELECT 
    equipo_id,
    COUNT(*) AS partidos_jugados,
    AVG(puntos) AS puntos_promedio,
    AVG(rebotes) AS rebotes_promedio,
    AVG(asistencias) AS asistencias_promedio,
    AVG(perdidas) AS perdidas_promedio,
    AVG(faltas_cometidas) AS faltas_cometidas_promedio,
    AVG(faltas_recibidas) AS faltas_recibidas_promedio,
    AVG(tiros_campo) AS tiros_campo_promedio
    -- Rating ofensivo (simplificado)
    -- Rating defensivo (simplificado)
FROM (
    SELECT 
        j.equipo_id,
        jp.enfrentamiento_id,
        SUM(jp.puntos) AS puntos,
        SUM(jp.rebotes_ofensivos + jp.rebotes_defensivos) AS rebotes,
        SUM(jp.asistencias) AS asistencias,
        SUM(jp.perdidas_balon) AS perdidas,
        SUM(jp.faltas_cometidas) AS faltas_cometidas,
        SUM(jp.faltas_recibidas) AS faltas_recibidas,
        SUM(jp.porcentaje_tiros_de_campo * jp.minutos_jugados) / SUM(jp.minutos_jugados) AS tiros_campo
    FROM jugador_partido jp
    JOIN jugador j ON jp.jugador_id = j.id_jugador
    GROUP BY j.equipo_id, jp.enfrentamiento_id
) AS resumen
GROUP BY equipo_id;