import pandas as pd
import numpy as np
import datetime
import random
import os

def generate_energy_data(num_days=180):
    start_date = datetime.datetime.now() - datetime.timedelta(days=num_days)
    
    appliances = ['AC', 'Fridge', 'Washing Machine', 'Lights', 'TV', 'Oven']
    
    # Base hourly consumption profiles (kWh per hour)
    # Different appliances have different peak hours and base usage
    profiles = {
        'AC': {'base': 1.0, 'peak_hours': [14, 15, 16, 20, 21, 22], 'peak_mult': 2.0},
        'Fridge': {'base': 0.1, 'peak_hours': [], 'peak_mult': 1.0}, # Runs 24/7 constantly
        'Washing Machine': {'base': 0.0, 'peak_hours': [9, 10, 18, 19], 'peak_mult': 1.5, 'prob': 0.3},
        'Lights': {'base': 0.05, 'peak_hours': [18, 19, 20, 21, 22, 23], 'peak_mult': 3.0},
        'TV': {'base': 0.0, 'peak_hours': [19, 20, 21, 22], 'peak_mult': 1.5, 'prob': 0.8},
        'Oven': {'base': 0.0, 'peak_hours': [12, 19, 20], 'peak_mult': 2.0, 'prob': 0.5}
    }
    
    data = []
    
    for day in range(num_days):
        current_date = start_date + datetime.timedelta(days=day)
        is_weekend = current_date.weekday() >= 5
        
        for hour in range(24):
            timestamp = current_date.replace(hour=hour, minute=0, second=0, microsecond=0)
            
            for app in appliances:
                prof = profiles[app]
                usage = prof['base']
                
                # Apply probability of usage for intermittent appliances
                if 'prob' in prof and random.random() > prof['prob']:
                    # Didn't turn on
                    if app != 'Fridge': # Fridge is always on
                        usage = 0
                else:
                    # It's on. Check if peak hour
                    if hour in prof['peak_hours'] or (is_weekend and hour in [10, 11, 12, 13, 14] and app in ['AC', 'TV']):
                        usage *= prof['peak_mult']
                        # Add some noise
                        usage += np.random.normal(0, prof['base']*0.2)
                    elif usage > 0:
                        # Add regular noise
                        usage += np.random.normal(0, prof['base']*0.1)
                
                usage = max(0, usage) # No negative energy
                
                # Introduce Anomalies (Wastage)
                # Randomly 1% chance for AC or Lights or TV to be left on all night or spike
                is_anomaly = 0
                if app == 'AC' and random.random() < 0.01:
                    usage += random.uniform(1.5, 3.5) # Spike
                    is_anomaly = 1
                elif app == 'Washing Machine' and random.random() < 0.005:
                    usage += random.uniform(1.0, 2.0)
                    is_anomaly = 1
                    
                cost_per_kwh = 0.15 # $0.15 per kWh
                cost = usage * cost_per_kwh
                
                data.append({
                    'datetime': timestamp,
                    'appliance': app,
                    'energy_consumed_kwh': round(usage, 4),
                    'cost': round(cost, 4),
                    'is_anomaly': is_anomaly # Useful for validating our ML model
                })
                
    df = pd.DataFrame(data)
    
    # Ensure directory exists
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/energy_dataset.csv', index=False)
    print(f"Generated {len(df)} records of synthetic energy data.")
    print("Saved to data/energy_dataset.csv")

if __name__ == "__main__":
    generate_energy_data()
