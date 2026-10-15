
import React, { useEffect } from "react";
import Chart from "react-apexcharts";
import { climateStore } from "../stores/ClimateStore";
import { HAZARDS, localDate } from '../stores/ClimateStore';
import { observer } from 'mobx-react-lite';


const BarCharts = observer(({}) => {

    const getSeriesData = () => {
        if(climateStore.filters.hazardType != '4') {
            return  Object.values(climateStore?.dashboardData?.days_per_year)
        } else {
            let dryDays = []
            
            climateStore?.dashboardData?.long_dry_days_per_year?.forEach(element => {
                dryDays.push(element?.dry_days)
            })
            return dryDays
        }
    }
    const series = [{
        name: ``,
        data: climateStore?.dashboardData?.days_per_year ? getSeriesData() : []
    }];

    const options = {
    chart: { type: "bar", toolbar: { show: true } },
    plotOptions: {
        bar: { horizontal: false, columnWidth: "50%" }
    },
      colors: ['#FEB019', '#FF4560', '#775DD0'],

    dataLabels: { enabled: true },
    xaxis: {
        categories: climateStore?.dashboardData?.days_per_year ? Object.keys(climateStore.dashboardData.days_per_year) : [],
        title: { text: "Year" },
    },
    yaxis: {
        min: 0,
        title: { text: "Number of days" }
    }
    };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <h4 className="brand-accent p-3">{`Extreme ${HAZARDS.find((x) => climateStore.filters.hazardType == x.value)?.label} days per year` }</h4>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={450}
      />
    </div>
  );
}
)
export default BarCharts;