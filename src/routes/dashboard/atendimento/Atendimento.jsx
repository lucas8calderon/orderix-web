import { Box, Container, Typography } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { Tables } from '../tables/Tables';
import { Comandas } from '../comandas/Comandas';
import { CheckoutDialog } from './components/CheckoutDialog';
import './Atendimento.css';

export function Atendimento() {
  const [accountTarget, setAccountTarget] = useState(null);
  const [floorVersion, setFloorVersion] = useState(0);

  const handlePaid = () => {
    setAccountTarget(null);
    setFloorVersion((version) => version + 1);
  };

  return (
    <Box className="atendimento-container">
      <Container maxWidth="xl" className="atendimento-content">
        <Typography variant="h4" className="atendimento-page-title">
          Atendimento
        </Typography>
        <Typography variant="body1" className="atendimento-page-subtitle">
          Clique na mesa ou comanda para conferir os pedidos, fechar a conta e liberar o atendimento.
        </Typography>

        <Box className="atendimento-section">
          <Tables onOpenAccount={setAccountTarget} floorVersion={floorVersion} />
        </Box>

        <Box className="atendimento-section">
          <Comandas onOpenAccount={setAccountTarget} floorVersion={floorVersion} />
        </Box>
      </Container>

      <CheckoutDialog
        open={Boolean(accountTarget)}
        target={accountTarget}
        onClose={() => setAccountTarget(null)}
        onPaid={handlePaid}
      />
    </Box>
  );
}
