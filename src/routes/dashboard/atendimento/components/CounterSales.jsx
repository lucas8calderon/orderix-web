import { useState } from 'react';
import { Alert, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { CounterPos } from '../pos/CounterPos';
import { OpenCounterOrders } from '../pos/OpenCounterOrders';

export { isOpenCounterOrder } from '../pos/counterOrders';

export function CounterSales({ onOpenAccount, onCountChange, floorVersion = 0, active = true, cashClosed = false }) {
  const [mode, setMode] = useState('sale');
  const [openCount, setOpenCount] = useState(0);
  const [sentVersion, setSentVersion] = useState(0);

  const handleCount = (count) => {
    setOpenCount(count);
    onCountChange?.(count);
  };

  return (
    <>
      {cashClosed ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          O caixa está fechado. Abra o caixa no topo da tela para as vendas entrarem no controle do dia.
        </Alert>
      ) : null}
      <ToggleButtonGroup
        exclusive
        value={mode}
        onChange={(_event, value) => {
          if (value) setMode(value);
        }}
        aria-label="Balcão"
        className="counter-mode-toggle"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="sale">Nova venda</ToggleButton>
        <ToggleButton value="orders">
          Pedidos abertos
          {openCount > 0 ? <Box component="span" className="counter-mode-toggle__count">{openCount}</Box> : null}
        </ToggleButton>
      </ToggleButtonGroup>
      <div hidden={mode !== 'sale'}>
        <CounterPos
          active={active && mode === 'sale'}
          floorVersion={floorVersion}
          onOpenAccount={onOpenAccount}
          onSent={() => setSentVersion((version) => version + 1)}
        />
      </div>
      <div hidden={mode !== 'orders'}>
        <OpenCounterOrders
          visible
          floorVersion={floorVersion + sentVersion}
          onCountChange={handleCount}
          onOpenAccount={onOpenAccount}
        />
      </div>
    </>
  );
}
