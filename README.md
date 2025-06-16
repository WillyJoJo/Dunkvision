# 🏀 DunkVision – Sistema de predicción de resultados NBA

Este proyecto es el Trabajo de Fin de Grado (TFG) de Ingeniería del Software, desarrollado con el objetivo de analizar, visualizar y predecir resultados de partidos de la NBA utilizando estadísticas avanzadas de equipos y jugadores.

## 📌 Funcionalidades principales

- Importación automática de datos estadísticos desde la NBA.
- Visualización interactiva de equipos, jugadores y enfrentamientos.
- Cálculo de estadísticas avanzadas (PER, BPM, USG%, WS, etc.).
- Simulación de enfrentamientos con condiciones personalizadas (lesiones y fichajes).
- Sistema de predicción basado en modelos de machine learning (XGBoost).
- Panel de administración y control de usuarios mediante autenticación JWT.

---

## ⚙️ Tecnologías utilizadas

### Backend
- Python 3.11
- Flask + SQLAlchemy
- MySQL
- JWT (Flask-JWT-Extended)
- Scikit-learn / XGBoost

### Frontend
- Next.js 14
- React
- TailwindCSS + ShadCN
- React Query
- Recharts / C3.js

---

## 🧠 Predicción de partidos

El modelo de predicción ha sido entrenado con estadísticas avanzadas históricas, usando `XGBoost`, y permite simular:
- Lesiones temporales de jugadores.
- Fichajes hipotéticos con estadísticas personalizadas.
- Diferencias estadísticas entre equipos y jugadores reales.

El modelo final alcanza una **precisión del 77 %** en el conjunto de prueba.

---
