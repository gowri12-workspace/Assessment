import os
import json
from pymongo import MongoClient
from pymongo.errors import PyMongoError

CONFIG = {
    "mongo_url": os.getenv("MONGO_URL"),
    "db_name": os.getenv("MASTER_DB"), 
    "collection_name": os.getenv("CLIMATE_DATA_COLLECTION")
}

def import_json_data():
    # MongoDB configuration
    client = MongoClient(CONFIG["mongo_url"])
    db = client[CONFIG["db_name"]]
    collection = db[CONFIG["collection_name"]]

    json_dir = "./test-data"
    
    # Loop through the directory of JSON files
    for file_name in os.listdir(json_dir):
        if file_name.endswith('.json'):
            print("Found file")
            file_path = os.path.join(json_dir, file_name)
            with open(file_path, 'r') as json_file:
                data = json.load(json_file)
                
                # Build the document and extract latitude and longitude
                latitude = data.get("latitude")
                longitude = data.get("longitude")
                
                document = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "weather_data": data  # Include the entire JSON object
                }

                try:
                    # Insert document into MongoDB
                    collection.insert_one(document)
                    print(f"Inserted document from {file_name}")
                except PyMongoError as e:
                    print(f"Failed to insert document from {file_name}: {str(e)}")


if __name__ == "__main__":
    import_json_data()