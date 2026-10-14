import SvgIcon from '@mui/material/SvgIcon';

const paths = {
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2c5 5 5 15 0 20-5-5-5-15 0-20ZM4 6h16M4 18h16',
  filter: 'M4 6h16M7 12h10M10 18h4',
  close: 'm6 6 12 12M6 18 18 6',
  chart: 'M4 4v16h16M7 14l4-5 4 3 5-7',
};

export default function ClimateIcon({ name = 'globe', ...props }) {
  return <SvgIcon {...props}><path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></SvgIcon>;
}