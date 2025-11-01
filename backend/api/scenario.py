# backend/fastapi/scenario.py

def run_scenario(params):
    scenario = params.get("type", "normal")
    
    if scenario == "rain":
        decision = "Switch to battery"
    elif scenario == "high_load":
        decision = "Activate demand response"
    else:
        decision = "Maintain grid"

    return {
        "decision": decision,
        "battery_action": "Charge" if decision == "Switch to battery" else "Idle",
        "response_time": "0.5s"
    }
