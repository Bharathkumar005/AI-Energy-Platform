import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error
import joblib
import os

def train_and_save_models():
    print("Loading dataset from local storage...")
    df = pd.read_csv('../data/energy_dataset.csv')
    df['datetime'] = pd.to_datetime(df['datetime'])
    
    print("Applying Feature Engineering...")
    # Extract temporal features
    df['hour'] = df['datetime'].dt.hour
    df['day_of_week'] = df['datetime'].dt.dayofweek
    df['month'] = df['datetime'].dt.month
    df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
    
    # Encode categorical appliance names to numerical values
    le = LabelEncoder()
    df['appliance_encoded'] = le.fit_transform(df['appliance'])
    
    # Save the label encoder so the backend API can use it to encode user inputs
    os.makedirs('../backend/app/models', exist_ok=True)
    joblib.dump(le, '../backend/app/models/appliance_encoder.pkl')
    print("Label Encoder saved -> backend/app/models/appliance_encoder.pkl")
    
    print("\n--- 1. Training Random Forest (Energy Prediction) ---")
    features = ['hour', 'day_of_week', 'month', 'is_weekend', 'appliance_encoded']
    X = df[features]
    y = df['energy_consumed_kwh']
    
    # Splitting data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Training the Random Forest Regressor
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    
    # Evaluating the model
    y_pred = rf_model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    print(f"✅ Random Forest Model Evaluated - MSE: {mse:.4f}, MAE: {mae:.4f}")
    
    joblib.dump(rf_model, '../backend/app/models/rf_energy_model.pkl')
    print("Random Forest model saved -> backend/app/models/rf_energy_model.pkl")
    
    print("\n--- 2. Training Isolation Forest (Anomaly Detection) ---")
    # For anomaly detection, we want to look at energy used by an appliance at a specific hour
    iso_features = ['hour', 'appliance_encoded', 'energy_consumed_kwh']
    X_iso = df[iso_features]
    
    # 'contamination' is the expected proportion of outliers (we generated roughly ~1.5% anomalies)
    iso_model = IsolationForest(contamination=0.015, random_state=42, n_jobs=-1)
    iso_model.fit(X_iso)
    
    # Predict anomalies on the same dataset just to evaluate
    df['predicted_anomaly'] = iso_model.predict(X_iso)
    
    # IsolationForest outputs -1 for anomalies and 1 for inliers
    anomalies_detected = len(df[df['predicted_anomaly'] == -1])
    print(f"✅ Isolation Forest flagged {anomalies_detected} data points as anomalies out of {len(df)} total.")
    
    joblib.dump(iso_model, '../backend/app/models/iso_anomaly_model.pkl')
    print("Isolation Forest model saved -> backend/app/models/iso_anomaly_model.pkl")

if __name__ == "__main__":
    train_and_save_models()
