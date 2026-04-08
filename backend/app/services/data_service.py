import os
import pandas as pd
from io import BytesIO
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

load_dotenv()

AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = "energy-data"
BLOB_NAME = "energy_dataset.csv"

# Absolute path to the local CSV fallback - goes up from backend/app/services/ -> project root -> data/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
LOCAL_CSV_PATH = os.path.join(BASE_DIR, 'data', 'energy_dataset.csv')

# In-memory cache for the data so we do not hit Azure Storage on every single API request
_cached_data = None

def get_energy_data() -> pd.DataFrame:
    """
    Downloads the dataset from Azure Blob Storage and returns it as a Pandas DataFrame.
    Uses in-memory caching to improve API response times.
    Falls back to local CSV if Azure is unavailable.
    """
    global _cached_data
    if _cached_data is not None:
        return _cached_data.copy()

    try:
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=BLOB_NAME)
        
        # Download blob content into memory
        download_stream = blob_client.download_blob()
        raw_data = download_stream.readall()
        
        # Load into Pandas
        df = pd.read_csv(BytesIO(raw_data))
        df['datetime'] = pd.to_datetime(df['datetime'])
        
        # Add temporal features for easier querying
        df['hour'] = df['datetime'].dt.hour
        df['day_of_week'] = df['datetime'].dt.dayofweek
        df['month'] = df['datetime'].dt.month
        df['date'] = df['datetime'].dt.date
        
        _cached_data = df
        print("✅ Data loaded successfully from Azure Blob Storage.")
        return df.copy()
        
    except Exception as e:
        print(f"⚠️  Azure Blob Storage unavailable: {e}")
        # Fallback to local file for development if Azure is unavailable
        try:
            print(f"📂 Falling back to local file: {LOCAL_CSV_PATH}")
            df = pd.read_csv(LOCAL_CSV_PATH)
            df['datetime'] = pd.to_datetime(df['datetime'])
            df['hour'] = df['datetime'].dt.hour
            df['day_of_week'] = df['datetime'].dt.dayofweek
            df['month'] = df['datetime'].dt.month
            df['date'] = df['datetime'].dt.date
            _cached_data = df
            print(f"✅ Local fallback loaded successfully. {len(df)} rows.")
            return df.copy()
        except Exception as e2:
            print(f"❌ Local fallback also failed: {e2}")
            return pd.DataFrame()

