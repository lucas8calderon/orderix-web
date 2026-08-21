import * as React from 'react';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from './Title';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// Generate Order Data
function createData(id, date, name, shipTo, paymentMethod, amount) {
  return { id, date, name, shipTo, paymentMethod, amount };
}

const rows = [
  createData(
    0,
    '02 Jun',
    '3',
    'Lucas',
    'VISA ⠀•••• 3719',
    312.44,
  ),
  createData(
    1,
    '02 Jun',
    '1',
    'Paulo',
    'VISA ⠀•••• 2574',
    166.99,
  ),
  createData(2, '02 Jun', '5', 'Paulo', 'MC ⠀•••• 1253', 100.81),
  createData(
    3,
    '02 Jun',
    '1',
    'Pedro',
    'AMEX ⠀•••• 2000',
    654.39,
  ),
  createData(
    4,
    '02 Jun',
    '4',
    'Paulo',
    'VISA ⠀•••• 5919',
    212.79,
  ),
];

function preventDefault(event) {
  event.preventDefault();
}

export default function Orders() {
  return (
    <React.Fragment>
      <Title>Últimos pedidos</Title>
      <Box sx={{ overflowX: 'auto', display: { xs: 'none', sm: 'block' } }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Data</TableCell>
            <TableCell>Mesa</TableCell>
            <TableCell>Garçom</TableCell>
            <TableCell>Pagamento</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.shipTo}</TableCell>
              <TableCell>{row.paymentMethod}</TableCell>
              <TableCell align="right">{`R$ ${row.amount}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </Box>
      <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' }, mt: 1 }}>
        {rows.map((row) => (
          <Box key={row.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#f8f9fb' }}>
            <Typography variant="body2" fontWeight={600}>
              Mesa {row.name} · {row.date}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.shipTo} · {row.paymentMethod}
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              R$ {row.amount}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Link color="primary" href="#" onClick={preventDefault} sx={{ mt: 3 }}>
        Ver mais pedidos
      </Link>
    </React.Fragment>
  );
}
