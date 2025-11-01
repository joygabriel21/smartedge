def run_forecast(sensor_data):
    # Dummy logic, bisa kamu ganti nanti
    load = sensor_data.get("temperature", 30) * 1.2
    return {
        "load_prediction": round(load, 2),
        "confidence_interval": [load - 5, load + 5]
    }
