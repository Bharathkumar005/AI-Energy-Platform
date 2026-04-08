from fastapi import APIRouter
from app.services.data_service import get_energy_data

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

@router.get("/summary")
def get_dashboard_summary():
    """
    Returns high-level statistics:
    - Total Energy Consumed Today (kWh)
    - Estimated Bill
    - Highest Consuming Appliance
    """
    df = get_energy_data()
    if df.empty:
        return {"error": "Data unavailable"}
        
    last_date = df['date'].max()
    today_data = df[df['date'] == last_date]
    
    total_energy = today_data['energy_consumed_kwh'].sum()
    total_cost = today_data['cost'].sum()
    
    # Appliance breakdown
    appliance_stats = today_data.groupby('appliance')['energy_consumed_kwh'].sum().reset_index()
    top_consumer = appliance_stats.loc[appliance_stats['energy_consumed_kwh'].idxmax()]
    
    return {
        "date": str(last_date),
        "total_energy_kwh": round(total_energy, 2),
        "total_cost_usd": round(total_cost, 2),
        "top_consumer_appliance": top_consumer['appliance'],
        "top_consumer_kwh": round(top_consumer['energy_consumed_kwh'], 2)
    }

@router.get("/hourly")
def get_hourly_usage():
    """
    Returns average usage per hour (across the dataset) for plotting line charts.
    """
    df = get_energy_data()
    if df.empty:
        return []
        
    hourly_avg = df.groupby('hour')['energy_consumed_kwh'].mean().reset_index()
    return hourly_avg.to_dict(orient="records")

@router.get("/appliances")
def get_appliance_usage():
    """
    Returns total energy used grouped by appliance for pie charts.
    """
    df = get_energy_data()
    if df.empty:
        return []
        
    appliance_totals = df.groupby('appliance')[['energy_consumed_kwh', 'cost']].sum().reset_index()
    return appliance_totals.to_dict(orient="records")
