import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container } from '@mui/material';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Tables } from '../tables/Tables';
import { Comandas } from '../comandas/Comandas';
import { CheckoutDialog } from './components/CheckoutDialog';
import './Atendimento.css';
import { PageHeader } from '../../../commons/components/PageHeader';
import { PageTabs } from '../../../commons/components/PageTabs';

export function Atendimento() {
  const [tab, setTab] = useState('tables');
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
        <PageHeader title="Atendimento" description="Confira os pedidos e feche a conta de mesas e comandas." actions={<Button
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
          </Button>} />
        <PageTabs id="service" label="Tipo de atendimento" value={tab} onChange={setTab} tabs={[{ value: 'tables', label: 'Mesas' }, { value: 'tabs', label: 'Comandas' }]} />

        <div role="tabpanel" id="service-panel-tables" aria-labelledby="service-tab-tables" hidden={tab !== 'tables'} className="atendimento-section">
          <Tables onOpenAccount={setAccountTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-tabs" aria-labelledby="service-tab-tabs" hidden={tab !== 'tabs'} className="atendimento-section">
          <Comandas onOpenAccount={setAccountTarget} floorVersion={floorVersion} />
        </div>
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
