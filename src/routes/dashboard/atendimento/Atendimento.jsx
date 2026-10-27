import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container } from '@mui/material';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Tables } from '../tables/Tables';
import { Comandas } from '../comandas/Comandas';
import { CounterSales } from './components/CounterSales';
import { CustomerOrders } from './components/CustomerOrders';
import { DeliveryOrders } from './components/DeliveryOrders';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PlaceOrderDialog } from './components/PlaceOrderDialog';
import './Atendimento.css';
import { PageHeader } from '../../../commons/components/PageHeader';
import { PageTabs } from '../../../commons/components/PageTabs';

export function Atendimento() {
  const [tab, setTab] = useState('tables');
  const [accountTarget, setAccountTarget] = useState(null);
  const [orderTarget, setOrderTarget] = useState(null);
  const [accountRefresh, setAccountRefresh] = useState(0);
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
        <PageHeader title="Atendimento" description="Lance produtos e feche a conta de mesas, comandas, balcão, pedidos por cliente e delivery." actions={<Button
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
        <PageTabs
          id="service"
          label="Tipo de atendimento"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'tables', label: 'Mesas' },
            { value: 'tabs', label: 'Comandas' },
            { value: 'counter', label: 'Balcão' },
            { value: 'customer', label: 'Cliente' },
            { value: 'delivery', label: 'Delivery' },
          ]}
        />

        <div role="tabpanel" id="service-panel-tables" aria-labelledby="service-tab-tables" hidden={tab !== 'tables'} className="atendimento-section">
          <Tables onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-tabs" aria-labelledby="service-tab-tabs" hidden={tab !== 'tabs'} className="atendimento-section">
          <Comandas onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-counter" aria-labelledby="service-tab-counter" hidden={tab !== 'counter'} className="atendimento-section">
          <CounterSales onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-customer" aria-labelledby="service-tab-customer" hidden={tab !== 'customer'} className="atendimento-section">
          <CustomerOrders onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-delivery" aria-labelledby="service-tab-delivery" hidden={tab !== 'delivery'} className="atendimento-section">
          <DeliveryOrders onOpenAccount={setAccountTarget} floorVersion={floorVersion} />
        </div>
      </Container>

      <CheckoutDialog
        open={Boolean(accountTarget)}
        target={accountTarget}
        refreshKey={accountRefresh}
        onClose={() => setAccountTarget(null)}
        onPaid={handlePaid}
        onAddProducts={(target) => setOrderTarget(
          target.kind === 'counter'
            ? { kind: 'counter' }
            : target.kind === 'customer'
              ? {
                kind: 'customer',
                id: target.id,
                number: target.number,
                customerName: target.customerName,
              }
              : target,
        )}
      />
      <PlaceOrderDialog
        open={Boolean(orderTarget)}
        target={orderTarget}
        onClose={() => setOrderTarget(null)}
        onPlaced={() => {
          setOrderTarget(null);
          setFloorVersion((version) => version + 1);
          setAccountRefresh((version) => version + 1);
        }}
      />
    </Box>
  );
}
