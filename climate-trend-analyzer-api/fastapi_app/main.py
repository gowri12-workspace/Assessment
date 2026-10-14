from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import os
from datetime import date
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from fastapi import FastAPI, Query, HTTPException, Path
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from typing import List, Optional

import pandas as pd
import numpy as np

from helper import calculateClimateHazardBasedOnType
from helper import HazardType
import requests

app = FastAPI()
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL") 
DB_NAME = os.getenv("DB_NAME") 
COLLECTION_NAME = os.getenv("COLLECTION_NAME")  # Assuming a collection name
REGION_COLLECTION_NAME = os.getenv("MASTER_DATA_COLLECTION", "city")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]
region_collection = db[REGION_COLLECTION_NAME]

WEATHER_API_URL = "https://archive-api.open-meteo.com/v1/archive"
WEATHER_API_TIMEOUT = 30
DAILY_WEATHER_FIELDS = (
    "temperature_2m_max", "precipitation_sum",
    "wind_speed_10m_max", "wind_gusts_10m_max",
)

def fetch_weather_data(latitude, longitude):
    params = urlencode({
        "latitude": latitude,
        "longitude": longitude,
        "start_date": "1990-01-01",
        "end_date": "2026-10-10",
        "daily": ",".join(DAILY_WEATHER_FIELDS),
        "temperature_unit": "celsius",
        "wind_speed_unit": "kmh",
        "precipitation_unit": "mm",
    })

    try:
        print(f"{WEATHER_API_URL}?{params}")
        response = requests.get(f"{WEATHER_API_URL}?{params}")
        print(response.status_code)
        document = {
            "latitude": latitude,
            "longitude": longitude,
            "weather_data": response.json()  # Include the entire JSON object
        }

        try:
            # Insert document into MongoDB
            collection.insert_one(document)
            print(f"Inserted document")
        except PyMongoError as e:
            print(f"Failed to insert document {str(e)}")


        return document
    except Exception as e:
        # Captures any other unexpected exceptions
        print(f"An unexpected error occurred: {e}")        
        raise HTTPException(status_code=400, detail="Error Occured")

@app.get("/getRegion")
def get_region():
    """Return all city master records, ordered by city name."""
    try:
        return list(region_collection.find({}, {"_id": 0}).sort("city", 1))
    except PyMongoError as exc:
        logger.exception("Unable to fetch city master data from MongoDB")
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch region data. Please try again later.",
        ) from exc

## Filter data based on custom start date and end date
def filter_by_date(data, start, end):
    daily = data["daily"]
    keep = [i for i, d in enumerate(daily["time"]) if start <= d <= end]
    filtered = dict(data)
    filtered["daily"] = {k: [v[i] for i in keep] for k, v in daily.items()}
    return filtered

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/historicData/{city}/{latitude}/{longitude}/{hazardType}/{startDate}/{endDate}")
async def get_historic_data(
    city: str = Path(..., min_length=1),
    latitude: float = Path(..., ge=-90, le=90),
    longitude: float = Path(..., ge=-180, le=180),
    hazardType: HazardType = Path(...),
    startDate: str = Path(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    endDate: str = Path(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
):

    query = {
        "latitude": latitude,
        "longitude": longitude
    }
    
    record = collection.find_one(query)

    if not record:
        record = fetch_weather_data(latitude, longitude)

    report = record["weather_data"]

    ## STEP 1. Filter data using dates.
    data = filter_by_date(report, startDate, endDate)
    # print(data)

    report = record["weather_data"]

    ## STEP 1. Filter data using dates.
    data = filter_by_date(report, startDate, endDate)
    if not data["daily"]["time"]:
        raise HTTPException(status_code=404, detail="No weather data found for the requested dates.")

    df = pd.DataFrame({
        "date":   pd.to_datetime(data["daily"]["time"]),
        "tempMax":   data["daily"]["temperature_2m_max"],
        "precip": data["daily"]["precipitation_sum"],
        "wind":   data["daily"]["wind_speed_10m_max"],
        "gust":   data["daily"]["wind_gusts_10m_max"],  
    })

    return calculateClimateHazardBasedOnType(hazardType, df)
