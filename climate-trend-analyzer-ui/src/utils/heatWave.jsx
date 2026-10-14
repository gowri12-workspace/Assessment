import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { climateStore } from '../stores/ClimateStore';

export default function HeatWave({ }) {
    return (
        <>  <h4 className='brand-accent p-3'>Heatwaves over the period</h4>
            { climateStore.dashboardData.heatwaves ?    
                <div class="container" style={{ maxWidth: '600px', overflowY: 'scroll', maxHeight: '450px'}}>
                <div class="vstack gap-4">
                        <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 300 }} aria-label="simple table">
                            <TableHead >
                            <TableRow>
                                <TableCell style={{ fontSize:'14px', fontWeight: 600}} align="right">Start Date</TableCell>
                                <TableCell style={{ fontSize:'14px', fontWeight: 600}} align="right">End Date</TableCell>
                                <TableCell style={{ fontSize:'14px', fontWeight: 600}} align="right">No.Of.Days&nbsp;</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            { climateStore.dashboardData.heatwaves?.map((row) => (                                
                                <TableRow
                                key={row.start}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                <TableCell align="right">{row.start}</TableCell>
                                <TableCell align="right">{row.end}</TableCell>
                                <TableCell align="right">{row.days}</TableCell>
                                {/* <TableCell align="right">{row.carbs}</TableCell>
                                <TableCell align="right">{row.protein}</TableCell> */}
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                        </TableContainer>
                </div>
            </div>
            : <div> loading </div> }
            </>
    )
}