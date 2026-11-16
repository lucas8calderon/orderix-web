import { act, renderHook } from '@testing-library/react';
import { usePostProducts } from './usePostProducts';
import { addNewProduct, updateProduct } from '../service/productService';

jest.mock('../service/productService', () => ({
  addNewProduct: jest.fn(),
  updateProduct: jest.fn(),
}));

const baseProduct = {
  name: 'Refrigerante',
  categoryId: 1,
  value: 6,
  isAvailable: true,
};

describe('usePostProducts inventory payload', () => {
  beforeEach(() => {
    addNewProduct.mockResolvedValue({ data: { id: 9 } });
    updateProduct.mockResolvedValue({ data: { id: 8 } });
  });

  it('envia o controle e a quantidade inicial ao criar', async () => {
    const { result } = renderHook(() => usePostProducts());

    await act(async () => {
      await result.current.saveProduct({
        ...baseProduct,
        trackInventory: true,
        stockQuantity: 24,
      });
    });

    expect(addNewProduct).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Refrigerante',
      trackInventory: true,
      stockQuantity: 24,
    }));
  });

  it('omite a quantidade quando o produto não entra na contagem', async () => {
    const { result } = renderHook(() => usePostProducts());

    await act(async () => {
      await result.current.saveProduct({
        ...baseProduct,
        trackInventory: false,
        stockQuantity: null,
      });
    });

    const payload = addNewProduct.mock.calls[0][0];
    expect(payload.trackInventory).toBe(false);
    expect(payload.stockQuantity).toBeUndefined();
  });

  it('não reenvia o saldo na edição de um produto já controlado', async () => {
    const { result } = renderHook(() => usePostProducts());

    await act(async () => {
      await result.current.saveProduct({
        ...baseProduct,
        id: 8,
        trackInventory: true,
        stockQuantity: null,
      });
    });

    const payload = updateProduct.mock.calls[0][1];
    expect(updateProduct).toHaveBeenCalledWith(8, expect.any(Object));
    expect(payload.trackInventory).toBe(true);
    expect(payload.stockQuantity).toBeUndefined();
  });
});
