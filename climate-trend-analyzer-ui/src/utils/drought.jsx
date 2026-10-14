import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { climateStore } from '../stores/ClimateStore';
import { HAZARDS } from '../stores/ClimateStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n) => String(n).padStart(2, '0');
const NONE = '#eef1ef';

/* ---------- helpers ---------- */

// Rows = years, columns = months. Missing month => 0 (no long dry spell).
function toSeries(years, getValue) {
  return years.map((year) => ({
    name: String(year),
    data: MONTHS.map((label, m) => ({
      x: label,
      y: getValue(`${year}-${pad(m + 1)}`) ?? 0,
    })),
  }));
}

// Expand every spell (start..end) into days and count them per calendar month,
// so a spell that crosses a month or year boundary is split correctly.
function daysPerMonth(spells) {
  const counts = {};
  spells.forEach(({ start, end }) => {
    const [sy, sm, sd] = start.split('-').map(Number);
    const [ey, em, ed] = end.split('-').map(Number);
    const last = Date.UTC(ey, em - 1, ed);
    for (let t = Date.UTC(sy, sm - 1, sd); t <= last; t += 86400000) {
      const d = new Date(t);
      const key = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
  });
  return counts;
}

const makeOptions = (ranges, tooltipText) => ({
  chart: { type: 'heatmap', toolbar: { show: false } },
  dataLabels: {
    enabled: true,
    style: { colors: ['#111'] },
    formatter: (v) => (v === 0 ? '' : v),
  },
  stroke: { width: 2, colors: ['#fff'] },
  plotOptions: {
    heatmap: { radius: 3, enableShades: false, colorScale: { ranges } },
  },
  tooltip: { y: { formatter: tooltipText } },
  legend: { position: 'bottom' },
});

const heightFor = (years) => Math.max(220, years.length * 42 + 90);

/* ---------- 1. Longest dry spell (days) per year x month ---------- */

const LONGEST_RANGES = [
  { from: 0,  to: 0,   name: 'None',      color: NONE },
  { from: 1,  to: 7,   name: '5–7 days',  color: '#fef3c7' },
  { from: 8,  to: 14,  name: '8–14 days', color: '#fcd34d' },
  { from: 15, to: 30,  name: '15–30 days',color: '#f59e0b' },
  { from: 31, to: 60,  name: '31–60 days',color: '#ee7a2c' },
  { from: 61, to: 365, name: '61+ days',  color: '#e2511f' },
];

export function LongestSpellHeatmap({ data }) {
  const { series, years } = useMemo(() => {
    const years = data?.long_dry_days_per_year?.map((r) => r.year);
    const byMonth = Object.fromEntries(data?.long_dry_days_by_month?.map((r) => [r.month, r.longest]));
    return { years, series: toSeries(years, (key) => byMonth[key]) };
  }, [data]);

  const options = useMemo(
    () => makeOptions(LONGEST_RANGES, (v) => (v === 0 ? 'No long dry spell' : `Longest spell: ${v} days`)),
    []
  );

  return <Chart type="heatmap" series={series} options={options} height={heightFor(years)} />;
}

/* ---------- 2. Total days inside long dry spells per year x month ---------- */

const DAYS_RANGES = [
  { from: 0,  to: 0,  name: 'None',       color: NONE },
  { from: 1,  to: 7,  name: '1–7 days',   color: '#fef3c7' },
  { from: 8,  to: 14, name: '8–14 days',  color: '#fcd34d' },
  { from: 15, to: 21, name: '15–21 days', color: '#f59e0b' },
  { from: 22, to: 31, name: '22–31 days', color: '#e2511f' },
];

export function DryDaysPerMonthHeatmap({ data }) {
  const { series, years } = useMemo(() => {
    const years = data?.long_dry_days_per_year?.map((r) => r.year);
    const counts = daysPerMonth(data.long_dry_days);
    return { years, series: toSeries(years, (key) => counts[key]) };
  }, [data]);

  const options = useMemo(
    () => makeOptions(DAYS_RANGES, (v) => (v === 0 ? 'No days in a long dry spell' : `${v} days in long dry spells`)),
    []
  );

  return <Chart type="heatmap" series={series} options={options} height={heightFor(years)} />;
}
const TotalYearBarCharts = (({data}) => {
  const { series, years } = useMemo(() => {
    const years = data?.long_dry_days_per_year?.map((r) => r.year);
    const counts = daysPerMonth(data.long_dry_days);
    return { years, series: toSeries(years, (key) => counts[key]) };
  }, [data]);

    const options = {
    chart: { type: "bar", toolbar: { show: true } },
    plotOptions: {
        bar: { horizontal: false, columnWidth: "50%" }
    },
    dataLabels: { enabled: true },
    xaxis: {
        categories: MONTHS,
        title: { text: "Month" },
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

export default function DryDaysHeatmaps({}) {
  return (
    <>
    <div className="row g-3 m-1">
       <div className="col-12">
        <div className='panel-box'>
           <h6 className='brand-accent p-3'>Longest dry spell</h6><LongestSpellHeatmap data={climateStore.dashboardData} /></div>
        </div>
       </div>
        <div className="row g-3 m-1">
      <div className="col-12">
         <div className='panel-box'> 
            <h6 className='brand-accent p-3'>Days in dry spells</h6><DryDaysPerMonthHeatmap data={climateStore.dashboardData} /></div>
       </div>
       </div>
           <div className="row g-3 m-1">
         <div className="col-12"><TotalYearBarCharts data={climateStore.dashboardData} /></div>

    </div>
    </>
  );
}