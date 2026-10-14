
**Setup steps**
> React - Clone the repository, npm install && npm start // need env values

> Python - Clone the repository; pip install -r requirements.txt; uvicorn main:app --reload // Need env values

> **Data source**

1. Historic weather data - https://open-meteo.com/
2. City/State/country - ChatGPT

> **Assumptions**
1. Created master city/state/country data (only for india, infrastructure limitation) with proper latitude and longitude through scheduler job. User might enter wrong spell for cities/region.
2. Historic data is restricted between 1990-01-01 to 2026-01-01 due to data size and free tier deployments.

> **Logic**

*Master data:*
1. Downloaded open source data.
2. Assumption: I have used only India region, but can be extended to add other regions.
3. Created python function which reads from new folder, does data processing and inserts to db.

*Loading historic data:*
1. For the first, api makes call to external service and dump records to our db.

*Calculating wind:*
wind_speed_10m_max - Highest daily value of wind speed above 10m from ground level (sustained wind). 
wind_gusts_10m_max - Highest duration of burst wind above 10m from ground level.

Found the threshold gust value by calculating 95 percentile of the wind_gusts_10m_max and filtered value above threshold.

Performed aggregation and grouping on top of the result.

*Calculating heat:*
temperature_2m_max - Highest daily air temperature at 2m above ground level (°C).

Found the threshold temperature by calculating the 90th percentile of temperature_2m_max for each calendar month over the baseline years (1990-2020), and filtered the days above it as hot days.

Performed aggregation and grouping (hot days per month and year) on top of the result.

*Calculating heatwaves:*
temperature_2m_max - Same daily maximum temperature, used with the hot day threshold above.

Marked a heatwave when 3 or more hot days occurred in a row. Grouped consecutive hot days into events and calculated the start, end, duration and peak temperature of each event.

Performed aggregation and grouping (number of events, average and longest duration per year) on top of the result, then ran rolling average and regression to get the trend.

*Calculating rainfall:*
precipitation_sum - Total daily precipitation (mm).
precipitation_hours - Number of hours with precipitation in a day.

Marked a wet day when precipitation_sum was more than 1 mm. Found the heavy rain threshold by calculating the 95th percentile of precipitation_sum on wet days only, and filtered the days above it.

Performed aggregation and grouping (wet days, total rainfall and heavy rain days per month and year) on top of the result.

*Calculating drought:*
precipitation_sum - Total daily precipitation (mm).

Marked a dry day when precipitation_sum was 1 mm or less. Grouped consecutive dry days into dry spells, and treated spells of 14 days or more as drought days.

Performed aggregation and grouping (number of long spells, drought days and longest spell per month and year) on top of the result.

*Loading historic data:*
1. For the first, api makes call to external service and dump records to our db.

*Calculating heat:*
wind_speed_10m_max - Highest daily value of wind speed above 10m from ground level (sustained wind). 
wind_gusts_10m_max - Highest duration of burst wind above 10m from ground level.

Found the threshold gust value by calculating 95 percentile of the wind_gusts_10m_max and filtered value above threshold.

Performed aggregation and grouping on top of the result.

> **AI Tools**

Used ChatGPT and OpenAI Api for following purposes:
 1. Understanding domain entities and how each hazard is calculated on the mathematical front.
 2. Explored how UX designs and curate dashboard view for multiple hazard type.

> **what you would improve with more time**
1. Add caching layer when database call becomes expensive.
2. Add Prediction model based previous trends using machine learning models.
2. Integrate with LLM to get data insights/summary.
4. Improve performance bby optimazing queries, calls.
5. Adding obversability.