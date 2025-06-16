
# 🏀 DunkVision – Sistema de predicción de resultados NBA

Este proyecto es el Trabajo de Fin de Grado (TFG) de Ingeniería del Software, desarrollado con el objetivo de analizar, visualizar y predecir resultados de partidos de la NBA utilizando estadísticas avanzadas de equipos y jugadores.

## 📌 Funcionalidades principales

- Importación automática de datos estadísticos desde la NBA.
- Visualización interactiva de equipos, jugadores y enfrentamientos.
- Cálculo de estadísticas avanzadas (PER, BPM, USG%, WS, etc.).
- Simulación de enfrentamientos con condiciones personalizadas (lesiones y fichajes).
- Sistema de predicción basado en modelos de machine learning (XGBoost).
- Panel de administración y control de usuarios mediante autenticación JWT.

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

## 🗃️ Estructura del proyecto

\`\`\`
backend/
├── app/
│   ├── models/             # Modelos SQLAlchemy
│   ├── services/           # Lógica de negocio (microservicios)
│   ├── routes/             # Endpoints API (Blueprints)
│   └── scripts/            # Importación de datos y entrenamiento del modelo
└── config.ini              # Configuración de conexión y API

frontend/
├── app/
│   ├── jugadores/          # Rutas y páginas de jugadores
│   ├── equipos/            # Rutas y páginas de equipos
│   ├── prediccion/         # Página de simulación de enfrentamientos
│   └── login/registro/     # Gestión de usuarios
└── services/               # Conexión con API Flask
\`\`\`

## 🧠 Predicción de partidos

El modelo de predicción ha sido entrenado con estadísticas avanzadas históricas, usando \`XGBoost\`, y permite simular:
- Lesiones temporales de jugadores.
- Fichajes hipotéticos con estadísticas personalizadas.
- Diferencias estadísticas entre equipos y jugadores reales.

El modelo final alcanza una **precisión del 77 %** en el conjunto de prueba.

## ▶️ Ejecución local

### Requisitos
- Python 3.11+
- Node.js 18+
- MySQL 8+

### 1. Backend

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # en Windows: venv\Scripts\activate
pip install -r requirements.txt

# Crear la base de datos
mysql -u root -p < scripts/dunkvision01.sql

# Ejecutar la API
flask run
\`\`\`

### 2. Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## 📂 Datos y modelo

- Los datos se obtienen desde la API oficial de la NBA y ficheros CSV complementarios.
- El modelo entrenado se encuentra en \`backend/scripts/modelo_prediccion_partidos.pkl\`.

## 📖 Autor

**Willy JoJo** – Universidad de Málaga  
TFG en Ingeniería del Software – Curso 2024/2025

## 📄 Licencia

Este proyecto se entrega como parte del Trabajo de Fin de Grado y no está destinado a distribución comercial.
