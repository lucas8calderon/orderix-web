import { fireEvent, render, screen } from '@testing-library/react';
import { Atendimento } from './Atendimento';
import { listDeliveryOrders } from './service/deliveryOrderService';

jest.mock('../tables/Tables', () => ({ Tables: () => <div>painel mesas</div> }));
jest.mock('../comandas/Comandas', () => ({ Comandas: () => <div>painel comandas</div> }));
jest.mock('./components/CounterSales', () => ({
  CounterSales: () => <div>painel balcao</div>,
  isOpenCounterOrder: () => true,
}));
jest.mock('./components/CustomerOrders', () => ({ CustomerOrders: () => <div>painel cliente</div> }));
jest.mock('./service/deliveryOrderService', () => ({
  listDeliveryOrders: jest.fn(),
}));

describe('aba Delivery do Atendimento', () => {
  beforeEach(() => {
    listDeliveryOrders.mockResolvedValue({
      data: [{
        id: 33,
        status: 'ACTIVE',
        customerName: 'Lucas Calderon',
        displayCode: '0033',
        orderSource: 'PICKUP',
        deliveryFulfillment: 'PICKUP',
        kitchenStatus: 'NEW',
        onlinePayment: false,
        products: [{ id: 1, name: 'Cerveja Heineken', quantity: 1, value: 12 }],
      }],
    });
  });

  it('renderiza o pedido de retirada na aba Delivery', async () => {
    render(<Atendimento />);

    expect(screen.getByRole('tab', { name: /^Delivery/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /^Delivery/ }));

    expect(await screen.findByRole('heading', { name: 'Delivery' })).toBeInTheDocument();
    expect(screen.getByText('Lucas Calderon')).toBeInTheDocument();
    expect(screen.getByText('1x Cerveja Heineken')).toBeInTheDocument();
    expect(screen.getByText('Retirada')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Receber pagamento do pedido 0033/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Receber e finalizar' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^Delivery/ })).toHaveTextContent('Delivery1');
  });
});
