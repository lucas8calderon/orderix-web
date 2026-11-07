import { render, screen, waitFor } from '@testing-library/react';
import { useNewOrderAlert } from './useNewOrderAlert';
import { fetchStoreSyncSince, fetchStoreSyncStatus } from './storeSyncClient';
import { playNewOrderBeep } from './orderAlertSound';

jest.mock('../../../services/session', () => ({
  getCurrentUser: () => ({ storeId: 7, role: 'STORE_ADMIN' }),
}));

jest.mock('./orderAlertSound', () => ({
  unlockOrderAlertSound: jest.fn(),
  playNewOrderBeep: jest.fn(),
}));

jest.mock('./storeSyncClient', () => ({
  NEW_ORDER_POLL_MS: 40,
  fetchStoreSyncStatus: jest.fn(),
  fetchStoreSyncSince: jest.fn(),
}));

function Probe() {
  const alert = useNewOrderAlert();
  return <span>{alert.count}</span>;
}

const createdBatch = {
  status: 200,
  etag: '23',
  data: {
    cursor: 23,
    events: [
      { type: 'ORDER_CREATED', entityId: 1 },
      { type: 'ORDER_CREATED', entityId: 2 },
      { type: 'ORDER_CREATED', entityId: 3 },
    ],
  },
};

describe('useNewOrderAlert', () => {
  beforeEach(() => {
    fetchStoreSyncStatus.mockResolvedValue({ cursor: 20 });
    fetchStoreSyncSince.mockResolvedValue({ status: 304, data: null, etag: '20' });
  });

  it('não toca som na carga e toca uma vez quando o lote seguinte traz pedidos', async () => {
    render(<Probe />);

    await waitFor(() => expect(fetchStoreSyncStatus).toHaveBeenCalled());
    expect(playNewOrderBeep).not.toHaveBeenCalled();
    expect(screen.getByText('0')).toBeInTheDocument();

    fetchStoreSyncSince.mockResolvedValue(createdBatch);
    await waitFor(() => expect(playNewOrderBeep).toHaveBeenCalledTimes(1));
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
