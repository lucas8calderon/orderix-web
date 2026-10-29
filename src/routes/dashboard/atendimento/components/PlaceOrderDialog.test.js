import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PlaceOrderDialog } from './PlaceOrderDialog';
import { createFloorOrder, resolveOperatorWaiterId } from '../service/accountService';
import { addCustomerOrderItems, createCustomerOrder } from '../service/customerOrderService';
import { getAllCategories } from '../../menu/category/service/categoryService';
import { getAllProducts } from '../../menu/product/service/productService';

jest.mock('../service/accountService', () => ({
  createFloorOrder: jest.fn(() => Promise.resolve({ data: {} })),
  resolveOperatorWaiterId: jest.fn(() => Promise.resolve(7)),
}));

jest.mock('../service/customerOrderService', () => ({
  createCustomerOrder: jest.fn(),
  addCustomerOrderItems: jest.fn(),
}));

jest.mock('../../menu/product/service/productService', () => ({
  getAllProducts: jest.fn(),
}));

jest.mock('../../menu/category/service/categoryService', () => ({
  getAllCategories: jest.fn(),
}));

const base = { isAvailable: true, sellable: true, mandatoryGroups: [], extras: [], variations: [] };
const cafe = { ...base, id: 4, name: 'Café', value: 5, categoryId: 1 };
const batata = { ...base, id: 1, name: 'Barca de Batata', value: 50, categoryId: 10 };
const agua = { ...base, id: 2, name: 'Água', value: 4, categoryId: 20 };
const cerveja = { ...base, id: 3, name: 'Cerveja Budweiser', value: 12, categoryId: 20 };

function categoryChipLabels() {
  return within(screen.getByRole('toolbar', { name: 'Categorias' }))
    .getAllByRole('button')
    .map((chip) => chip.getAttribute('aria-label'));
}

function renderDialog(target, props = {}) {
  return render(<PlaceOrderDialog open target={target} onClose={jest.fn()} onPlaced={jest.fn()} {...props} />);
}

describe('PlaceOrderDialog', () => {
  beforeAll(() => {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    getAllProducts.mockResolvedValue({ data: [cafe] });
    getAllCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bebidas' }] });
    resolveOperatorWaiterId.mockResolvedValue(7);
    createFloorOrder.mockResolvedValue({ data: {} });
  });

  it('usa o PDV para lançar na mesa com o garçom do caixa', async () => {
    const onPlaced = jest.fn();
    renderDialog({ kind: 'table', id: 8, number: 3 }, { onPlaced });

    expect(screen.getByText('Lançar em Mesa 3')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    fireEvent.click(screen.getByRole('button', { name: /^Enviar pedido/ }));

    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(8, expect.objectContaining({
        tableId: 8,
        waiterId: 7,
        customerName: 'Mesa 3',
        products: [expect.objectContaining({ id: 4, quantity: 1 })],
      }), expect.any(String));
    });
    expect(onPlaced).toHaveBeenCalled();
  });

  it('lança na comanda pelo sentinela do balcão', async () => {
    renderDialog({ kind: 'comanda', id: 4, number: 12 });
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    fireEvent.click(screen.getByRole('button', { name: /^Enviar pedido/ }));
    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(999, expect.objectContaining({
        tableId: 999,
        comandaId: 4,
        waiterId: 7,
      }), expect.any(String));
    });
  });

  it('abre pedido de balcão sem exigir garçom nem guardar rascunho', async () => {
    renderDialog({ kind: 'counter' });
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.queryByRole('button', { name: 'Enviar sem cobrar' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Enviar pedido/ }));

    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(999, expect.objectContaining({
        tableId: 999,
        waiterId: 999,
        customerName: 'Balcão',
      }), expect.any(String));
    });
    expect(resolveOperatorWaiterId).not.toHaveBeenCalled();
    expect(sessionStorage.length).toBe(0);
  });

  it('ordena categorias, mostra contagem e busca no cardápio inteiro', async () => {
    getAllProducts.mockResolvedValue({ data: [batata, agua, cerveja] });
    getAllCategories.mockResolvedValue({
      data: [
        { id: 10, name: 'Porções', sortOrder: 2 },
        { id: 20, name: 'Bebidas', sortOrder: 1 },
        { id: 30, name: 'Doces', sortOrder: 3 },
      ],
    });
    renderDialog({ kind: 'table', id: 8, number: 3 });

    expect(await screen.findByText('Barca de Batata')).toBeInTheDocument();
    expect(categoryChipLabels()).toEqual(['Todas', 'Bebidas', 'Porções']);
    expect(screen.getByRole('button', { name: 'Bebidas' })).toHaveTextContent('Bebidas · 2');

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Barca de Batata' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bebidas' }));
    expect(screen.queryByRole('button', { name: 'Adicionar Barca de Batata' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bebidas' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'barca' } });
    expect(screen.getByRole('button', { name: 'Adicionar Barca de Batata' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar Água' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Enviar pedido/ }));
    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(8, expect.objectContaining({
        products: [expect.objectContaining({ id: 1, quantity: 1, categoryId: 10 })],
      }), expect.any(String));
    });
  });

  it('cria pedido por cliente com nome obrigatório, mesmo sem itens', async () => {
    createCustomerOrder.mockResolvedValue({ data: { id: 30 } });
    const onPlaced = jest.fn();
    renderDialog({ kind: 'customer' }, { onPlaced });
    await screen.findByRole('button', { name: 'Adicionar Café' });

    expect(screen.getByRole('button', { name: 'Criar pedido' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/Nome do cliente/), { target: { value: 'Joana' } });
    fireEvent.change(screen.getByLabelText('Identificação visual (opcional)'), { target: { value: 'boné' } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar pedido' }));

    await waitFor(() => {
      expect(createCustomerOrder).toHaveBeenCalledWith(expect.objectContaining({
        customerName: 'Joana',
        customerIdentificationNote: 'boné',
        products: [],
      }), expect.any(String));
    });
    await waitFor(() => expect(onPlaced).toHaveBeenCalledWith({ id: 30 }));
  });

  it('adiciona itens ao pedido por cliente existente sem trocar o nome', async () => {
    addCustomerOrderItems.mockResolvedValue({ data: {} });
    renderDialog({ kind: 'customer', id: 30, customerName: 'Joana' });
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.getByLabelText(/Nome do cliente/)).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /^Enviar pedido/ }));
    await waitFor(() => {
      expect(addCustomerOrderItems).toHaveBeenCalledWith(30, expect.objectContaining({
        products: [expect.objectContaining({ id: 4 })],
      }), expect.any(String));
    });
  });
});
