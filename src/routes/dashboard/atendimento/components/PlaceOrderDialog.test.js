import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PlaceOrderDialog } from './PlaceOrderDialog';
import { createFloorOrder, resolveOperatorWaiterId } from '../service/accountService';
import { getAllCategories } from '../../menu/category/service/categoryService';
import { getAllProducts } from '../../menu/product/service/productService';

jest.mock('../service/accountService', () => ({
  createFloorOrder: jest.fn(() => Promise.resolve({ data: {} })),
  resolveOperatorWaiterId: jest.fn(() => Promise.resolve(7)),
}));

jest.mock('../../menu/product/service/productService', () => ({
  getAllProducts: jest.fn(),
}));

jest.mock('../../menu/category/service/categoryService', () => ({
  getAllCategories: jest.fn(),
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

const batata = {
  id: 1,
  name: 'Barca de Batata',
  value: 50,
  categoryId: 10,
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [],
};

const agua = {
  id: 2,
  name: 'Água',
  value: 4,
  categoryId: 20,
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [],
};

const cerveja = {
  id: 3,
  name: 'Cerveja Budweiser',
  value: 12,
  categoryId: 20,
  isAvailable: true,
  sellable: true,
  mandatoryGroups: [],
  extras: [],
};

const menuCategories = [
  { id: 20, name: 'Bebidas' },
  { id: 10, name: 'Porções' },
  { id: 30, name: 'Doces' },
];

function categoryChipLabels() {
  return within(screen.getByRole('toolbar', { name: 'Categorias' }))
    .getAllByRole('button')
    .map((chip) => chip.textContent);
}

describe('PlaceOrderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAllProducts.mockResolvedValue({ data: [cafe] });
    getAllCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bebidas' }] });
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

  it('filtra por categoria, combina com a busca e mantém o produto oculto no pedido', async () => {
    getAllProducts.mockResolvedValue({
      data: [
        batata,
        agua,
        cerveja,
        { ...batata, id: 9, name: 'Doce esgotado', categoryId: 30, isAvailable: false },
      ],
    });
    getAllCategories.mockResolvedValue({ data: menuCategories });

    render(
      <PlaceOrderDialog
        open
        target={{ kind: 'table', id: 8, number: 3 }}
        onClose={jest.fn()}
        onPlaced={jest.fn()}
      />,
    );

    expect(await screen.findByText('Barca de Batata')).toBeInTheDocument();
    expect(categoryChipLabels()).toEqual(['Todas', 'Bebidas', 'Porções']);
    expect(screen.queryByRole('button', { name: 'Doces' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Outros' })).not.toBeInTheDocument();
    expect(screen.queryByText('Doce esgotado')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Aumentar Barca de Batata' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bebidas' }));

    expect(screen.getByText('Água')).toBeInTheDocument();
    expect(screen.getByText('Cerveja Budweiser')).toBeInTheDocument();
    expect(screen.queryByText('Barca de Batata')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bebidas' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'bud' } });
    expect(screen.getByText('Cerveja Budweiser')).toBeInTheDocument();
    expect(screen.queryByText('Água')).not.toBeInTheDocument();
    expect(screen.queryByText('Barca de Batata')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: 'barca' } });
    expect(screen.queryByText('Cerveja Budweiser')).not.toBeInTheDocument();
    expect(screen.getByText('Nenhum produto disponível.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    expect(screen.getByText('Barca de Batata')).toBeInTheDocument();
    expect(screen.queryByText('Água')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Buscar produto'), { target: { value: '' } });
    expect(screen.getByText('Água')).toBeInTheDocument();
    expect(screen.getByText('Cerveja Budweiser')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enviar pedido' }));
    await waitFor(() => {
      expect(createFloorOrder).toHaveBeenCalledWith(8, expect.objectContaining({
        products: [expect.objectContaining({ id: 1, quantity: 1, categoryId: 10 })],
      }), expect.any(String));
    });
  });

  it('respeita campo de ordem quando a categoria traz um', async () => {
    getAllProducts.mockResolvedValue({ data: [batata, agua] });
    getAllCategories.mockResolvedValue({
      data: [
        { id: 10, name: 'Porções', sortOrder: 2 },
        { id: 20, name: 'Bebidas', sortOrder: 1 },
      ],
    });

    render(
      <PlaceOrderDialog
        open
        target={{ kind: 'comanda', id: 4, number: 12 }}
        onClose={jest.fn()}
        onPlaced={jest.fn()}
      />,
    );

    expect(await screen.findByText('Água')).toBeInTheDocument();
    expect(categoryChipLabels()).toEqual(['Todas', 'Bebidas', 'Porções']);
  });

  it('mostra Outros só para produto sem categoria e volta para Todas ao reabrir', async () => {
    const avulso = {
      id: 6,
      name: 'Item avulso',
      value: 3,
      categoryId: null,
      isAvailable: true,
      sellable: true,
      mandatoryGroups: [],
      extras: [],
    };
    getAllProducts.mockResolvedValue({ data: [agua, avulso] });
    getAllCategories.mockResolvedValue({ data: [{ id: 20, name: 'Bebidas' }] });
    const target = { kind: 'customer' };

    const view = render(
      <PlaceOrderDialog
        open
        target={target}
        onClose={jest.fn()}
        onPlaced={jest.fn()}
      />,
    );

    expect(await screen.findByText('Item avulso')).toBeInTheDocument();
    expect(categoryChipLabels()).toEqual(['Todas', 'Bebidas', 'Outros']);

    fireEvent.click(screen.getByRole('button', { name: 'Outros' }));
    expect(screen.getByText('Item avulso')).toBeInTheDocument();
    expect(screen.queryByText('Água')).not.toBeInTheDocument();

    view.rerender(
      <PlaceOrderDialog
        open={false}
        target={target}
        onClose={jest.fn()}
        onPlaced={jest.fn()}
      />,
    );
    view.rerender(
      <PlaceOrderDialog
        open
        target={target}
        onClose={jest.fn()}
        onPlaced={jest.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Enviar pedido' })).toBeEnabled();
    });
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Água')).toBeInTheDocument();
    expect(screen.getByText('Item avulso')).toBeInTheDocument();
  });
});
