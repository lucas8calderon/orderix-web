import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicDelivery from './PublicDelivery';
import { getDeliveryCatalog } from '../../services/deliveryService';
import { listDeliveryCustomerAddresses } from '../../services/deliveryCustomerService';
import { lookupCep } from '../../services/viaCepService';
import {
  productHighlightBadge,
  productTags,
  storeInitials,
} from './utils/resolveDeliveryImage';

jest.mock('../../services/deliveryService', () => ({
  getDeliveryCatalog: jest.fn(),
  createDeliveryOrder: jest.fn(),
}));

jest.mock('../../services/deliveryCustomerService', () => ({
  listDeliveryCustomerAddresses: jest.fn().mockResolvedValue({ data: [] }),
  loginDeliveryCustomer: jest.fn(),
  registerDeliveryCustomer: jest.fn(),
}));

jest.mock('../../services/viaCepService', () => ({
  CEP_NOT_FOUND: 'CEP_NOT_FOUND',
  lookupCep: jest.fn(),
}));

function seedCustomerSession() {
  window.localStorage.setItem('weper.delivery.customer.session', JSON.stringify({
    token: 'customer-token',
    id: 1,
    name: 'Ana Cliente',
    email: 'ana@test.com',
    phone: '11988888888',
  }));
}

async function openCheckoutFromMenu() {
  await userEvent.click(await screen.findByRole('button', { name: /adicionar pão francês/i }));
  await userEvent.click(screen.getByRole('button', { name: /adicionar ao carrinho/i }));
  await userEvent.click(await screen.findByRole('button', { name: /ver meu pedido/i }));
  await userEvent.click(await screen.findByRole('button', { name: /finalizar pedido/i }));
}

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
    lookupCep.mockReset();
    listDeliveryCustomerAddresses.mockReset();
    listDeliveryCustomerAddresses.mockResolvedValue({ data: [] });
    window.HTMLElement.prototype.scrollTo = jest.fn();
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
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument();
    expect(screen.getByText(/não é possível enviar pedido/i)).toBeInTheDocument();
    expect(screen.queryByText('Segunda-feira')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loja fechada/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.getByText('Pão francês')).toBeInTheDocument();
    expect(screen.getByText('Indisponível')).toBeInTheDocument();
    expect(screen.getByText('40 min')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /loja fechada/i }));
    expect(screen.getByText('Segunda-feira')).toBeInTheDocument();
    expect(screen.getAllByText('08:00 às 22:00').length).toBeGreaterThan(0);

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
    expect(screen.getByRole('navigation', { name: /navegação do delivery/i })).toBeInTheDocument();
  });

  it('pede login antes de preencher o endereço no checkout', async () => {
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
      },
    });

    renderDelivery();
    await openCheckoutFromMenu();

    expect(await screen.findByRole('heading', { name: /entre ou crie uma conta/i })).toBeInTheDocument();
    expect(screen.getByText(/para informar o endereço de entrega/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^CEP/i)).not.toBeInTheDocument();
  });

  it('mostra endereço salvo depois do login', async () => {
    seedCustomerSession();
    listDeliveryCustomerAddresses.mockResolvedValue({
      data: [{
        id: 9,
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        postalCode: '01310100',
        city: 'São Paulo',
        state: 'SP',
        isDefault: true,
      }],
    });
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
      },
    });

    renderDelivery();
    await openCheckoutFromMenu();

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /Avenida Paulista, 1000 — Bela Vista/i })).toBeChecked();
    });
    expect(screen.getByRole('radio', { name: /cadastrar outro endereço/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^CEP/i)).not.toBeInTheDocument();
  });

  it('preenche o endereço ao informar um CEP válido', async () => {
    seedCustomerSession();
    lookupCep.mockResolvedValue({
      postalCode: '01310-100',
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    });
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
      },
    });

    renderDelivery();
    await openCheckoutFromMenu();
    await userEvent.type(await screen.findByLabelText(/^CEP/i), '01310100');

    expect(await screen.findByDisplayValue('Avenida Paulista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bela Vista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
    expect(lookupCep).toHaveBeenCalledWith('01310100', expect.objectContaining({ signal: expect.any(AbortSignal) }));
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

  it('mostra Pix online, meios na entrega e seletor de fulfillment no checkout autenticado', async () => {
    seedCustomerSession();
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
        onlinePixEnabled: true,
        fulfillmentModes: ['DELIVERY', 'PICKUP'],
      },
    });

    renderDelivery();
    await openCheckoutFromMenu();

    expect(await screen.findByText('Pague online')).toBeInTheDocument();
    expect(screen.getByText('Pague na entrega')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^entrega$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^retirada$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^CEP/i)).toBeInTheDocument();
    const pixOptions = screen.getAllByRole('radio', { name: /^pix$/i });
    expect(pixOptions[0]).toBeChecked();
    expect(pixOptions[1]).not.toBeChecked();
  });

  it('omite escolha de fulfillment quando a loja só faz retirada', async () => {
    seedCustomerSession();
    getDeliveryCatalog.mockResolvedValue({
      data: {
        ...closedCatalog,
        open: true,
        acceptingOrders: true,
        fulfillmentModes: ['PICKUP'],
      },
    });

    renderDelivery();
    await openCheckoutFromMenu();

    expect(await screen.findByLabelText(/^Nome/i)).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^entrega$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^retirada$/i })).not.toBeInTheDocument();
    expect(screen.getByText('Retirada na loja')).toBeInTheDocument();
    expect(screen.queryByLabelText(/^CEP/i)).not.toBeInTheDocument();
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
