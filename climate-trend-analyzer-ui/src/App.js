import { useEffect, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Navbar from './components/Navbar';
import Dashboard from './components/dashboard'

import FilterSidebar from './components/FilterSidebar';
import './App.css';
import { climateStore } from './stores/ClimateStore';

const theme = createTheme({
  palette: {
    primary: { main: '#3a24b6' },
    background: { default: '#f5f7f9' },
    text: { primary: '#23352f', secondary: '#604bd4' },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
});

function App({}) {
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/getRegion`)
    .then((resp) => resp.json())
    .then((data) => {
      console.log("makindg")
      fetch(`${process.env.REACT_APP_API_URL}/historicData/${data[0]?.city}/${data[0]?.latitude}/${data[0]?.longitude}/${climateStore.filters.hazardType}/${climateStore.filters.startDate}/${climateStore.filters.endDate}`)
        .then((res) => res.json())
        .then((record) => {
          climateStore.setLoader(true)
          console.log("got response",record)
          climateStore.setDashboardData(record)
          climateStore.setLoader(false)

        }).catch(err => console.log("Error occured"))
      climateStore.setCityList(data);
    }).catch(err => console.log("Error occured"))
  })
  return (
    <ThemeProvider theme={theme}>
      <Navbar  />
      <div className="app-layout"><FilterSidebar /><Dashboard/>
      </div>
    </ThemeProvider>
  );
}

export default App;
