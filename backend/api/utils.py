def broadcast(clients, data):
    for client in clients:
        asyncio.create_task(client.send_json(data))

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
