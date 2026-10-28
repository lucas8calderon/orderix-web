import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CounterPos } from './CounterPos';
import { getAllCategories } from '../../menu/category/service/categoryService';
import { getAllProducts } from '../../menu/product/service/productService';
import { createFloorOrder } from '../service/accountService';

jest.mock('../../menu/product/service/productService', () => ({
  getAllProducts: jest.fn(),
}));

jest.mock('../../menu/category/service/categoryService', () => ({
  getAllCategories: jest.fn(),
}));

jest.mock('../service/accountService', () => ({
  createFloorOrder: jest.fn(),
}));

const cafe = {
  id: 4,
  name: 'Café',
  sku: 'CAF-1',
  value: 5,
  categoryId: 1,
  categoryName: 'Bebidas',
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [],
  variations: [],
};

const batata = {
  id: 1,
  name: 'Barca de Batata',
  value: 18.9,
  categoryId: 10,
  categoryName: 'Porções',
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [{ productExtraId: 9, name: 'Cheddar', price: 3 }],
  variations: [],
};

const marmita = {
  id: 9,
  name: 'Strogonoff',
  value: 14,
  categoryId: 10,
  categoryName: 'Porções',
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [],
  variations: [
    { id: 1, name: 'Pequeno', price: 14, available: true },
    { id: 2, name: 'Grande', price: 22, available: true },
  ],
};

const esgotado = {
  id: 8,
  name: 'Doce esgotado',
  value: 7,
  categoryId: 1,
  categoryName: 'Bebidas',
  isAvailable: false,
  sellable: false,
  mandatoryGroups: [],
  extras: [],
  variations: [],
};

const menu = [cafe, batata, marmita, esgotado];

function renderPos(props = {}) {
  return render(<CounterPos onOpenAccount={jest.fn()} {...props} />);
}

describe('PDV de balcão', () => {
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
    localStorage.clear();
    getAllProducts.mockResolvedValue({ data: menu });
    getAllCategories.mockResolvedValue({
      data: [
        { id: 10, name: 'Porções', sortOrder: 2 },
        { id: 1, name: 'Bebidas', sortOrder: 1 },
      ],
    });
    createFloorOrder.mockResolvedValue({ data: { orders: [{ id: 55 }] } });
  });

  it('adiciona produto simples, mantém o carrinho ao filtrar e altera a quantidade', async () => {
    renderPos();

    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.getByRole('status')).toHaveTextContent('Café adicionado ao pedido');
    expect(screen.getByLabelText('Quantidade de Café')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Porções' }));
    expect(screen.queryByRole('button', { name: 'Adicionar Café' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade de Café')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Café' }));
    expect(screen.getByLabelText('Quantidade de Café')).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: 'Finalizar pedido' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir Café' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diminuir Café' }));
    expect(screen.queryByLabelText('Quantidade de Café')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finalizar pedido' })).toBeDisabled();
  });

  it('busca por SKU, indica indisponível e não inclui o produto', async () => {
    renderPos();
    expect(await screen.findByRole('button', { name: 'Doce esgotado indisponível' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'caf-1' } });
    expect(screen.getByRole('button', { name: 'Adicionar Café' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar Barca de Batata' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'inexistente' } });
    expect(screen.getByText('Nenhum produto encontrado para “inexistente”.')).toBeInTheDocument();
  });

  it('abre personalização para variação e adicional e distingue os itens', async () => {
    renderPos();
    fireEvent.click(await screen.findByRole('button', { name: 'Personalizar Strogonoff' }));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao pedido' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha uma variação de Strogonoff');

    fireEvent.click(screen.getByLabelText(/Grande/));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao pedido' }));
    expect(screen.getByText('Grande')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Personalizar Barca de Batata' }));
    fireEvent.click(screen.getByLabelText(/Cheddar/));
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar ao pedido' }));
    const cart = screen.getByRole('region', { name: 'Pedido balcão' });
    expect(within(cart).getByText('Cheddar')).toBeInTheDocument();
    expect(within(cart).getByText('Grande')).toBeInTheDocument();
  });

  it('finaliza uma vez, envia o pedido real e mantém o carrinho se a rede falhar', async () => {
    const onOpenAccount = jest.fn();
    let resolveRequest;
    createFloorOrder.mockImplementation(() => new Promise((resolve) => {
      resolveRequest = resolve;
    }));
    renderPos({ onOpenAccount });

    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    const finish = screen.getByRole('button', { name: 'Finalizar pedido' });
    fireEvent.click(finish);
    fireEvent.click(finish);
    expect(createFloorOrder).toHaveBeenCalledTimes(1);

    resolveRequest({ data: { orders: [{ id: 55 }] } });
    await waitFor(() => {
      expect(onOpenAccount).toHaveBeenCalledWith({ kind: 'counter', id: 55, number: 55 });
    });
    expect(createFloorOrder).toHaveBeenCalledWith(999, expect.objectContaining({
      tableId: 999,
      waiterId: 999,
      customerName: 'Balcão',
      products: [expect.objectContaining({ id: 4, quantity: 1, observation: null })],
    }), expect.any(String));
    expect(screen.queryByLabelText('Quantidade de Café')).not.toBeInTheDocument();

    createFloorOrder.mockRejectedValue({ response: { data: { message: 'Sem estoque' } } });
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar Café' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sem estoque');
    expect(screen.getByLabelText('Quantidade de Café')).toBeInTheDocument();
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it('recupera o rascunho da loja e não mistura com outro estabelecimento', async () => {
    localStorage.setItem('weper.user', JSON.stringify({ storeId: 4 }));
    const view = renderPos();
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.getByLabelText('Quantidade de Café')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Rascunho salvo neste caixa.');
    view.unmount();

    localStorage.setItem('weper.user', JSON.stringify({ storeId: 8 }));
    renderPos();
    expect(await screen.findByRole('button', { name: 'Adicionar Café' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Quantidade de Café')).not.toBeInTheDocument();

    localStorage.setItem('weper.user', JSON.stringify({ storeId: 4 }));
    renderPos();
    expect(await screen.findByLabelText('Quantidade de Café')).toHaveTextContent('1');
  });
});
