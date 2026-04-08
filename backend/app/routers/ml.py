from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os
from datetime import datetime

router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)

# Load Models Safely
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
try:
    rf_model = joblib.load(os.path.join(base_dir, 'models', 'rf_energy_model.pkl'))
    iso_model = joblib.load(os.path.join(base_dir, 'models', 'iso_anomaly_model.pkl'))
    label_encoder = joblib.load(os.path.join(base_dir, 'models', 'appliance_encoder.pkl'))
except Exception as e:
    print(f"Error loading models: {e}. Check if you ran the notebook/training script.")
    rf_model, iso_model, label_encoder = None, None, None

class PredictionRequest(BaseModel):
    appliance: str
    target_date: str # format: YYYY-MM-DDTHH:MM:SS

@router.post("/predict")
def predict_energy(request: PredictionRequest):
    """
    Predict future energy consumption based on ML Random Forest Model.
    """
    if rf_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")
        
    try:
        dt = pd.to_datetime(request.target_date)
        hour = dt.hour
        day_of_week = dt.dayofweek
        month = dt.month
        is_weekend = 1 if day_of_week >= 5 else 0
        
        # Encode categorical appliance
        try:
            app_encoded = label_encoder.transform([request.appliance])[0]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid appliance name.")

        # Match exactly the features used in model training: ['hour', 'day_of_week', 'month', 'is_weekend', 'appliance_encoded']
        features = pd.DataFrame([{
            'hour': hour,
            'day_of_week': day_of_week,
            'month': month,
            'is_weekend': is_weekend,
            'appliance_encoded': app_encoded
        }])
        
        prediction = rf_model.predict(features)[0]
        
        return {
            "appliance": request.appliance,
            "datetime": request.target_date,
            "predicted_kwh": round(prediction, 4),
            "estimated_cost": round(prediction * 0.15, 4) # Hardcoded rate for now
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AnomalyCheckRequest(BaseModel):
    appliance: str
    current_kwh: float
    hour: int

@router.post("/check-anomaly")
def check_anomaly(request: AnomalyCheckRequest):
    """
    Dynamically check if current real-time usage constitutes an anomaly (energy waste).
    """
    if iso_model is None:
        raise HTTPException(status_code=500, detail="Model not loaded.")
        
    try:
        app_encoded = label_encoder.transform([request.appliance])[0]
        
        # Features used for Isolation Forest: ['hour', 'appliance_encoded', 'energy_consumed_kwh']
        features = pd.DataFrame([{
            'hour': request.hour,
            'appliance_encoded': app_encoded,
            'energy_consumed_kwh': request.current_kwh
        }])
        
        result = iso_model.predict(features)[0]
        
        # Isolation forest returns 1 for inliers, -1 for outliers
        is_anomaly = True if result == -1 else False
        
        return {
            "appliance": request.appliance,
            "kwh_usage": request.current_kwh,
            "is_anomaly": is_anomaly,
            "message": "Potential wastage detected!" if is_anomaly else "Normal usage."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
