import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicDelivery from './PublicDelivery';
import { getDeliveryCatalog } from '../../services/deliveryService';
import {
  productHighlightBadge,
  productTags,
  storeInitials,
} from './utils/resolveDeliveryImage';

jest.mock('../../services/deliveryService', () => ({
  getDeliveryCatalog: jest.fn(),
  createDeliveryOrder: jest.fn(),
}));

function renderDelivery() {
  return render(
    <MemoryRouter initialEntries={['/delivery/padaria']}>
      <Routes>
        <Route path="/delivery/:slug" element={<PublicDelivery />} />
      </Routes>
    </MemoryRouter>
  );
}

const closedCatalog = {
  storeName: 'Padaria Belas Artes',
  storeAddress: 'Rua das Flores, 100',
  open: false,
  acceptingOrders: false,
  estimatedMinutes: 40,
  schedule: [
    { weekday: 1, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 2, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 3, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 4, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 5, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 6, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    { weekday: 7, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
  ],
  deliveryFee: 5,
  minOrder: 0,
  categories: [
    {
      id: 1,
      name: 'Pães',
      products: [
        { id: 10, name: 'Pão francês', value: 1.5, isAvailable: true, extras: [] },
        { id: 11, name: 'Bolo', value: 12, isAvailable: false, extras: [] },
      ],
    },
    {
      id: 2,
      name: 'Bebidas',
      products: [
        { id: 20, name: 'Suco', value: 8, isAvailable: true, extras: [] },
      ],
    },
  ],
};

describe('PublicDelivery', () => {
  beforeEach(() => {
    window.localStorage.clear();
    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver;
  });

  it('mostra loja fechada, busca e impede checkout', async () => {
    getDeliveryCatalog.mockResolvedValue({ data: closedCatalog });

    renderDelivery();

    expect(await screen.findByTestId('delivery-open-badge')).toHaveTextContent('Fechado');
    expect(screen.getByText(/não é possível enviar pedido/i)).toBeInTheDocument();
    expect(screen.getByText('Pão francês')).toBeInTheDocument();
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
    expect(screen.getByText('40 min')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /ver endereço/i }));
    expect(screen.getByText('Rua das Flores, 100')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/buscar no cardápio/i), 'bolo');
    expect(screen.queryByText('Pão francês')).not.toBeInTheDocument();
    expect(screen.getByText('Bolo')).toBeInTheDocument();
  });

  it('renderiza categorias e cardápio aberto', async () => {
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
      },
    });

    renderDelivery();

    expect(await screen.findByTestId('delivery-open-badge')).toHaveTextContent('Aberto agora');
    expect(screen.getByRole('navigation', { name: /categorias/i })).toBeInTheDocument();
    expect(within(screen.getByRole('navigation', { name: /categorias/i })).getByText('Pães')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pães' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar pão francês/i })).toBeInTheDocument();
  });

  it('mostra estado vazio quando a API falha', async () => {
    getDeliveryCatalog.mockRejectedValue({ response: { data: { message: 'Delivery não encontrado' } } });
    renderDelivery();
    expect(await screen.findByText('Delivery indisponível')).toBeInTheDocument();
    expect(screen.getByText('Delivery não encontrado')).toBeInTheDocument();
  });

  it('mostra skeleton enquanto carrega', () => {
    getDeliveryCatalog.mockReturnValue(new Promise(() => {}));
    renderDelivery();
    expect(screen.getByLabelText(/carregando cardápio/i)).toBeInTheDocument();
  });

  it('mostra CTA do último pedido quando há token no localStorage', async () => {
    window.localStorage.setItem(
      'weper.delivery.lastOrder.padaria',
      JSON.stringify({ token: 'tok-last', orderId: 7, createdAt: '2026-09-20T12:00:00.000Z' })
    );
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
      },
    });

    renderDelivery();

    expect(await screen.findByRole('button', { name: /Ver meu último pedido/i })).toBeInTheDocument();
  });

  it('não mostra CTA do último pedido sem token salvo', async () => {
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
      },
    });

    renderDelivery();

    expect(await screen.findByTestId('delivery-open-badge')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver meu último pedido/i })).not.toBeInTheDocument();
  });
});

describe('resolveDeliveryImage helpers', () => {
  it('gera iniciais e tags/badges só com dados reais', () => {
    expect(storeInitials('Minions Burger')).toBe('MB');
    expect(productTags({ tags: ['Cheddar', 'Bacon'] })).toEqual(['Cheddar', 'Bacon']);
    expect(productTags({ observation: 'com cheddar' })).toEqual([]);
    expect(productHighlightBadge({ featured: true })).toBe('Destaque');
    expect(productHighlightBadge({ badgeLabel: 'Mais pedido' })).toBe('Mais pedido');
    expect(productHighlightBadge({})).toBeNull();
  });
});
