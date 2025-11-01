import pymc as pm
import numpy as np

def predict_load(temp, humidity, irradiance):
    with pm.Model() as model:
        temp_obs = pm.Normal("temp_obs", mu=temp, sigma=0.5)
        hum_obs = pm.Normal("hum_obs", mu=humidity, sigma=0.5)
        irr_obs = pm.Normal("irr_obs", mu=irradiance, sigma=0.5)

        load = pm.Deterministic("load", 0.3 * temp_obs + 0.4 * hum_obs + 0.3 * irr_obs)
        trace = pm.sample_prior_predictive(samples=100)

    mean = np.mean(trace["load"])
    ci = np.percentile(trace["load"], [5, 95])
    return {
        "load_prediction": round(mean, 2),
        "confidence_interval": [round(ci[0], 2), round(ci[1], 2)]
    }
