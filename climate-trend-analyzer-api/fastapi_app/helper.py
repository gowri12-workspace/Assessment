from enum import IntEnum
import numpy as np
import pandas as pd
import datetime as dt
from sklearn.linear_model import LinearRegression

class HazardType(IntEnum):
    HEAT = 1
    WINDY = 2
    RAINFALL = 3
    DROUGHT = 4

def calculateClimateHazardBasedOnType(hazardType, df):
    match hazardType:
        case HazardType.HEAT:
            return calculateHeatDays(df)
        case HazardType.WINDY:
            return calculateWindyDays(df)
        case HazardType.RAINFALL:
            return calculateRainyDays(df)
        case _:
            return calculateDroughtDays(df)

def calculateHeatDays(df):
    print("****** Calculating heat days**************")
    heat_th = np.percentile(df["tempMax"], 95) 
    heat_average = np.percentile(df["tempMax"], 50) 

    df["average_hot"] = df["tempMax"] > heat_average
    df["hot"] = df["tempMax"] > heat_th

    average_hot_days = df[df["average_hot"]] 
    hot_days = df[df["hot"]] 

    # List out dates
    hot_dates = hot_days["date"].dt.strftime("%Y-%m-%d").tolist()

    # aggregate for a month by grouping
    hot_days.groupby(hot_days["date"].dt.to_period("M")).size()
    hot_days_per_month = { str(k): int(v) for k, v in (hot_days.groupby(hot_days["date"].dt.to_period("M")).size()).items() }

    # aggreagate for a year
    hot_days_per_year = df.groupby(df["date"].dt.year)["hot"].sum()

    # heatwave = 3+ consecutive hot days
    df["grp"] = (df["hot"] != df["hot"].shift()).cumsum()
    long_hot_days = df[df["hot"]].groupby("grp").agg(start=("date", "min"), end=("date", "max"), days=("date", "size"))

    long_hot_days["start"] = long_hot_days["start"].dt.strftime("%Y-%m-%d")
    long_hot_days["end"]   = long_hot_days["end"].dt.strftime("%Y-%m-%d")

    heatwaves = long_hot_days[long_hot_days["days"] >= 3]

    # Linear regression to analyze trends
    df.reset_index(drop=True, inplace=True)
    X = np.array(range(len(df))).reshape(-1, 1)  # Creating a simple range for x-axis
    y = df['hot'].astype(int).values  # Hot days as integer values
    model = LinearRegression()
    model.fit(X, y)
    trend = model.predict(X)

    # Add trendline back to DataFrame
    df['trend'] = trend

    ## summary.
    maxHeat = hot_days["tempMax"].max()
    minHeat = df["tempMax"].min()

    minDate = df.loc[df["tempMax"].idxmin()].date
    maxDate = hot_days.loc[hot_days["tempMax"].idxmax()].date

    percentageDifference = ((maxHeat - minHeat) / maxHeat) * 100
    
    summary = f'Heatwaves are increased by {round(percentageDifference)}% '
    if minDate > maxDate:
        summary += f'between {df.loc[df["tempMax"].idxmin()].date.strftime("%B %d, %Y")} and {hot_days.loc[hot_days["tempMax"].idxmin()].date.strftime("%B %d, %Y")}'
    else:
        summary += f'during {hot_days.loc[hot_days["tempMax"].idxmax()].date.strftime("%B %d, %Y")}'

    print(summary)
    return { 
        "heatwaves": heatwaves.to_dict("records"),
        "average_dates": dict(zip(
                average_hot_days["date"].dt.strftime("%Y-%m-%d"),
                average_hot_days["tempMax"]
            )), 
        "dates": hot_dates,
        "dates_with_value": dict(zip(
                hot_days["date"].dt.strftime("%Y-%m-%d"),
                hot_days["tempMax"]
            )), 
        "days_per_month": hot_days_per_month,
        "days_per_year": { str(k): int(v) for k, v in hot_days_per_year.items() },
        "summary": summary,
        "trend": pd.Series(df.trend.values, index=df.date.dt.strftime("%Y-%m-%d")).to_dict()
    }

def calculateWindyDays(df):
    print("******Calculating windy days**************")
    gust_th = np.percentile(df["gust"], 95) 
    gust_average = np.percentile(df["gust"], 50) 

    df["windy"] = df["gust"] > gust_th
    df["average_windy"] = df["gust"] > gust_average

    windy_days = df[df["windy"]] 
    average_windy_days = df[df["average_windy"]] 
    # List out dates
    windy_dates = windy_days["date"].dt.strftime("%Y-%m-%d").tolist()

    # aggregate for a month by grouping
    windy_days.groupby(windy_days["date"].dt.to_period("M")).size()
    windy_days_per_month = { str(k): int(v) for k, v in (windy_days.groupby(windy_days["date"].dt.to_period("M")).size()).items() }

    # aggreagate for a year
    windy_days_per_year = df.groupby(df["date"].dt.year)["windy"].sum()

    # Linear regression
    df.reset_index(drop=True, inplace=True)
    X = np.array(range(len(df))).reshape(-1, 1)
    y = df['windy'].astype(int).values
    model = LinearRegression()
    model.fit(X, y)
    trend = model.predict(X)
    
    # Add trendline back to DataFrame
    df['windy_trend'] = trend

    ## summary.
    maxWind = windy_days["gust"].max()
    minWind = df["gust"].min()

    minDate = df.loc[df["gust"].idxmin()].date
    maxDate = windy_days.loc[windy_days["gust"].idxmax()].date

    percentageDifference = ((maxWind - minWind) / maxWind) * 100
    
    summary = f'Wind speed is increased by {round(percentageDifference)}% '
    if minDate > maxDate:
        summary += f'between {windy_days.loc[windy_days["gust"].idxmax()].date.strftime("%B %d, %Y")} and {df.loc[df["gust"].idxmin()].date.strftime("%B %d, %Y")}'
    else:
        summary += f'during {windy_days.loc[windy_days["gust"].idxmax()].date.strftime("%B %d, %Y")}'

    return { 
        "average_dates": dict(zip(
                average_windy_days["date"].dt.strftime("%Y-%m-%d"),
                average_windy_days["gust"]
            )), 
        "dates": windy_dates,
        "dates_with_value": dict(zip(
                windy_days["date"].dt.strftime("%Y-%m-%d"),
                windy_days["gust"]
            )), 
        "days_per_month": windy_days_per_month,
        "days_per_year": { str(k): int(v) for k, v in windy_days_per_year.items() },
        "summary": summary,
        "trend": trend.tolist()
    }

