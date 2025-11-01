# ⚡ SmartEdge Streaming Dashboard

SmartEdge is a real-time sensor monitoring and load prediction dashboard built with FastAPI, Faust, Kafka, and React. It supports anomaly detection, weather-aware forecasting, multi-location sensor grouping, and CSV export of evaluated predictions.

Note: This dashboard simulates incoming sensor data using send_data.py. You can customize the simulation by modifying the script or replacing it with your own data source.
---

## 🚀 Key Features

- Real-time sensor ingestion via Kafka + Faust
- Load forecasting with configurable prediction horizon
- Automatic anomaly detection
- Interactive React dashboard with charts and alerts
- CSV export of evaluated predictions
- WebSocket-based live updates
- Lightweight persistence using SQLite

---

## 🧰 Tech Stack

Layer

Technology

Streaming

Kafka, Faust

Backend

FastAPI, SQLAlchemy, SQLite

Frontend

React.js, Chart.js

Integration

WebSocket, REST API

Config

dotenv, aiohttp

📁 Project Structure

smartedge/
├── backend/
│   ├── api/
│   │   ├── main.py
│   │   ├── forecast_model_light.py
│   ├── faust_app/
│   │   ├── app.py
│   │   ├── models.py
│   ├── sensor.db
│   ├── .env.example
│   ├── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   ├── styles.css
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── README.md
└── .gitignore

⚙️ Setup Instructions

1. Clone the Repository

git clone https://github.com/your-username/smartedge.git
cd smartedge

2. Backend Setup

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

Edit .env:

FASTAPI_URL=http://localhost:8000
KAFKA_BROKER=localhost:9092
MODEL_MODE=probabilistic
SIMULATION_MODE=true

Start FastAPI

uvicorn api.main:app --host 0.0.0.0 --port 8000

Start Faust Worker

faust -A faust_app.app worker -l info

3. Frontend Setup

cd frontend
npm install
cp .env.example .env
npm start

Ensure proxy in package.json is set to:

"proxy": "http://localhost:8000"

4. Kafka Setup (Local)

# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka broker
bin/kafka-server-start.sh config/server.properties

# Create topic
bin/kafka-topics.sh --create --topic sensor-data --bootstrap-server localhost:9092

📤 Exporting Predictions

Click the Export Predictions button in the dashboard

Predictions are only exportable after their forecast horizon has passed

A CSV file will be automatically downloaded

🧪 Testing & Simulation

Send dummy sensor data to Kafka topic sensor-data

Faust processes and forwards data to FastAPI

FastAPI predicts and broadcasts results via WebSocket

Dashboard updates charts and alerts in real-time

🛠 Production Notes

Replace SQLite with PostgreSQL or TimescaleDB for scalability

Use Redis or NATS for scalable WebSocket pub/sub

Offload ML prediction to a separate microservice if needed

Add logging, monitoring (e.g., Prometheus, Grafana)

Containerize with Docker for deployment

📄 License

MIT License

🙌 Contributing

Pull requests and issues are welcome. Feel free to fork and adapt this project to your needs.
