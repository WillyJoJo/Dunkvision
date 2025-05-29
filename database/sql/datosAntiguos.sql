INSERT INTO Enfrentamiento (id_enfrentamiento, equipo1_id, equipo2_id, puntos_equipo1, puntos_equipo2, fecha)
VALUES
('0022300065', 1610612738, 1610612747, 117, 110, '2024-10-22'),
('0022300066', 1610612747, 1610612738, 108, 120, '2024-11-04');

-- Temporada 23 (2023)
INSERT INTO Estadisticas_Avanzadas_Equipo (
    equipo_id, temporada_id, puntos, asistencias, rebotes_ofensivos, rebotes_defensivos, rebotes_totales,
    robos, tapones, perdidas_balon, faltas_cometidas, tiros_de_campo_intentados, porcentaje_tiros_de_campo,
    triples_intentados, porcentaje_triples, tiros_de_dos_intentados, porcentaje_tiros_de_dos,
    porcentaje_efectivo_tiros_de_campo, tiros_libres_intentados, porcentaje_tiros_libres,
    rating_ofensivo, rating_defensivo, strength_of_schedule, simple_rating_system, ritmo, margen_de_victoria,
    victorias, derrotas
) VALUES
(1610612738, 23, 115.3, 26.4, 10.2, 34.5, 44.7, 7.3, 4.8, 13.6, 18.2, 90.1, 0.471, 38.4, 0.362, 51.7, 0.554, 0.581, 20.7, 0.789, 118.2, 112.1, 0.15, 5.43, 98.3, 5.2, 52, 30),
(1610612747, 23, 112.4, 25.8, 9.5, 33.1, 42.6, 7.5, 4.1, 14.2, 17.9, 88.6, 0.468, 36.3, 0.359, 49.2, 0.538, 0.568, 21.9, 0.775, 114.3, 114.8, -0.12, -0.5, 97.9, -0.6, 47, 35);

INSERT INTO Jugador_Partido (
    jugador_id, equipo_id, enfrentamiento_id, minutos_jugados, puntos, asistencias, 
    rebotes_ofensivos, rebotes_defensivos, robos, tapones, perdidas_balon, 
    faltas_cometidas, faltas_recibidas, porcentaje_tiros_de_campo, 
    porcentaje_triples, porcentaje_tiros_libres
) VALUES
(1627759, 1610612738, '0022300065', 29, 26, 5, 2, 1, 1, 0, 3, 3, 4, 0.638, 0.373, 0.599),
(1628369, 1610612738, '0022300065', 26, 0, 10, 2, 4, 2, 3, 4, 2, 5, 0.344, 0.348, 0.507),
(201143 , 1610612738, '0022300065', 17, 19, 2, 1, 5, 3, 3, 5, 5, 1, 0.493, 0.310, 0.572),
(2544   , 1610612747, '0022300065', 38, 21, 4, 4, 1, 0, 0, 4, 2, 2, 0.629, 0.440, 0.781),
(203076 , 1610612747, '0022300065', 31, 6, 10, 4, 5, 0, 1, 4, 1, 3, 0.575, 0.315, 0.529),
(1626156, 1610612747, '0022300065', 27, 15, 3, 1, 4, 1, 2, 2, 1, 3, 0.487, 0.360, 0.711),

(2544   , 1610612747, '0022300066', 35, 28, 3, 2, 4, 2, 2, 1, 3, 2, 0.611, 0.380, 0.733),
(203076 , 1610612747, '0022300066', 34, 12, 7, 1, 3, 1, 1, 3, 4, 2, 0.467, 0.320, 0.609),
(1626156, 1610612747, '0022300066', 28, 6, 4, 0, 3, 0, 0, 2, 1, 2, 0.420, 0.340, 0.745),
(1627759, 1610612738, '0022300066', 33, 20, 5, 3, 6, 2, 1, 1, 2, 3, 0.583, 0.370, 0.702),
(1628369, 1610612738, '0022300066', 30, 18, 4, 2, 5, 2, 0, 1, 3, 1, 0.521, 0.333, 0.754),
(201143 , 1610612738, '0022300066', 26, 14, 2, 1, 4, 1, 0, 0, 2, 0, 0.478, 0.300, 0.625);
