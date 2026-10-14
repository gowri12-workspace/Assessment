
import React, { useEffect } from "react";
import Chart from "react-apexcharts";
import { climateStore } from "../stores/ClimateStore";
import { HAZARDS, localDate } from '../stores/ClimateStore';
import { observer } from 'mobx-react-lite';


const ScatterPlot = observer(({}) => {
    const series = [{
        name: ``,
        data: climateStore?.dashboardData?.dates_with_value ? Object.values(climateStore?.dashboardData?.dates_with_value) : []
    }];

    const options = {
    chart: { type: "scatter", toolbar: { show: true } },
    color: ["#775DD0"],
    plotOptions: {
        bar: { horizontal: false, columnWidth: "50%" }
    },
    dataLabels: { enabled: true },
    xaxis: {
        categories: climateStore?.dashboardData?.dates_with_value ? Object.keys(climateStore.dashboardData.dates_with_value) : [],
        title: { text: "Month" },
        labels: {
            show: false
        }
    },
    yaxis: {
        min: 0,
        title: { text: "Number of days" }
    }
    };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h4 className="brand-accent p-3">{`Extreme ${HAZARDS.find((x) => climateStore.filters.hazardType == x.value)?.label} days per month` }</h4>
      <Chart
        options={options}
        series={series}
        type="scatter"
        height={450}
      />
    </div>
  );
}
)
export default ScatterPlot;