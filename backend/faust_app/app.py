import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

import faust
import aiohttp
from dotenv import load_dotenv
from .models import SensorData
from api.main import broadcast

# Load environment variables
load_dotenv()

FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")
KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")

if not FASTAPI_URL or not KAFKA_BROKER:
    raise ValueError("Missing FASTAPI_URL or KAFKA_BROKER in .env")

# Initialize Faust app
app = faust.App("forecast-stream", broker=f"kafka://{KAFKA_BROKER}")
sensor_topic = app.topic("sensor-data", value_type=SensorData)

@app.agent(sensor_topic)
async def process(stream):
    async for data in stream:
        print(f"Received: {data}")

        payload = {
            "sensor_id": data.sensor_id,
            "location": data.location,
            "temperature": data.temperature,
            "humidity": data.humidity,
            "irradiance": data.irradiance,
            "timestamp": data.timestamp,
            "forecast_horizon": data.forecast_horizon,
            "ext_temperature": data.ext_temperature,
            "ext_humidity": data.ext_humidity,
            "ext_condition": data.ext_condition
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(f"{FASTAPI_URL}/stream", json=payload) as resp:
                    prediction = await resp.json()
                    print("Prediction:", prediction)

                    # Optional: broadcast only if available
                    if callable(broadcast):
                        broadcast(prediction)
        except Exception as e:
            print("Error calling FastAPI:", e)
