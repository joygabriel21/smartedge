import numpy as np
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
MODEL_MODE = os.getenv("MODEL_MODE", "probabilistic")

def detect_anomaly(samples, threshold=2.0):
    z_scores = (samples - np.mean(samples)) / np.std(samples)
    return bool(np.any(np.abs(z_scores) > threshold))

def get_time_weight(timestamp):
    try:
        dt = datetime.fromisoformat(timestamp)
        hour = dt.hour
        if 6 <= hour <= 9 or 17 <= hour <= 20:
            return 1.2
        elif 0 <= hour <= 5:
            return 0.8
        else:
            return 1.0
    except:
        return 1.0

def get_weather_modifier(irradiance, ext_condition):
    mod = 1.0
    if irradiance < 600:
        mod *= 1.15
    elif irradiance > 1000:
        mod *= 0.95
    if ext_condition == "Rain":
        mod *= 1.2
    elif ext_condition == "Clear":
        mod *= 0.95
    return mod

def predict_load(temp, humidity, irradiance, timestamp=None, ext_temperature=None, ext_humidity=None, ext_condition=None, sample_buffer=0, forecast_horizon=10):
    base_load = 0.3 * temp + 0.4 * humidity + 0.3 * irradiance
    time_weight = get_time_weight(timestamp)
    weather_mod = get_weather_modifier(irradiance, ext_condition)
    adjusted_load = base_load * time_weight * weather_mod

    samples = np.random.normal(loc=adjusted_load, scale=0.5, size=100)
    mean = np.mean(samples)
    ci_low, ci_high = np.percentile(samples, [5, 95])
    anomaly = sample_buffer >= 5 and detect_anomaly(samples)

    try:
        dt = datetime.fromisoformat(timestamp)
        future_ts = dt + timedelta(minutes=forecast_horizon)
        future_timestamp = future_ts.isoformat()
    except:
        future_timestamp = timestamp

    return {
        "load_prediction": round(mean, 2),
        "confidence_interval": [round(ci_low, 2), round(ci_high, 2)],
        "ci_low": round(ci_low, 2),
        "ci_high": round(ci_high, 2),
        "anomaly": anomaly,
        "timestamp": future_timestamp,
        "forecast_horizon": forecast_horizon
    }
