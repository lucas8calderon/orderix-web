import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeliveryTracking from './DeliveryTracking';
import { getDeliveryOrder } from '../../services/deliveryService';
import { writeLastOrder, readLastOrder } from '../../services/deliveryLastOrder';
import { POLL_INTERVAL_MS } from './orderTrackingConfig';

jest.mock('../../services/deliveryService', () => ({
  getDeliveryOrder: jest.fn(),
}));

function renderTracking(token = 'token-abc', initialEntries) {
  return render(
    <MemoryRouter initialEntries={initialEntries || [`/delivery/pedido/${token}`]}>
      <Routes>
        <Route path="/delivery/pedido/:publicToken" element={<DeliveryTracking />} />
      </Routes>
    </MemoryRouter>
  );
}

function baseOrder(overrides = {}) {
  return {
    id: 94,
    storeName: 'Minions',
    storeAddress: 'Rua das Flores, 123 - Centro',
    storePhone: '11999998888',
    fulfillment: 'PICKUP',
    paymentMethod: 'PIX',
    total: 58,
    trackingStatus: 'IN_PREPARATION',
    estimatedReadyFrom: '2026-09-20T12:50:00',
    estimatedReadyTo: '2026-09-20T13:00:00',
    statusHistory: [
      { status: 'RECEIVED', at: '2026-09-20T12:32:00' },
      { status: 'IN_PREPARATION', at: '2026-09-20T12:35:00' },
    ],
    items: [
      { productId: 1, name: 'X-Burger', quantity: 1, unitPrice: 28 },
      { productId: 2, name: 'Refrigerante 350ml', quantity: 1, unitPrice: 30 },
    ],
    ...overrides,
  };
}

describe('DeliveryTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    window.localStorage.clear();
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('mostra endereço da loja e copia no PICKUP', async () => {
    getDeliveryOrder.mockResolvedValue({ data: baseOrder() });

    renderTracking();

    expect(await screen.findByText('Retirada no estabelecimento')).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores, 123 - Centro')).toBeInTheDocument();
    expect(screen.getAllByText('Em preparação').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Previsão para retirada/i)).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Copiar endereço'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Rua das Flores, 123 - Centro');
    expect(await screen.findByText('Endereço copiado')).toBeInTheDocument();
  });

  it('não mostra endereço da loja em DELIVERY', async () => {
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({
        id: 95,
        fulfillment: 'DELIVERY',
        trackingStatus: 'RECEIVED',
        street: 'Av Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        statusHistory: [{ status: 'RECEIVED', at: '2026-09-20T12:32:00' }],
      }),
    });

    renderTracking();

    expect(await screen.findByText(/Av Paulista/)).toBeInTheDocument();
    expect(screen.queryByText('Rua das Flores, 123 - Centro')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Copiar endereço')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Entrega')).toBeInTheDocument();
  });

  it('não mostra bloco de cópia se PICKUP sem storeAddress', async () => {
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({ storeAddress: null, trackingStatus: 'RECEIVED' }),
    });

    renderTracking();

    await waitFor(() => {
      expect(screen.getByText('Retirada no estabelecimento')).toBeInTheDocument();
    });
    expect(screen.queryByLabelText('Copiar endereço')).not.toBeInTheDocument();
  });

  it('exibe not found e permite retry', async () => {
    getDeliveryOrder
      .mockRejectedValueOnce({ response: { status: 404, data: { message: 'Não encontrado' } } })
      .mockResolvedValueOnce({ data: baseOrder() });

    renderTracking();

    expect(await screen.findByText('Pedido não encontrado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Tentar novamente/i }));
    expect(await screen.findByText('Pedido #94')).toBeInTheDocument();
  });

  it('limpa lastOrder do localStorage quando tracking retorna 404', async () => {
    writeLastOrder('padaria', { token: 'token-abc', orderId: 94 });
    writeLastOrder('outra', { token: 'token-outro', orderId: 1 });
    getDeliveryOrder.mockRejectedValue({
      response: { status: 404, data: { message: 'Não encontrado' } },
    });

    renderTracking('token-abc');

    expect(await screen.findByText('Pedido não encontrado')).toBeInTheDocument();
    expect(readLastOrder('padaria')).toBeNull();
    expect(readLastOrder('outra')?.token).toBe('token-outro');
  });

  it('READY PICKUP destaca pedido pronto', async () => {
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({ trackingStatus: 'READY' }),
    });

    renderTracking();

    expect(await screen.findByText(/Seu pedido está pronto/i)).toBeInTheDocument();
  });

  it('OUT_FOR_DELIVERY destaca a caminho', async () => {
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({
        fulfillment: 'DELIVERY',
        trackingStatus: 'OUT_FOR_DELIVERY',
        storeAddress: null,
        street: 'Rua A',
        number: '10',
      }),
    });

    renderTracking();

    expect(await screen.findByRole('heading', { name: /a caminho/i })).toBeInTheDocument();
    expect(screen.getAllByText('Saiu para entrega').length).toBeGreaterThanOrEqual(1);
  });

  it('CANCELLED mostra estado específico sem timeline', async () => {
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({ trackingStatus: 'CANCELLED' }),
    });

    renderTracking();

    expect(await screen.findByText('Pedido cancelado')).toBeInTheDocument();
    expect(screen.queryByLabelText('Progresso do pedido')).not.toBeInTheDocument();
  });

  it('abre detalhes do pedido', async () => {
    getDeliveryOrder.mockResolvedValue({ data: baseOrder() });

    renderTracking();

    await userEvent.click(await screen.findByRole('button', { name: /Ver detalhes/i }));
    expect(await screen.findByText('Detalhes do pedido')).toBeInTheDocument();
    expect(screen.getAllByText(/1x X-Burger/).length).toBeGreaterThanOrEqual(1);
  });

  it('mantém dados e alerta quando poll falha', async () => {
    jest.useFakeTimers();
    getDeliveryOrder
      .mockResolvedValueOnce({ data: baseOrder() })
      .mockRejectedValueOnce({ response: { status: 500, data: { message: 'erro' } } });

    renderTracking();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('Pedido #94')).toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS + 100);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText(/Não conseguimos atualizar/i)).toBeInTheDocument();
    expect(screen.getByText('Pedido #94')).toBeInTheDocument();
  });

  it('para o polling em estado final', async () => {
    jest.useFakeTimers();
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({ trackingStatus: 'DELIVERED' }),
    });

    renderTracking();

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('Pedido retirado')).toBeInTheDocument();
    const callsAfterLoad = getDeliveryOrder.mock.calls.length;

    await act(async () => {
      jest.advanceTimersByTime(POLL_INTERVAL_MS * 3);
      await Promise.resolve();
    });

    expect(getDeliveryOrder.mock.calls.length).toBe(callsAfterLoad);
  });

  it('fallback de previsão quando sem janela', async () => {
    getDeliveryOrder.mockResolvedValue({
      data: baseOrder({
        estimatedReadyFrom: null,
        estimatedReadyTo: null,
        estimatedMinutes: null,
      }),
    });

    renderTracking();

    expect(await screen.findByText('Previsão sendo calculada')).toBeInTheDocument();
  });

  it('ajuda usa canal real quando há telefone', async () => {
    getDeliveryOrder.mockResolvedValue({ data: baseOrder() });

    renderTracking();

    const help = await screen.findByLabelText('Falar com o estabelecimento');
    expect(help.getAttribute('href')).toMatch(/wa\.me\/55/);
  });
});
