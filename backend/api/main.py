import sys, os, asyncio
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from datetime import datetime
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Table, Column, Float, String, MetaData
from dotenv import load_dotenv
from .forecast_model_light import predict_load

# Load environment variables
load_dotenv()
MODEL_MODE = os.getenv("MODEL_MODE", "probabilistic")

# Initialize database
engine = create_engine("sqlite:///sensor.db")
metadata = MetaData()

sensor_table = Table("sensor_data", metadata,
    Column("sensor_id", String),
    Column("location", String),
    Column("temperature", Float),
    Column("humidity", Float),
    Column("irradiance", Float),
    Column("timestamp", String),
    Column("ext_temperature", Float),
    Column("ext_humidity", Float),
    Column("ext_condition", String),
    Column("forecast_horizon", Float)
)


prediction_table = Table("prediction_data", metadata,
    Column("sensor_id", String),
    Column("location", String),
    Column("load_prediction", Float),
    Column("ci_low", Float),
    Column("ci_high", Float),
    Column("timestamp", String),
    Column("anomaly", String),
    Column("actual_load", Float),
    Column("error", Float)
)

metadata.create_all(engine)

# Initialize FastAPI
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

clients = []

@app.post("/stream")
async def stream(request: Request):
    try:
        data = await request.json()
        timestamp = data.get("timestamp", datetime.now().isoformat())
        data["timestamp"] = timestamp

        sensor_id = data.get("sensor_id", "default-sensor")
        location = data.get("location", "Unknown")

        save_to_db({**data, "sensor_id": sensor_id, "location": location})

        result = predict_load(
            temp=data["temperature"],
            humidity=data["humidity"],
            irradiance=data["irradiance"],
            timestamp=timestamp,
            ext_temperature=data.get("ext_temperature"),
            ext_humidity=data.get("ext_humidity"),
            ext_condition=data.get("ext_condition"),
            sample_buffer=0,
            forecast_horizon=int(data.get("forecast_horizon", 10))
        )

        result["timestamp"] = timestamp
        result["sensor_id"] = sensor_id
        result["location"] = location

        save_prediction(result)

        await broadcast({
            "sensor": {**data, "sensor_id": sensor_id, "location": location},
            "prediction": result
        })

        return JSONResponse(content={"status": "ok", "prediction": result})

    except Exception as e:
        print("Stream error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/export")
def export_data():
    with engine.connect() as conn:
        result = conn.execute(
            prediction_table.select().where(prediction_table.c.actual_load != None)
        )
        return [dict(row) for row in result.mappings()]

@app.get("/history")
def get_history():
    with engine.connect() as conn:
        result = conn.execute(sensor_table.select())
        return [dict(row) for row in result.mappings()]

@app.get("/mode")
def get_mode():
    return {"model_mode": MODEL_MODE}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await asyncio.sleep(1)
    except:
        if websocket in clients:
            clients.remove(websocket)

async def safe_send(client, data):
    try:
        if client.application_state == client.client_state == 3:
            print("Skipping closed WebSocket.")
            if client in clients:
                clients.remove(client)
            return
        await client.send_json(data)
    except Exception as e:
        print("WebSocket send failed:", e)
        if client in clients:
            clients.remove(client)

async def broadcast(data):
    tasks = [safe_send(client, data) for client in clients]
    await asyncio.gather(*tasks, return_exceptions=True)

def save_to_db(data):
    with engine.begin() as conn:
        conn.execute(sensor_table.insert().values(**data))

def save_prediction(result):
    with engine.begin() as conn:
        conn.execute(prediction_table.insert().values(
            sensor_id=result["sensor_id"],
            location=result["location"],
            load_prediction=result["load_prediction"],
            ci_low=result["ci_low"],
            ci_high=result["ci_high"],
            timestamp=result["timestamp"],
            anomaly=str(result["anomaly"]),
            actual_load=result.get("actual_load"),
            error=result.get("error")
        ))
