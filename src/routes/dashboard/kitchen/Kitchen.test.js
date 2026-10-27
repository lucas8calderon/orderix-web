jest.mock('../atendimento/utils/accountTotals', () => ({
  resolveMandatorySelections: () => [],
}));

jest.mock('./kitchenService', () => ({
  getKitchenOrders: jest.fn(),
  updateKitchenOrderStatus: jest.fn(),
  cancelKitchenOrder: jest.fn(),
}));

jest.mock('react-beautiful-dnd', () => ({
  DragDropContext: ({ children }) => children,
  Droppable: ({ children }) => children({
    innerRef: jest.fn(),
    droppableProps: {},
    placeholder: null,
  }, {}),
  Draggable: ({ children }) => children({
    innerRef: jest.fn(),
    draggableProps: { style: {} },
    dragHandleProps: {},
  }, { isDragging: false }),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import { mapKitchenOrder } from './kitchenOrderMap';
import { SALES_CHANNEL_FILTERS } from '../../../services/salesChannel';
import { getKitchenOrders } from './kitchenService';
import { Kitchen } from './Kitchen';

describe('Kitchen channel filters', () => {
  it('expõe todos os canais de venda nos filtros', () => {
    const ids = SALES_CHANNEL_FILTERS.map((item) => item.id);
    expect(ids).toEqual(['todos', 'garcom', 'delivery', 'mesa', 'comanda', 'balcao', 'pedido_cliente']);
  });

  it('mapeia pedido por cliente com código e identificação', () => {
    const mapped = mapKitchenOrder({
      id: 42,
      orderSource: 'CUSTOMER_ORDER',
      customerName: 'Rafael',
      customerIdentificationNote: 'Camiseta vermelha',
      kitchenStatus: 'IN_PREPARATION',
      products: [{ id: 1, name: 'Café', quantity: 1 }],
    });
    expect(mapped.orderType).toBe('pedido_cliente');
    expect(mapped.orderNumber).toBe('#0042');
    expect(mapped.locationLabel).toBe('#0042');
    expect(mapped.notes).toContain('ID: Camiseta vermelha');
  });

  it('classifica pedido de garçom mesmo com mesa', () => {
    const mapped = mapKitchenOrder({
      id: 1,
      orderSource: 'WAITER',
      waiterId: 4,
      waiterName: 'Ana',
      tableId: 8,
      fromTable: true,
      kitchenStatus: 'NEW',
      products: [],
    });
    expect(mapped.orderType).toBe('garcom');
  });

  it('prioriza salesChannel da API e classifica delivery', () => {
    expect(mapKitchenOrder({
      id: 2,
      salesChannel: 'comanda',
      orderSource: 'DELIVERY',
      kitchenStatus: 'NEW',
      products: [],
    }).orderType).toBe('comanda');

    expect(mapKitchenOrder({
      id: 3,
      orderSource: 'PICKUP',
      kitchenStatus: 'NEW',
      products: [],
    }).orderType).toBe('delivery');
  });
});

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function apiOrder(id, salesChannel, kitchenStatus, createdAt) {
  return {
    id,
    salesChannel,
    kitchenStatus,
    status: 'ACTIVE',
    createdAt,
    customerName: `Cliente ${id}`,
    products: [{ id, name: 'Item', quantity: 1 }],
  };
}

describe('Kitchen filter chips', () => {
  const orders = [
    apiOrder(1, 'mesa', 'NEW', minutesAgo(5)),
    apiOrder(2, 'comanda', 'NEW', minutesAgo(5)),
    apiOrder(3, 'delivery', 'NEW', minutesAgo(5)),
    apiOrder(4, 'mesa', 'NEW', minutesAgo(25)),
    apiOrder(5, 'balcao', 'IN_PREPARATION', minutesAgo(30)),
  ];

  beforeAll(() => {
    if (typeof window.matchMedia !== 'function') {
      window.matchMedia = (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      });
    }
  });

  beforeEach(() => {
    getKitchenOrders.mockResolvedValue({ data: orders });
  });

  async function renderKitchen() {
    render(<Kitchen />);
    await screen.findByText('#0001');
  }

  function chip(name) {
    return screen.getByRole('button', { name });
  }

  it('seleciona Mesas e Comandas, volta para Todos e depois um canal', async () => {
    await renderKitchen();
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Mesas')).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(chip('Mesas'));
    expect(chip('Mesas')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('#0001')).toBeInTheDocument();
    expect(screen.getByText('#0004')).toBeInTheDocument();
    expect(screen.queryByText('#0002')).not.toBeInTheDocument();
    expect(screen.queryByText('#0003')).not.toBeInTheDocument();

    fireEvent.click(chip('Comandas'));
    expect(chip('Mesas')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Comandas')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('#0002')).toBeInTheDocument();
    expect(screen.queryByText('#0003')).not.toBeInTheDocument();

    fireEvent.click(chip('Todos'));
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Mesas')).toHaveAttribute('aria-pressed', 'false');
    expect(chip('Comandas')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('#0003')).toBeInTheDocument();
    expect(screen.getByText('#0005')).toBeInTheDocument();

    fireEvent.click(chip('Delivery'));
    expect(chip('Delivery')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('#0003')).toBeInTheDocument();
    expect(screen.queryByText('#0001')).not.toBeInTheDocument();

    fireEvent.click(chip('Delivery'));
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('#0001')).toBeInTheDocument();
    expect(screen.getByLabelText('Mostrar finalizados')).not.toBeChecked();
  });

  it('combina Atrasados com um canal sem desligar o outro ao voltar só para o atraso', async () => {
    await renderKitchen();
    fireEvent.click(chip('Atrasados'));
    expect(chip('Atrasados')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('#0004')).toBeInTheDocument();
    expect(screen.getByText('#0005')).toBeInTheDocument();
    expect(screen.queryByText('#0001')).not.toBeInTheDocument();

    fireEvent.click(chip('Mesas'));
    expect(chip('Mesas')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Atrasados')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('#0004')).toBeInTheDocument();
    expect(screen.queryByText('#0005')).not.toBeInTheDocument();
    expect(screen.queryByText('#0001')).not.toBeInTheDocument();

    fireEvent.click(chip('Mesas'));
    expect(chip('Atrasados')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('#0005')).toBeInTheDocument();

    fireEvent.click(chip('Todos'));
    expect(chip('Todos')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Atrasados')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('#0001')).toBeInTheDocument();
  });
});
