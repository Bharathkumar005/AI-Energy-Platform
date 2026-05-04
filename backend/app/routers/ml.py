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
model_load_errors = {}
try:
    rf_model = joblib.load(os.path.join(base_dir, 'models', 'rf_energy_model.pkl'))
    print("RF model loaded successfully")
except Exception as e:
    print(f"RF model failed to load: {e}")
    model_load_errors['rf_model'] = str(e)
    rf_model = None

try:
    iso_model = joblib.load(os.path.join(base_dir, 'models', 'iso_anomaly_model.pkl'))
    print("ISO model loaded successfully")
except Exception as e:
    print(f"ISO model failed to load: {e}")
    model_load_errors['iso_model'] = str(e)
    iso_model = None

try:
    label_encoder = joblib.load(os.path.join(base_dir, 'models', 'appliance_encoder.pkl'))
    print("Label encoder loaded successfully")
except Exception as e:
    print(f"Label encoder failed to load: {e}")
    model_load_errors['label_encoder'] = str(e)
    label_encoder = None

@router.get("/status")
def model_status():
    """Diagnostic endpoint - shows which models loaded and any errors."""
    import sklearn
    return {
        "sklearn_version": sklearn.__version__,
        "rf_model_loaded": rf_model is not None,
        "iso_model_loaded": iso_model is not None,
        "label_encoder_loaded": label_encoder is not None,
        "errors": model_load_errors,
        "model_dir": os.path.join(base_dir, 'models'),
        "model_files_exist": {
            "rf": os.path.exists(os.path.join(base_dir, 'models', 'rf_energy_model.pkl')),
            "iso": os.path.exists(os.path.join(base_dir, 'models', 'iso_anomaly_model.pkl')),
            "encoder": os.path.exists(os.path.join(base_dir, 'models', 'appliance_encoder.pkl')),
        }
    }

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
