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
    customerName: 'Fechado',
    products: [{ id: 3, name: 'Água', quantity: 1, value: 4 }],
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
    expect(screen.queryByText('Bruno')).not.toBeInTheDocument();
    expect(screen.queryByText('Fechado')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: '10' } });
    expect(screen.getByText('Ana')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar pedido de balcão'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelados' }));
    expect(await screen.findByText('Bruno')).toBeInTheDocument();
    expect(screen.queryByText('Ana')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Em aberto' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Abrir pedido 10' }));
    expect(onOpenAccount).toHaveBeenCalledWith({ kind: 'counter', id: 10, number: 10 });
  });
});
