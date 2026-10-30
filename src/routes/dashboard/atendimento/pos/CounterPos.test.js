import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { CounterPos } from './CounterPos';
import { getAllCategories } from '../../menu/category/service/categoryService';
import { getAllProducts } from '../../menu/product/service/productService';
import { createFloorOrder } from '../service/accountService';
import { getStorePaymentConfig } from '../../../../services/paymentConfigService';

jest.mock('../../menu/product/service/productService', () => ({
  getAllProducts: jest.fn(),
}));

jest.mock('../../menu/category/service/categoryService', () => ({
  getAllCategories: jest.fn(),
}));

jest.mock('../service/accountService', () => ({
  createFloorOrder: jest.fn(),
  resolveOperatorWaiterId: jest.fn(),
}));

jest.mock('../../../../services/paymentConfigService', () => ({
  ...jest.requireActual('../../../../services/paymentConfigService'),
  getStorePaymentConfig: jest.fn(() => Promise.resolve({ data: {} })),
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

async function openCategory(name) {
  fireEvent.click(await screen.findByRole('button', { name: `Ver produtos de ${name}` }));
}

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
    getStorePaymentConfig.mockResolvedValue({ data: {} });
  });

  it('adiciona produto simples, mantém o carrinho ao filtrar e altera a quantidade', async () => {
    renderPos();

    await openCategory('Bebidas');
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.getByRole('status')).toHaveTextContent('Café adicionado ao pedido');
    expect(screen.getByLabelText('Quantidade de Café')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Porções' }));
    expect(screen.queryByRole('button', { name: 'Adicionar Café' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade de Café')).toHaveTextContent('1');

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Café' }));
    expect(screen.getByLabelText('Quantidade de Café')).toHaveTextContent('2');
    expect(screen.getByRole('button', { name: /^Cobrar/ })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Diminuir Café' }));
    fireEvent.click(screen.getByRole('button', { name: 'Diminuir Café' }));
    expect(screen.queryByLabelText('Quantidade de Café')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Cobrar/ })).toBeDisabled();
  });

  it('mostra categoria inativa com tag e não deixa adicionar os produtos', async () => {
    getAllCategories.mockResolvedValue({
      data: [
        { id: 10, name: 'Porções', sortOrder: 2, active: true },
        { id: 1, name: 'Bebidas', sortOrder: 1, active: false },
      ],
    });
    renderPos();

    expect(await screen.findByRole('button', { name: 'Ver produtos de Bebidas, indisponível' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bebidas indisponível' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver produtos de Bebidas, indisponível' }));

    expect(await screen.findByRole('button', { name: 'Café indisponível' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Doce esgotado indisponível' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Café indisponível' }));
    expect(screen.queryByLabelText('Quantidade de Café')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'cafe' } });
    expect(screen.getByRole('button', { name: 'Café indisponível' })).toBeDisabled();
  });

  it('busca por SKU, indica indisponível e não inclui o produto', async () => {
    renderPos();
    await openCategory('Bebidas');
    expect(await screen.findByRole('button', { name: 'Doce esgotado indisponível' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'caf-1' } });
    expect(screen.getByRole('button', { name: 'Adicionar Café' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar Barca de Batata' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'inexistente' } });
    expect(screen.getByText('Nenhum produto encontrado para “inexistente”.')).toBeInTheDocument();
  });

  it('abre personalização para variação e adicional e distingue os itens', async () => {
    renderPos();
    await openCategory('Porções');
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

    await openCategory('Bebidas');
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    const finish = screen.getByRole('button', { name: /^Cobrar/ });
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
    fireEvent.click(screen.getByRole('button', { name: 'Enviar sem cobrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Sem estoque');
    expect(screen.getByLabelText('Quantidade de Café')).toBeInTheDocument();
    expect(onOpenAccount).toHaveBeenCalledTimes(1);
  });

  it('recupera o rascunho da loja e não mistura com outro estabelecimento', async () => {
    localStorage.setItem('weper.user', JSON.stringify({ storeId: 4 }));
    const view = renderPos();
    await openCategory('Bebidas');
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.getByLabelText('Quantidade de Café')).toBeInTheDocument();
    expect(screen.getByText('Rascunho salvo automaticamente neste caixa.')).toBeInTheDocument();
    view.unmount();

    localStorage.setItem('weper.user', JSON.stringify({ storeId: 8 }));
    renderPos();
    await openCategory('Bebidas');
    expect(await screen.findByRole('button', { name: 'Adicionar Café' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Quantidade de Café')).not.toBeInTheDocument();

    localStorage.setItem('weper.user', JSON.stringify({ storeId: 4 }));
    renderPos();
    expect(await screen.findByLabelText('Quantidade de Café')).toHaveTextContent('1');
  });

  it('envia sem cobrar e mostra o número do pedido com atalho para cobrar', async () => {
    const onOpenAccount = jest.fn();
    renderPos({ onOpenAccount });
    await openCategory('Bebidas');
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar sem cobrar' }));
    const cart = screen.getByRole('region', { name: 'Pedido balcão' });
    expect(await within(cart).findByText('Pedido 55 enviado.')).toBeInTheDocument();
    expect(onOpenAccount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cobrar / imprimir' }));
    expect(onOpenAccount).toHaveBeenCalledWith({ kind: 'counter', id: 55, number: 55 });
  });

  it('mostra primeiro os cards das categorias e abre os produtos ao tocar', async () => {
    renderPos();
    expect(await screen.findByRole('button', { name: 'Ver produtos de Bebidas' })).toHaveTextContent('2 produtos');
    expect(screen.getByRole('button', { name: 'Ver produtos de Porções' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar Café' })).not.toBeInTheDocument();

    await openCategory('Porções');
    expect(screen.getByRole('heading', { name: 'Porções' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Adicionar Café' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Categorias' }));
    expect(screen.getByRole('button', { name: 'Ver produtos de Bebidas' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Porções' }));
    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'cafe' } });
    expect(screen.getByRole('button', { name: 'Adicionar Café' })).toBeInTheDocument();
  });

  it('trava o lançamento do usuário de caixa com o caixa fechado', async () => {
    renderPos({ launchBlocked: true });
    expect(await screen.findByRole('alert')).toHaveTextContent('O caixa está fechado');
    await openCategory('Bebidas');
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar Café' }));
    expect(screen.getByRole('button', { name: /^Cobrar/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviar sem cobrar' })).toBeDisabled();
    fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    expect(createFloorOrder).not.toHaveBeenCalled();
  });
});
