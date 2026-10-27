import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DeliveryOrders } from './DeliveryOrders';
import { listDeliveryOrders } from '../service/deliveryOrderService';
import {
  deliveryPaymentLabel,
  isOpenDeliveryOrder,
  isPendingStoreCharge,
} from '../utils/deliveryOrderView';

jest.mock('../service/deliveryOrderService', () => ({
  listDeliveryOrders: jest.fn(),
}));

const pickup = {
  id: 33,
  status: 'ACTIVE',
  customerName: 'Lucas Calderon',
  displayCode: '0033',
  orderSource: 'PICKUP',
  deliveryFulfillment: 'PICKUP',
  kitchenStatus: 'NEW',
  onlinePayment: false,
  customerPhone: '11999998888',
  products: [{ id: 1, name: 'Cerveja Heineken', quantity: 1, value: 12 }],
};

const entrega = {
  id: 40,
  status: 'ACTIVE',
  customerName: 'Ana Souza',
  displayCode: '0040',
  orderSource: 'DELIVERY',
  deliveryFulfillment: 'DELIVERY',
  kitchenStatus: 'IN_PREPARATION',
  onlinePayment: false,
  deliveryFee: 5,
  products: [
    { id: 2, name: 'Batata', quantity: 2, value: 8 },
    { id: 3, name: 'Refrigerante', quantity: 1, value: 6 },
  ],
};

const paidOnline = {
  id: 44,
  status: 'ACTIVE',
  customerName: 'Pedro Pago',
  displayCode: '0044',
  orderSource: 'PICKUP',
  deliveryFulfillment: 'PICKUP',
  kitchenStatus: 'READY',
  onlinePayment: true,
  products: [{ id: 4, name: 'Água', quantity: 1, value: 4 }],
};

const closed = {
  id: 50,
  status: 'CLOSED',
  customerName: 'Já Fechado',
  displayCode: '0050',
  orderSource: 'PICKUP',
  deliveryFulfillment: 'PICKUP',
  products: [{ id: 5, name: 'Suco', quantity: 1, value: 7 }],
};

const cancelled = {
  id: 51,
  status: 'CANCELLED',
  customerName: 'Cancelado',
  displayCode: '0051',
  orderSource: 'DELIVERY',
  deliveryFulfillment: 'DELIVERY',
  products: [{ id: 6, name: 'Pizza', quantity: 1, value: 30 }],
};

function renderList(props = {}) {
  listDeliveryOrders.mockResolvedValue({
    data: [pickup, entrega, paidOnline, closed, cancelled],
  });
  return render(<DeliveryOrders onOpenAccount={jest.fn()} floorVersion={0} {...props} />);
}

describe('delivery no atendimento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não trata pago, fechado ou cancelado como cobrança pendente', () => {
    expect(isOpenDeliveryOrder(closed)).toBe(false);
    expect(isOpenDeliveryOrder(cancelled)).toBe(false);
    expect(isPendingStoreCharge(paidOnline)).toBe(false);
    expect(isPendingStoreCharge(pickup)).toBe(true);
    expect(deliveryPaymentLabel(paidOnline)).toBe('Pago online');
    expect(deliveryPaymentLabel(cancelled)).toBe('Cancelado');
    expect(deliveryPaymentLabel(closed)).toBe('Pago');
    expect(deliveryPaymentLabel(pickup)).toBe('A receber na retirada');
    expect(deliveryPaymentLabel(entrega)).toBe('A receber na entrega');
  });

  it('lista retirada e entrega em aberto com número, cliente, itens e status', async () => {
    renderList();

    const pickupCard = await screen.findByRole('button', { name: /Receber pagamento do pedido 0033/ });
    expect(pickupCard).toHaveTextContent('#0033');
    expect(pickupCard).toHaveTextContent('Lucas Calderon');
    expect(pickupCard).toHaveTextContent('1x Cerveja Heineken');
    expect(pickupCard).toHaveTextContent('Retirada');
    expect(pickupCard).toHaveTextContent('Novo');
    expect(pickupCard).toHaveTextContent('A receber na retirada');

    const deliveryCard = screen.getByRole('button', { name: /Receber pagamento do pedido 0040/ });
    expect(deliveryCard).toHaveTextContent('#0040');
    expect(deliveryCard).toHaveTextContent('Ana Souza');
    expect(deliveryCard).toHaveTextContent('2x Batata');
    expect(deliveryCard).toHaveTextContent('Entrega');
    expect(deliveryCard).toHaveTextContent('Em produção');
    expect(deliveryCard).toHaveTextContent('A receber na entrega');

    expect(screen.getByText('Pedro Pago')).toBeInTheDocument();
    expect(screen.getByText(/Feito/)).toBeInTheDocument();
    expect(screen.getByText(/Pago online/)).toBeInTheDocument();
    expect(screen.queryByText('Já Fechado')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancelado')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Pedro Pago/ })).not.toBeInTheDocument();
  });

  it('abre a cobrança só no pedido pendente e recarrega com floorVersion', async () => {
    const onOpenAccount = jest.fn();
    const view = renderList({ onOpenAccount });

    fireEvent.click(await screen.findByRole('button', { name: /Receber pagamento do pedido 0033/ }));
    expect(onOpenAccount).toHaveBeenCalledWith({
      kind: 'delivery',
      id: 33,
      number: '0033',
      customerName: 'Lucas Calderon',
      fulfillment: 'PICKUP',
    });

    fireEvent.click(screen.getByRole('button', { name: /Receber pagamento do pedido 0040/ }));
    expect(onOpenAccount).toHaveBeenCalledWith(expect.objectContaining({
      kind: 'delivery',
      id: 40,
      fulfillment: 'DELIVERY',
    }));

    view.rerender(<DeliveryOrders onOpenAccount={onOpenAccount} floorVersion={1} />);
    await waitFor(() => {
      expect(listDeliveryOrders).toHaveBeenCalledTimes(2);
    });
  });

  it('mostra o erro da API', async () => {
    listDeliveryOrders.mockRejectedValue({ response: { data: { message: 'Falha ao listar' } } });
    render(<DeliveryOrders floorVersion={0} />);
    expect(await screen.findByText('Falha ao listar')).toBeInTheDocument();
  });
});
