import { observer } from 'mobx-react-lite';
import { climateStore, HAZARDS } from '../stores/ClimateStore';
import { useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Heatmap from '../utils/heapMap';
import BarCharts from '../utils/barChart';
import LineChart from '../utils/lineChart';
import HeatWave from '../utils/heatWave';
import DryDaysHeatmaps from '../utils/drought';
import ScatterPlot from '../utils/scatter';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const Dashboard = observer(({  }) => {

    useEffect(() => {
      console.log(climateStore.dashboardData)
      console.log(climateStore.filters)
    }, [climateStore.dashboardData, climateStore.filters])

  return (
     <main className="container-fluid py-3 px-3 px-lg-4">
       {(!climateStore.dashboardData || !climateStore.filters.cityData.city || climateStore.loader ) ? 
       <div style={{margin: '50%', textAlign:'center'}}
        sx={(theme) => ({ color: '#222020', zIndex: theme.zIndex.drawer + 1 })}   open={!climateStore.filters.cityData.city}

      >
        <CircularProgress color="#0f0e0e" />
      <div className='brand-accent'>Fetching Data...</div>

      </div> : <>
    <section className="row g-3 mb-3">
     <div className="col-12">
        <header className="top-bar">
          <h1 className="top-bar__title">{`${HAZARDS.find((x) => climateStore.filters.hazardType == x.value)?.label}`}</h1>
          <p className="top-bar__subtitle brand-accent">{climateStore.dashboardData.summary}</p>
        </header>
      </div>
    </section>
 
     <section className="row g-3 mb-3">
        <div className="col-12">
          <h6>Select your inputs on the filter section</h6>
        </div>
      </section>
    <section className="row g-3 mb-3">
      <div className="col-12 col-md-4">
        <div className="stat-box">
          <label htmlFor="region" className="stat-box__label form-label">Geographic region</label>
          <input type="text" id="region" name="region" className="stat-box__input form-control" readOnly disabled
          value={`${climateStore.filters.cityData.country}/${climateStore.filters.cityData.state}/${climateStore.filters.cityData.city}`} placeholder="Enter region"/>
        </div>
      </div>
      <div className="col-12 col-md-3">
        <div className="stat-box">
          <label htmlFor="hazard" className="stat-box__label form-label">Hazard type</label>
          <input type="text" id="hazard" name="hazard" className="stat-box__input form-control" readOnly disabled
          value={HAZARDS.find((x) => climateStore.filters.hazardType == x.value)?.label} placeholder="Enter hazard type"/>
        </div>
      </div>
        <div className="col-12 col-md-4">
        <div className="stat-box">
          <label htmlFor="hazard" className="stat-box__label form-label">Latitude/Longitude</label>
          <input type="text" id="hazard" name="hazard" className="stat-box__input form-control" readOnly disabled
          value={`${climateStore.filters.cityData.latitude}/${climateStore.filters.cityData.longitude}`} placeholder="Enter lat/long"/>
        </div>
      </div>
    </section>
     {climateStore.filters.hazardType != 4 && <section className="row g-3 mb-3">
    <div className="col-12 col-lg-12">
        <div className="panel-box"><LineChart/> </div>
      </div>
    </section> }
     {(climateStore.filters.hazardType == 4 && climateStore.dashboardData?.long_dry_days ) && <section className="row g-3 mb-3">
         <div className="col-12 col-lg-12">
            <div className="panel-box"> <DryDaysHeatmaps/>  </div>
         </div>
     </section>
}
    {climateStore.filters.hazardType == 1 && <section className="row g-3">
        <div className="col-12 col-lg-12">
        <div className="panel-box">
            { climateStore.dashboardData.trend ? 
                <Heatmap/> 
                : <div> loading </div>}</div>
      </div> </section>}
      <section className="row g-3">
      {climateStore.filters.hazardType != 4  &&  <div className="col-12 col-lg-6">
        <div className="panel-box">
            <BarCharts/>
            </div>
      </div>
      }
    {(climateStore.filters.hazardType == 3 || climateStore.filters.hazardType == 2)  &&  <div className="col-12 col-lg-6">
        <div className="panel-box">
            <ScatterPlot/>
            </div>
      </div>
      }
        { climateStore.filters.hazardType == 1 && 
        <div className="col-12 col-lg-6">
        <div className="panel-box">
            <HeatWave/>
      </div>
      </div> }

    </section>
 </> }
  </main>
  )
})



export default Dashboard;