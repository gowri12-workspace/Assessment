import { makeAutoObservable } from 'mobx';

export const HAZARDS = [
  { value: '1', label: 'Heat' },
  { value: '2', label: 'Wind' },
  { value: '3', label: 'Rainfall' },
  { value: '4', label: 'Drought' },
];

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function defaultFilters() {
  return {
    cityData: {}, hazardType: '1',
    startDate: `2015-01-01`, endDate: `2026-10-10`,
  };
}

export function defaultFiltersAfterReset() {
  return {
    cityData: climateStore.cityList[0] ?? {}, hazardType: '1',
    startDate: `2015-01-01`, endDate: `2026-10-10`,
  };
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
}

class ClimateStore {
  cityList = []
  filters = defaultFilters();
  appliedFilters = null;
  sidebarOpen = false;
  dashboardData = {}
  loader = false

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get validationError() {
    const { cityData, hazardType, startDate, endDate } = this.filters;
// /    if (region !== 'India' || !CITIES.includes(city)) return 'Select a supported location.';
    if (!HAZARDS.some(({ value }) => value === hazardType)) return 'Select a climate hazard.';
    if (startDate > endDate) return 'End date must be on or after start date.';
    return '';
  }

  get hasPendingChanges() {
    return !this.appliedFilters || Object.keys(this.filters).some(
      (key) => this.filters[key] !== this.appliedFilters[key]
    );
  }

  setLoader(flag) {
     this.loader = flag
  }
  setCityList(cityList) {
    this.cityList = cityList
    let existingFilters = {...this.filters , cityData: cityList[0]}
    this.filters = existingFilters
  }

  setDashboardData(data) {
    this.dashboardData = data
    console.log(this.dashboardData)
  }

  setFilter(data) {
    console.log(data)
    this.filters = data
  }

  setSidebarOpen(open) { this.sidebarOpen = open; }

  resetFilters() {
    this.filters = {...defaultFilters(), cityData: this.cityList[0]}
  }
}

export const climateStore = new ClimateStore();