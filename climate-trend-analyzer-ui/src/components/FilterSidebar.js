import { Alert, Box, Button, Divider, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { HAZARDS, localDate, defaultFiltersAfterReset } from '../stores/ClimateStore';
import ClimateIcon from './ClimateIcon';
import { useEffect, useState } from 'react';
import { climateStore } from '../stores/ClimateStore';
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";


const FilterSidebar = observer(({}) => {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'), { defaultMatches: true });
  const [filters, SetFilters] = useState({
    cityData:  climateStore.filters.cityData,
    hazardType:  climateStore.filters.hazardType,
    startDate:  climateStore.filters.startDate,
    endDate: climateStore.filters.endDate
  })

  const getFilteredDataFromApi = () => {
    climateStore.setFilter(filters)
    climateStore.setLoader(true)
    fetch(`${process.env.REACT_APP_API_URL}/historicData/${filters?.cityData?.city}/${filters?.cityData?.latitude}/${filters?.cityData?.longitude}/${climateStore.filters.hazardType}/${climateStore.filters.startDate}/${climateStore.filters.endDate}`)
        .then((res) => res.json())
        .then((record) => {
          console.log("got response",record)
          climateStore.setDashboardData(record)
          climateStore.setLoader(false)
        }).catch(err => console.log("Error occured"))

  }

  const resetFilterData = () => {
    let defaultValues = defaultFiltersAfterReset()
    SetFilters(defaultValues)
    climateStore.setFilter(defaultValues)
    climateStore.setLoader(true)
    fetch(`${process.env.REACT_APP_API_URL}/historicData/${defaultValues?.cityData?.city}/${defaultValues?.cityData?.latitude}/${defaultValues?.cityData?.longitude}/${defaultValues.hazardType}/${defaultValues.startDate}/${defaultValues.endDate}`)
        .then((res) => res.json())
        .then((record) => {
          climateStore.setDashboardData(record)
          climateStore.setLoader(false)
        }).catch(err => console.log("Error occured"))
  }

  useEffect(() => { console.log(filters)})
  // useEffect(() => {
  //   console.log(filters)
  //   SetFilters({
  //     cityData:  climateStore.filters.cityData,
  //     hazardType:  climateStore.filters.hazardType,
  //     startDate:  climateStore.filters.startDate,
  //     endDate: climateStore.filters.endDate
  //   })
  // }, [climateStore.filters])

  const content = (
    <Box component="aside" id="filter-sidebar" aria-labelledby="filter-heading" className="filter-sidebar">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <Typography id="filter-heading" variant="h6" component="h2"><ClimateIcon name="filter" sx={{ mr: 1, verticalAlign: 'middle' }} />Filters</Typography>
        {!desktop && <IconButton aria-label="Close filters" onClick={() => climateStore.setSidebarOpen(false)}><ClimateIcon name="close" /></IconButton>}
      </div>
      <Divider sx={{ my: 1 }} />
      <form noValidate onSubmit={(event) => { event.preventDefault();  climateStore.setSidebarOpen(false); getFilteredDataFromApi() }}>
        <fieldset>
          <label className="form-label" htmlFor="city">City</label>
          <select id="city" name="city" className="form-select" value={filters?.cityData?.city} 
            onChange={e => SetFilters({...filters, cityData: climateStore.cityList.find(x => x.city == e.target.value)})}>
            {climateStore.cityList?.map((x) => <option key={x.city} value={x.city}>{x.city}</option>)}
          </select>
        </fieldset>
        <Divider sx={{ my: 1 }} />
        <fieldset>
          <label className="form-label" htmlFor="hazardType">Hazard type</label>
          <select id="hazardType" name="hazardType" className="form-select" value={filters?.hazardType} 
            onChange={e => SetFilters({...filters, hazardType: e.target.value})}>
            {HAZARDS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </fieldset>
        <Divider sx={{ my: 1 }} />
        <fieldset>
          <label className="form-label" htmlFor="startDate">Start date</label>
          <DatePicker id="startDate" name="startDate" type="date" className="form-control mb-3" selected={filters?.startDate} maxDate={new Date("2026-10-10")} minDate={new Date("1990-01-01")} 
              onChange={e => SetFilters({...filters, startDate: new Date(e).toLocaleDateString('en-CA')})}
              aria-describedby={climateStore.validationError ? 'filter-error' : undefined} />
          </fieldset>
        <Divider sx={{ my: 1 }} />
        <fieldset>
          <label className="form-label" htmlFor="endDate">End date</label>
          <DatePicker id="endDate" name="endDate" type="date" className="form-control" selected={filters?.endDate} maxDate={new Date("2026-10-10")} minDate={new Date("1990-01-01")}
              onChange={e => SetFilters({...filters, endDate: new Date(e).toLocaleDateString('en-CA')})}
              aria-describedby={climateStore.validationError ? 'filter-error' : undefined} />
        </fieldset>
        {climateStore.validationError && <Alert id="filter-error" severity="error" sx={{ mt: 2 }}>{climateStore.validationError}</Alert>}
        <Stack spacing={1.5} sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" disableElevation disabled={Boolean(climateStore.validationError) || !climateStore.hasPendingChanges}>Apply filters</Button>
          <Button type="button" variant="outlined" onClick={() => { climateStore.resetFilters(); resetFilterData()}}>Reset filters</Button>
        </Stack>
      </form>
    </Box>
  );

  return desktop ? content : <Drawer open={climateStore.sidebarOpen} onClose={() => climateStore.setSidebarOpen(false)}>{content}</Drawer>;
});

export default FilterSidebar;