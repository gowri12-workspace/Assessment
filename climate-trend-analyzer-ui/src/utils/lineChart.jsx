
import React, { useEffect } from "react";
import Chart from "react-apexcharts";
import { climateStore } from "../stores/ClimateStore";
import { HAZARDS, localDate } from '../stores/ClimateStore';
import { observer } from 'mobx-react-lite';

export default function LineChart({title}) {
    useEffect(() => {

    }, [climateStore.dashboardData.dates_with_value])

    const series = [{
        name: ``,
        data: climateStore?.dashboardData?.dates_with_value ? Object.values(climateStore?.dashboardData?.dates_with_value) : []
    }];

    const options = {
    chart: { type: "line", zoom: { enabled: true } },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 4 },
    xaxis: {
        categories: climateStore?.dashboardData?.dates_with_value ? Object.keys(climateStore.dashboardData.dates_with_value) : [],
        title: { text: "Date" },
        labels: {
        show: false
      }
    },
    yaxis: {
        title: { text: `${climateStore.filters.hazardType == 1 ? "Temperature (°C)" : "Precipation (in mm)"}`} 
    },
    tooltip: {
        y: { formatter: value => climateStore.filters.hazardType == 1 ? `${value} °C` : `${value} in mm` }
    }
    };


  return (
    <div style={{ width: "100%" }}>
      <h4 className="brand-accent p-3">{`Extreme ${HAZARDS.find((x) => climateStore.filters.hazardType == x.value)?.label} days`}</h4>
      <Chart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
}
