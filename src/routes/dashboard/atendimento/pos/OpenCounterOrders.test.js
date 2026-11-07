import { fireEvent, render, screen } from '@testing-library/react';
import { OpenCounterOrders } from './OpenCounterOrders';
import { getTableAccount } from '../service/accountService';

jest.mock('../service/accountService', () => ({
  getTableAccount: jest.fn(),
}));

const orders = [
  {
    id: 10,
    status: 'ACTIVE',
    customerName: 'Ana',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    products: [{ id: 1, name: 'Café', quantity: 2, value: 5 }],
  },
  {
    id: 11,
    status: 'CANCELLED',
    customerName: 'Bruno',
    cancelledAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    products: [{ id: 2, name: 'Suco', quantity: 1, value: 8 }],
  },
  {
    id: 12,
    status: 'CLOSED',
    paymentStatus: 'APPROVED',
    customerName: 'Fechado',
    products: [{ id: 3, name: 'Água', quantity: 1, value: 4 }],
  },
  {
    id: 13,
    status: 'ACTIVE',
    paymentStatus: 'PAID_EXTERNALLY',
    customerName: 'Carla',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    products: [{ id: 4, name: 'Bolo', quantity: 1, value: 12 }],
  },
  {
    id: 14,
    status: 'ACTIVE',
    paymentStatus: 'PENDING',
    customerName: 'Diego',
    products: [{ id: 5, name: 'Chá', quantity: 1, value: 6 }],
  },
];

describe('pedidos abertos do balcão', () => {
  beforeEach(() => {
    getTableAccount.mockResolvedValue({ data: { orders } });
  });

  it('mostra só vendas ativas e localiza pelo número', async () => {
    const onOpenAccount = jest.fn();
    render(<OpenCounterOrders visible onOpenAccount={onOpenAccount} />);

    expect(await screen.findByRole('button', { name: 'Abrir pedido 10' })).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Carla')).toBeInTheDocument();
    expect(screen.getByText('Pago')).toBeInTheDocument();
    expect(screen.getAllByText('Não pago').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Em aberto').length).toBeGreaterThan(1);
    expect(screen.queryByText('Bruno')).not.toBeInTheDocument();
    expect(screen.queryByText('Fechado')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: '10' } });
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.queryByText('Carla')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Pagos' }));
    expect(screen.getByText('Carla')).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(screen.queryByText('Diego')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: 'carla' } });
    expect(screen.getByText('Carla')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: 'ana' } });
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(screen.queryByText('Carla')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Não pagos' }));
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('Diego')).toBeInTheDocument();
    expect(screen.queryByText('Carla')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Não pagos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelados' }));
    expect(await screen.findByText('Bruno')).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();
    expect(screen.queryByText('Carla')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Em aberto' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir pedido 10' }));
    expect(onOpenAccount).toHaveBeenCalledWith({ kind: 'counter', id: 10, number: 10 });
  });

  it('lista o pedido mais novo antes do mais velho', async () => {
    getTableAccount.mockResolvedValue({
      data: {
        orders: [
          { id: 139, status: 'ACTIVE', customerName: 'Velho', createdAt: '2026-11-07T10:00:00', products: [] },
          { id: 140, status: 'ACTIVE', customerName: 'Novo', createdAt: '2026-11-07T13:27:00', products: [] },
          { id: 138, status: 'ACTIVE', customerName: 'Empate', createdAt: '2026-11-07T13:27:00', products: [] },
        ],
      },
    });
    render(<OpenCounterOrders visible />);
    const cards = await screen.findAllByRole('button', { name: /Abrir pedido/ });
    expect(cards.map((node) => node.getAttribute('aria-label'))).toEqual([
      'Abrir pedido 140',
      'Abrir pedido 138',
      'Abrir pedido 139',
    ]);
  });
});
