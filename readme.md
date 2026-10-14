Created UX for the given problem statement using cline connected to Open AI api.

Master data:
1. Downloaded open source data.
2. Assumption: I have used only India region, but can be extended to add other regions.
3. Created python function which reads from new folder, does data processing and inserts to db.


Calculating wind:
wind_speed_10m_max - Highest daily value of wind speed above 10m from ground level (sustained wind). 
wind_gusts_10m_max - Highest duration of burst wind above 10m from ground level.

Found the threshold gust value by calculating 95 percentile of the wind_gusts_10m_max and filtered value above threshold.

Performedd aggregation and grouping on top of the result.
