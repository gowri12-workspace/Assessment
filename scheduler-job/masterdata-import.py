import pandas as pd  # Add this import for pandas functionality

"""
Load city CSV files from a "new" folder into MongoDB, then move each
processed file to a "processed" folder.

Install:  pip install pymongo
Run:      python csv_to_mongo.py

Configuration (environment variables, defaults shown):
    MONGO_URL         mongodb://localhost:27017
    MONGO_DB          geo_data
    MONGO_COLLECTION  cities
    NEW_DIR           new
    PROCESSED_DIR     processed
    BATCH_SIZE        1000

Expected CSV columns: city, lat, lng, country, iso2, admin_name
"""

import csv
import logging
import os
import shutil
import unicodedata
from datetime import datetime
from pathlib import Path

from pymongo import MongoClient
from pymongo.errors import PyMongoError

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
CONFIG = {
    "mongo_url": os.getenv("MONGO_URL"),
    "db_name": os.getenv("MASTER_DB"), 
    "collection_name": os.getenv("MASTER_DATA_COLLECTION"),
    "new_dir": "./new",
    "processed_dir": "./processed",
    "batch_size": 1000
}

# CSV column -> MongoDB field
FIELD_MAP = {
    "city": "city",
    "lat": "latitude",
    "lng": "longitude",
    "country": "country",
    "iso2": "code",
    "admin_name": "state",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("csv_to_mongo")

# Characters that do not split into base letter + accent under Unicode
# normalisation, so they need an explicit replacement.
SPECIAL_MAP = str.maketrans({
    "ł": "l", "Ł": "L", "ø": "o", "Ø": "O", "đ": "d", "Đ": "D",
    "ß": "ss", "æ": "ae", "Æ": "AE", "œ": "oe", "Œ": "OE",
    "þ": "th", "Þ": "Th", "ð": "d", "Ð": "D", "ı": "i",
    "’": "'", "‘": "'", "–": "-", "—": "-",
})


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def clean_text(value):
    """Remove accents and special characters: 'Mahārāshtra' -> 'Maharashtra'."""
    if value is None:
        return ""
    text = str(value).translate(SPECIAL_MAP)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.encode("ascii", "ignore").decode("ascii")
    return " ".join(text.split())  # trim and collapse extra spaces


def to_float(value):
    try:
        return float(str(value).strip())
    except (TypeError, ValueError):
        return None


def build_document(row):
    """Convert one CSV row to a MongoDB document. Returns None if invalid."""
    city = clean_text(row.get("city"))
    lat = to_float(row.get("lat"))
    lng = to_float(row.get("lng"))

    if not city or lat is None or lng is None:
        return None
    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None

    return {
        FIELD_MAP["city"]: city,
        FIELD_MAP["lat"]: lat,
        FIELD_MAP["lng"]: lng,
        FIELD_MAP["country"]: clean_text(row.get("country")),
        FIELD_MAP["iso2"]: clean_text(row.get("iso2")).upper(),
        FIELD_MAP["admin_name"]: clean_text(row.get("admin_name")),
    }


def import_data_from_csv():
    # Connect to MongoDB
    client = MongoClient(CONFIG["mongo_url"])
    db = client[CONFIG["db_name"]]
    collection = db[CONFIG["collection_name"]]
    
    new_dir = CONFIG["new_dir"]
    
    # Loop through the folder and read each CSV file
    for file_name in os.listdir(new_dir):
        if file_name.endswith('.csv'):
            file_path = os.path.join(new_dir, file_name)
            df = pd.read_csv(file_path)
            
            # Select needed columns and rename them
            records = []
            for index, row in df.iterrows():
                document = build_document(row)
                if document:  # Check if document is not None
                    records.append(document)            
            # Insert records into MongoDB
            if records:
                collection.insert_many(records)
                print(f"Inserted {len(records)} records from {file_name}")
                
            # Move processed file to processed folder
            processed_path = os.path.join(CONFIG["processed_dir"], file_name)
            shutil.move(file_path, processed_path)

    print("Data import completed.")


if __name__ == "__main__":
    import_data_from_csv()