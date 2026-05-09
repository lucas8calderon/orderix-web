import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

export default function Deposits() {
  return (
    <React.Fragment>
      <Title>Total de vendas hoje</Title>
      <Typography component="p" variant="h4">
        R$ 5.600,00
      </Typography>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        em 02 de Junho, 2024
      </Typography>
      <div>
        <Link color="primary" href="#" onClick={preventDefault}>
          Ver caixa
        </Link>
      </div>
    </React.Fragment>
  );
}
