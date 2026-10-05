import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import InventoryPanel, { stockTone } from './Inventory';
import { adjustInventory, getInventoryMovements, getInventorySnapshot } from '../../../services/inventoryService';

jest.mock('../../../services/inventoryService', () => ({
  getInventorySnapshot: jest.fn(),
  getInventoryMovements: jest.fn(),
  adjustInventory: jest.fn(),
}));

const item = {
  productId: 4,
  name: 'Café',
  stockQuantity: 3,
  minimumStock: 5,
  trackInventory: true,
};

describe('stockTone', () => {
  it('marca saldo zerado, baixo e sem controle', () => {
    expect(stockTone({ trackInventory: true, stockQuantity: 0, minimumStock: 1 })).toBe('out');
    expect(stockTone(item)).toBe('low');
    expect(stockTone({ trackInventory: false, stockQuantity: 0, minimumStock: 0 })).toBe('off');
  });
});

describe('InventoryPanel', () => {
  beforeEach(() => {
    getInventorySnapshot.mockResolvedValue({ data: { items: [item] } });
    getInventoryMovements.mockResolvedValue({ data: [] });
    adjustInventory.mockResolvedValue({ data: { ...item, stockQuantity: 5 } });
  });

  it('mostra o saldo da API e grava uma entrada', async () => {
    render(<InventoryPanel />);
    expect(await screen.findByText('Café')).toBeInTheDocument();
    expect(screen.getByText(/Saldo 3/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Entrada' }));
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gravar' }));

    await waitFor(() => {
      expect(adjustInventory).toHaveBeenCalledWith({
        productId: 4,
        type: 'RESTOCK',
        quantity: 2,
        note: null,
      });
    });
  });

  it('grava saída como ajuste negativo', async () => {
    render(<InventoryPanel />);
    expect(await screen.findByText('Café')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Saída' }));
    fireEvent.change(screen.getByLabelText('Quantidade'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gravar' }));

    await waitFor(() => {
      expect(adjustInventory).toHaveBeenCalledWith(expect.objectContaining({
        type: 'ADJUST',
        quantity: -1,
      }));
    });
  });
});
