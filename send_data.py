import random
import requests
from kafka import KafkaProducer
import json
import time
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

producer = KafkaProducer(
    bootstrap_servers=os.getenv("KAFKA_BROKER", "localhost:9092"),
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
WEATHER_CITY = os.getenv("WEATHER_CITY", "Jakarta")
FORECAST_HORIZON = int(os.getenv("FORECAST_HORIZON", "10"))

# Simulasi daftar sensor
SENSORS = [
    {"sensor_id": "PLN-JKT-01", "location": "Jakarta HQ"},
    {"sensor_id": "PLN-BDG-02", "location": "Bandung Plant"},
    {"sensor_id": "PLN-SBY-03", "location": "Surabaya Hub"}
]

def fetch_weather():
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?q={WEATHER_CITY}&appid={WEATHER_API_KEY}&units=metric"
        res = requests.get(url)
        data = res.json()
        return {
            "ext_temperature": data["main"]["temp"],
            "ext_humidity": data["main"]["humidity"],
            "ext_condition": data["weather"][0]["main"]
        }
    except Exception as e:
        print("Weather fetch failed:", e)
        return {
            "ext_temperature": None,
            "ext_humidity": None,
            "ext_condition": None
        }

while True:
    for sensor in SENSORS:
        sensor_data = {
            "sensor_id": sensor["sensor_id"],
            "location": sensor["location"],
            "temperature": round(random.uniform(30, 36), 2),
            "humidity": round(random.uniform(40, 80), 2),
            "irradiance": round(random.uniform(700, 1100), 2),
            "timestamp": datetime.now().isoformat(),
            "forecast_horizon": FORECAST_HORIZON
        }

        sensor_data.update(fetch_weather())

        producer.send("sensor-data", value=sensor_data)
        print("Sent to Kafka:", sensor_data)

    time.sleep(2)
