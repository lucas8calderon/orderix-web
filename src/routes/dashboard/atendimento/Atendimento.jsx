import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Container } from '@mui/material';
import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Tables } from '../tables/Tables';
import { Comandas } from '../comandas/Comandas';
import { CounterSales } from './components/CounterSales';
import { CustomerOrders } from './components/CustomerOrders';
import { DeliveryOrders } from './components/DeliveryOrders';
import { CheckoutDialog } from './components/CheckoutDialog';
import { PlaceOrderDialog } from './components/PlaceOrderDialog';
import { CashBar } from './cash/CashBar';
import { CashHistory } from './cash/CashHistory';
import './Atendimento.css';
import { PageHeader } from '../../../commons/components/PageHeader';
import { PageTabs } from '../../../commons/components/PageTabs';

function tabLabel(label, count) {
  if (!count) return label;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      {label}
      <Box component="span" className="atendimento-tab-count" aria-label={`${count} pendentes`}>{count}</Box>
    </Box>
  );
}

export function Atendimento() {
  const [tab, setTab] = useState('tables');
  const [counts, setCounts] = useState({ counter: 0, customer: 0, delivery: 0 });
  const countSetter = (key) => (value) => setCounts((current) => (
    current[key] === value ? current : { ...current, [key]: value }
  ));
  const [accountTarget, setAccountTarget] = useState(null);
  const [orderTarget, setOrderTarget] = useState(null);
  const [accountRefresh, setAccountRefresh] = useState(0);
  const [floorVersion, setFloorVersion] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cashState, setCashState] = useState({ known: false, open: false, version: 0 });
  const refreshTimerRef = useRef(null);
  const handleCashChange = useCallback((session) => {
    setCashState((current) => ({ known: true, open: Boolean(session), version: current.version + 1 }));
  }, []);

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
        <PageHeader title="Atendimento" description="Mesas, comandas, balcão, pedidos por cliente e delivery." actions={<Button
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
        <CashBar floorVersion={floorVersion} onChange={handleCashChange} />
        <PageTabs
          className="atendimento-modes"
          id="service"
          label="Tipo de atendimento"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'tables', label: 'Mesas' },
            { value: 'tabs', label: 'Comandas' },
            { value: 'counter', label: tabLabel('Balcão', counts.counter) },
            { value: 'customer', label: tabLabel('Cliente', counts.customer) },
            { value: 'delivery', label: tabLabel('Delivery', counts.delivery) },
            { value: 'cash', label: 'Caixa' },
          ]}
        />

        <div role="tabpanel" id="service-panel-tables" aria-labelledby="service-tab-tables" hidden={tab !== 'tables'} className="atendimento-section">
          <Tables onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-tabs" aria-labelledby="service-tab-tabs" hidden={tab !== 'tabs'} className="atendimento-section">
          <Comandas onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-counter" aria-labelledby="service-tab-counter" hidden={tab !== 'counter'} className="atendimento-section atendimento-section--pos">
          <CounterSales active={tab === 'counter'} cashClosed={cashState.known && !cashState.open} onOpenAccount={setAccountTarget} onCountChange={countSetter('counter')} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-customer" aria-labelledby="service-tab-customer" hidden={tab !== 'customer'} className="atendimento-section">
          <CustomerOrders onOpenAccount={setAccountTarget} onPlaceOrder={setOrderTarget} onCountChange={countSetter('customer')} floorVersion={floorVersion} />
        </div>

        <div role="tabpanel" id="service-panel-cash" aria-labelledby="service-tab-cash" hidden={tab !== 'cash'} className="atendimento-section">
          <CashHistory visible={tab === 'cash'} floorVersion={floorVersion} refreshKey={cashState.version} />
        </div>

        <div role="tabpanel" id="service-panel-delivery" aria-labelledby="service-tab-delivery" hidden={tab !== 'delivery'} className="atendimento-section">
          <DeliveryOrders onOpenAccount={setAccountTarget} onCountChange={countSetter('delivery')} floorVersion={floorVersion} />
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
