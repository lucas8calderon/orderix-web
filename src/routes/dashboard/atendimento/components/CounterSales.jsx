import { useState } from 'react';
import { CounterPos } from '../pos/CounterPos';
import { OpenCounterOrders } from '../pos/OpenCounterOrders';

export { isOpenCounterOrder } from '../pos/counterOrders';

export function CounterSales({ onOpenAccount, floorVersion = 0, active = true }) {
  const [mode, setMode] = useState('sale');

  return (
    <>
      <div hidden={mode !== 'sale'}>
        <CounterPos
          active={active && mode === 'sale'}
          floorVersion={floorVersion}
          onShowOrders={() => setMode('orders')}
          onOpenAccount={onOpenAccount}
        />
      </div>
      <div hidden={mode !== 'orders'}>
        <OpenCounterOrders
          visible={active && mode === 'orders'}
          floorVersion={floorVersion}
          onBack={() => setMode('sale')}
          onOpenAccount={onOpenAccount}
        />
      </div>
    </>
  );
}
