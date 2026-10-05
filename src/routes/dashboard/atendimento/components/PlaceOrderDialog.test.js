import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlaceOrderDialog } from './PlaceOrderDialog';
import { createFloorOrder, resolveOperatorWaiterId } from '../service/accountService';
import { getAllProducts } from '../../menu/product/service/productService';

jest.mock('../service/accountService', () => ({
  createFloorOrder: jest.fn(() => Promise.resolve({ data: {} })),
  resolveOperatorWaiterId: jest.fn(() => Promise.resolve(7)),
}));

jest.mock('../../menu/product/service/productService', () => ({
  getAllProducts: jest.fn(),
}));

const cafe = {
  id: 4,
  name: 'Café',
  value: 5,
  categoryId: 1,
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [],
};

describe('PlaceOrderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllProducts.mockResolvedValue({ data: [cafe] });
    resolveOperatorWaiterId.mockResolvedValue(7);
    createFloorOrder.mockResolvedValue({ data: {} });
  });

  it('envia o produto escolhido para a mesa do caixa', async () => {
    const onPlaced = jest.fn();
    render(
      <PlaceOrderDialog
        open
        target={{ kind: 'table', id: 8, number: 3 }}
        onClose={jest.fn()}
        onPlaced={onPlaced}
      />,
    );

    expect(await screen.findByText('Café')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Café' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));

    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(8, expect.objectContaining({
        tableId: 8,
        waiterId: 7,
        customerName: 'Mesa 3',
      }), expect.any(String));
    });
    expect(onPlaced).toHaveBeenCalled();
  });

  it('abre pedido de balcão sem exigir garçom', async () => {
    render(
      <PlaceOrderDialog
        open
        target={{ kind: 'counter' }}
        onClose={jest.fn()}
        onPlaced={jest.fn()}
      />,
    );

    expect(await screen.findByText('Café')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Café' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));

    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(999, expect.objectContaining({
        tableId: 999,
        waiterId: 999,
        customerName: 'Balcão',
      }), expect.any(String));
    });
    expect(resolveOperatorWaiterId).not.toHaveBeenCalled();
  });
});
