import faust

class SensorData(faust.Record):
    temperature: float
    humidity: float
    irradiance: float
    timestamp: str
