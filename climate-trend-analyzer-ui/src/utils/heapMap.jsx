import { useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { climateStore } from '../stores/ClimateStore';
import { observer } from 'mobx-react-lite';


const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const COLOR_RANGES = {
  count: [
    { from: 0,  to: 0,   name: 'None',     color: '#eef1ef' },
    { from: 1,  to: 2,   name: '1–2 days', color: '#fde68a' },
    { from: 3,  to: 5,   name: '3–5 days', color: '#fb923c' },
    { from: 6,  to: 10,  name: '6–10 days',color: '#ef4444' },
    { from: 11, to: 31,  name: '11+ days', color: '#7f1d1d' },
  ],
  max: [
    { from: 0,  to: 0,    name: 'Below 34°C', color: '#eef1ef' },
    { from: 34, to: 35.9, name: '34–36°C',    color: '#fde68a' },
    { from: 36, to: 37.9, name: '36–38°C',    color: '#fb923c' },
    { from: 38, to: 39.9, name: '38–40°C',    color: '#ef4444' },
    { from: 40, to: 60,   name: '40°C+',      color: '#7f1d1d' },
  ],
};

function buildSeries(averageDates, metric) {
  // years -> month index -> list of temps
  const grid = {};
  Object.entries(averageDates).forEach(([date, temp]) => {
    const [y, m] = date.split('-').map(Number);
    ((grid[y] ??= {})[m - 1] ??= []).push(temp);
  });

  // ApexCharts draws the first series at the bottom, so ascending years
  // puts the most recent year at the top.
  return Object.keys(grid)
    .map(Number)
    .sort((a, b) => a - b)
    .map((year) => ({
      name: String(year),
      data: MONTHS.map((label, i) => {
        const temps = grid[year][i];
        if (!temps) return { x: label, y: 0 };
        return {
          x: label,
          y: metric === 'count' ? temps.length : Math.max(...temps),
        };
      }),
    }));
}

export default function Heatmap({ }) {
  const [metric, setMetric] = useState('count'); // 'count' | 'max'

  const series = useMemo(
    () => buildSeries(climateStore.dashboardData?.average_dates ?? [], metric),
    [climateStore.dashboardData?.average_dates, metric]
  );

  const options = {
    chart: { type: 'heatmap', toolbar: { show: false } },
    dataLabels: { enabled: true, style: { colors: ['#222'] },
      formatter: (v) => (v === 0 ? '' : v) },
    stroke: { width: 2, colors: ['#fff'] },
    plotOptions: {
      heatmap: { radius: 3, enableShades: false,
        colorScale: { ranges: COLOR_RANGES[metric] } },
    },
    tooltip: {
      y: {
        formatter: (v) =>
          v === 0 ? 'No hot days'
          : metric === 'count' ? `${v} hot day${v > 1 ? 's' : ''}`
          : `${v}°C peak`,
      },
    },
    legend: { position: 'bottom' },
  };

  return (
    <>
      <div className="btn-group btn-group-sm m-3 brand-accent">
        <button className={`btn btn-outline ca-color ${metric === 'count' ? 'active' : ''}`}
                onClick={() => setMetric('count')}>Hot days</button>
        <button className={`btn btn-outline ca-color ${metric === 'max' ? 'active' : ''}`}
                onClick={() => setMetric('max')}>Peak temp</button>
      </div>
      <Chart type="heatmap" series={series} options={options}
             height={Math.max(220, series.length * 45 + 80)} />
    </>
  );
}