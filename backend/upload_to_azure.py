import os
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
CONTAINER_NAME = "energy-data"
FILE_PATH = "../data/energy_dataset.csv"
BLOB_NAME = "energy_dataset.csv"

def upload_to_blob():
    if not AZURE_CONNECTION_STRING:
        print("ERROR: Please set AZURE_STORAGE_CONNECTION_STRING in your backend/.env file.")
        print("You can get this from the Azure Portal -> Storage Accounts -> Access keys.")
        return

    try:
        print(f"Connecting to Azure Storage...")
        blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
        
        # Create container if it doesn't exist
        container_client = blob_service_client.get_container_client(CONTAINER_NAME)
        if not container_client.exists():
            container_client.create_container()
            print(f"Created container: {CONTAINER_NAME}")
            
        blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=BLOB_NAME)
        
        print(f"Uploading {FILE_PATH} to container '{CONTAINER_NAME}' as '{BLOB_NAME}'...")
        with open(FILE_PATH, "rb") as data:
            blob_client.upload_blob(data, overwrite=True)
            
        print("✅ Successfully uploaded to Azure Blob Storage!")
        
    except Exception as e:
        print(f"❌ Error uploading to Azure Blob Storage: {e}")

if __name__ == "__main__":
    upload_to_blob()
