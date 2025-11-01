import pymc as pm
import numpy as np
import pandas as pd
from sqlalchemy import create_engine, Table, MetaData

# Setup database
engine = create_engine("sqlite:///sensor.db")
metadata = MetaData()
metadata.reflect(bind=engine)
sensor_table = metadata.tables.get("sensor_data")

def train_bayesian_model():
    with engine.connect() as conn:
        result = conn.execute(sensor_table.select())
        rows = [dict(row) for row in result]

    if len(rows) < 10:
        raise ValueError("Not enough data to train Bayesian model")

    df = pd.DataFrame(rows)
    X = df[["temperature", "humidity", "irradiance"]].values
    y = 0.3 * df["temperature"] + 0.4 * df["humidity"] + 0.3 * df["irradiance"]  # or use real target if available

    with pm.Model() as model:
        # Priors
        beta = pm.Normal("beta", mu=0, sigma=10, shape=3)
        intercept = pm.Normal("intercept", mu=0, sigma=10)
        sigma = pm.HalfNormal("sigma", sigma=1)

        # Likelihood
        mu = intercept + pm.math.dot(X, beta)
        y_obs = pm.Normal("y_obs", mu=mu, sigma=sigma, observed=y)

        # Sampling
        trace = pm.sample(500, tune=300, chains=2, progressbar=False)

    return trace

def predict_load(temp, humidity, irradiance):
    try:
        trace = train_bayesian_model()
    except Exception as e:
        return {
            "load_prediction": None,
            "confidence_interval": [None, None],
            "ci_low": None,
            "ci_high": None,
            "anomaly": False,
            "error": str(e)
        }

    # Extract posterior samples
    beta_samples = trace.posterior["beta"].stack(draws=("chain", "draw")).values
    intercept_samples = trace.posterior["intercept"].stack(draws=("chain", "draw")).values

    # Compute predictions
    input_vector = np.array([temp, humidity, irradiance])
    predictions = intercept_samples + np.dot(beta_samples.T, input_vector)

    mean = np.mean(predictions)
    ci = np.percentile(predictions, [5, 95])
    anomaly = np.any(np.abs(predictions - mean) > 2 * np.std(predictions))

    return {
        "load_prediction": round(mean, 2),
        "confidence_interval": [round(ci[0], 2), round(ci[1], 2)],
        "ci_low": round(ci[0], 2),
        "ci_high": round(ci[1], 2),
        "anomaly": anomaly
    }
