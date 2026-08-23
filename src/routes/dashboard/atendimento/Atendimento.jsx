import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container, Typography } from '@mui/material';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Tables } from '../tables/Tables';
import { Comandas } from '../comandas/Comandas';
import { CheckoutDialog } from './components/CheckoutDialog';
import './Atendimento.css';

export function Atendimento() {
  const [accountTarget, setAccountTarget] = useState(null);
  const [floorVersion, setFloorVersion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);

  useEffect(() => () => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
  }, []);

  const handlePaid = () => {
    setAccountTarget(null);
    setFloorVersion((version) => version + 1);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setFloorVersion((version) => version + 1);
    window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <Box className="atendimento-container">
      <Container maxWidth="xl" className="atendimento-content">
        <Box className="atendimento-page-header">
          <Box>
            <Typography variant="h4" className="atendimento-page-title">
              Atendimento
            </Typography>
            <Typography variant="body1" className="atendimento-page-subtitle">
              Clique na mesa ou comanda para conferir os pedidos, fechar a conta e liberar o atendimento.
            </Typography>
          </Box>
          <Button
            startIcon={<RefreshIcon className={isRefreshing ? 'atendimento-refresh-icon' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="atendimento-refresh-btn"
            sx={{
              backgroundColor: 'transparent !important',
              color: 'var(--color-primary) !important',
              border: '1px solid var(--color-primary) !important',
              textTransform: 'none',
              alignSelf: 'flex-start',
              '&:hover': {
                backgroundColor: 'var(--color-primary) !important',
                color: '#fff !important',
              },
              '&:disabled': {
                opacity: 0.7,
              },
            }}
          >
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </Box>

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
