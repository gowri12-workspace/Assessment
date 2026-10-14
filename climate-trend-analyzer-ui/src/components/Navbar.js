import { AppBar, Box, Chip, IconButton, Toolbar } from '@mui/material'
import { observer } from 'mobx-react-lite';
import ClimateIcon from './ClimateIcon';
import { climateStore } from '../stores/ClimateStore';

const Navbar = observer(({  }) => {
  return (
    <AppBar component="header" position="sticky" elevation={0} className="app-navbar">
      <Toolbar className="navbar-toolbar">
        <a className="brand" href="/" aria-label="Climate Trend Analyzer home">
          <span className="brand-mark"><ClimateIcon /></span>
          <span>Climate Hazard <span className="brand-accent"> Trend Analyzer</span></span>
        </a>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton aria-label="Open filters" aria-controls="filter-sidebar" aria-expanded={climateStore.sidebarOpen} onClick={() => climateStore.setSidebarOpen(true)} sx={{ ml: 1, display: { md: 'none' } }}>
          <ClimateIcon name="filter" />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
});

export default Navbar;