def calculateRainyDays(df):
    print("******Calculating rainy days**************")
    precipitation_th = np.percentile(df["precip"], 95) 
    df["wet"] = df["precip"] > 1
    df["rainy"] = df["precip"] > precipitation_th

    rainy_days = df[df["rainy"]] 
    wet_days = df[df["wet"]] 
    # List out dates
    rainy_dates = rainy_days["date"].dt.strftime("%Y-%m-%d").tolist()

    # aggregate for a month by grouping
    rainy_days.groupby(rainy_days["date"].dt.to_period("M")).size()
    rainy_days_per_month = { str(k): int(v) for k, v in (rainy_days.groupby(rainy_days["date"].dt.to_period("M")).size()).items() }

    # aggreagate for a year
    rainy_days_per_year = df.groupby(df["date"].dt.year)["rainy"].sum()

    # Linear regression
    df.reset_index(drop=True, inplace=True)
    X = np.array(range(len(df))).reshape(-1, 1)
    y = df['rainy'].astype(int).values
    model = LinearRegression()
    model.fit(X, y)
    trend = model.predict(X)
    
    # Add trendline back to DataFrame
    df['rainy_trend'] = trend

    ## summary.
    maxWet = wet_days["precip"].max()
    minWet = wet_days["precip"].min()

    minDate = wet_days.loc[wet_days["precip"].idxmin()].date
    maxDate = wet_days.loc[wet_days["precip"].idxmax()].date

    percentageDifference = ((maxWet - minWet) / maxWet) * 100
    
    summary = f'Rainfall is increased by {round(percentageDifference)}% '
    if minDate > maxDate:
        summary += f'between {wet_days.loc[wet_days["precip"].idxmax()].date.strftime("%B %d, %Y")} and {wet_days.loc[wet_days["precip"].idxmin()].date.strftime("%B %d,, %Y")}'
    else:
        summary += f'during {wet_days.loc[wet_days["precip"].idxmax()].date.strftime("%B %d, %Y")}'


    return { 
        "average_dates": dict(zip(
                wet_days["date"].dt.strftime("%Y-%m-%d"),
                wet_days["precip"]
            )), 
        "dates": rainy_dates,
        "dates_with_value": dict(zip(
                rainy_days["date"].dt.strftime("%Y-%m-%d"),
                rainy_days["precip"]
            )), 
        "days_per_month": rainy_days_per_month,
        "days_per_year": { str(k): int(v) for k, v in rainy_days_per_year.items() },
        "trend": trend.tolist()
    }

def calculateDroughtDays(df):
    print("******Calculating Drought days**************")
    MIN_DAYS = 5
    df["wet"] = df["precip"] > 1
    df["dry"] = ~df["wet"]

    df["grp"] = (df["dry"] != df["dry"].shift()).cumsum()

    group_by_dry_dates = (df[df["dry"]]
          .groupby("grp")
          .agg(start=("date", "min"), end=("date", "max"), days=("date", "size"))
          .reset_index(drop=True))

    long_dry_days = group_by_dry_dates[group_by_dry_dates["days"] >= MIN_DAYS]

    long_dry_days["year"]  = long_dry_days["start"].dt.year
    long_dry_days["month"] = long_dry_days["start"].dt.strftime("%Y-%m")

    long_dry_days_by_month = long_dry_days.groupby("month").agg(
        dry_days=("days", "size"),       # number of long spells
        longest=("days", "max"),  
        month=("month","max")
    )

    long_dry_days_by_year = long_dry_days.groupby("year").agg(
        dry_days=("days", "size"),
        longest=("days", "max"),
        year=("year", "max")
    )

    long_dry_days["start"] = long_dry_days["start"].dt.strftime("%Y-%m-%d")
    long_dry_days["end"]   = long_dry_days["end"].dt.strftime("%Y-%m-%d")

    longest = long_dry_days.loc[long_dry_days["days"].idxmax()]
    print(longest)
    summary = f"Longest droughts have ocurred for {longest.days} days between {longest.start} and {longest.end}."
    # and {long_dry_days.loc[long_dry_days["days"].idmax()].end.strftime("%Y-%m-%d")} for {long_dry_days.loc[long_dry_days["days"].idmax()].days} days"
 
    # Linear regression
    df.reset_index(drop=True, inplace=True)
    X = np.array(range(len(df))).reshape(-1, 1)
    y = df['dry'].astype(int).values
    model = LinearRegression()
    model.fit(X, y)
    trend = model.predict(X)
    
    # Add trendline back to DataFrame
    df['drought_trend'] = trend

    return { 
        "long_dry_days": long_dry_days.to_dict("records"),
        "long_dry_days_by_month": long_dry_days_by_month.to_dict("records"),
        "long_dry_days_per_year": long_dry_days_by_year.to_dict("records"),
        "summary": summary,
        "trend": trend.tolist()
    }
