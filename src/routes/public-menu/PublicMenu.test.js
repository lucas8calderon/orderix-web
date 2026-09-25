import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicMenu from './PublicMenu';
import { getPublicMenuBySlug } from '../../services/publicMenuService';
import { selectionStorageKey } from './selection/selectionConstants';
import { WEPER_COMMERCIAL_URL } from '../../config/weperSite';

jest.mock('../../services/publicMenuService', () => ({
  getPublicMenuBySlug: jest.fn(),
}));

const menuPayload = {
  storeName: 'Padaria Belas Artes',
  slug: 'padaria',
  open: true,
  acceptingOrders: true,
  schedule: [],
  categories: [
    {
      id: 1,
      name: 'Lanches',
      products: [
        { id: 10, name: 'X-Bacon', value: 22, isAvailable: true },
        { id: 11, name: 'X-Salada', value: 18, isAvailable: false },
      ],
    },
    {
      id: 2,
      name: 'Bebidas',
      products: [
        { id: 20, name: 'Coca', value: 6, isAvailable: true },
      ],
    },
  ],
};

function renderMenu(path = '/cardapio/padaria') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/cardapio/:slug" element={<PublicMenu />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicMenu — Minha seleção', () => {
  beforeEach(() => {
    window.localStorage.clear();
    getPublicMenuBySlug.mockResolvedValue({
      status: 200,
      data: menuPayload,
    });
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('seleciona, altera quantidade e remove sem chamar API de pedido', async () => {
    renderMenu();
    expect(await screen.findByText('X-Bacon')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Selecionar X-Bacon' }));
    expect(screen.getByRole('button', { name: 'Remover X-Bacon da seleção' })).toBeInTheDocument();
    expect(screen.getByText('1 item selecionado')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Aumentar quantidade de X-Bacon' }));
    expect(screen.getByText('2 itens selecionados')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Diminuir quantidade de X-Bacon' }));
    await userEvent.click(screen.getByRole('button', { name: 'Diminuir quantidade de X-Bacon' }));
    expect(screen.queryByText(/itens selecionados|item selecionado/)).not.toBeInTheDocument();

    expect(getPublicMenuBySlug).toHaveBeenCalledTimes(1);
    expect(getPublicMenuBySlug.mock.calls.every((call) => String(call[0]).includes('padaria'))).toBe(true);
  });

  it('filtro Selecionados não é categoria e busca não limpa a seleção', async () => {
    renderMenu();
    await screen.findByText('X-Bacon');

    await userEvent.click(screen.getByRole('button', { name: 'Selecionar X-Bacon' }));
    await userEvent.click(screen.getByRole('button', { name: /Bebidas/i }));
    expect(screen.getByText('Coca')).toBeInTheDocument();
    expect(screen.getByText('1 item selecionado')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Selecionados \(1\)/ }));
    expect(screen.getByText('X-Bacon')).toBeInTheDocument();
    expect(screen.queryByText('Coca')).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Categorias' })).not.toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Buscar no cardápio'), 'xyz');
    expect(screen.getByText(/Nenhum item selecionado corresponde à busca/i)).toBeInTheDocument();
    expect(screen.getByText('1 item selecionado')).toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('Buscar no cardápio'));
    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getByRole('navigation', { name: 'Categorias' })).toBeInTheDocument();
  });

  it('persiste por storeId e remove órfãos ao carregar', async () => {
    const key = selectionStorageKey('padaria');
    window.localStorage.setItem(key, JSON.stringify({
      storeId: 'padaria',
      updatedAt: new Date().toISOString(),
      items: [
        { productId: 10, quantity: 2 },
        { productId: 999, quantity: 1 },
      ],
    }));

    renderMenu();
    expect(await screen.findByText('2 itens selecionados')).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(key));
    expect(stored.items).toEqual([{ productId: 10, quantity: 2 }]);
  });

  it('indisponível não aumenta quantidade e mostra rótulo', async () => {
    renderMenu();
    await screen.findByText('X-Salada');

    await userEvent.click(screen.getByRole('button', { name: /Lanches/i }));
    expect(screen.getByText('Indisponível')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Selecionar X-Salada' }));
    const increase = screen.getByRole('button', { name: 'Aumentar quantidade de X-Salada' });
    expect(increase).toBeDisabled();
    await userEvent.click(increase);
    expect(screen.getByText('1 item selecionado')).toBeInTheDocument();
  });

  it('abre Minha seleção com valor estimado e limpa com confirmação', async () => {
    renderMenu();
    await screen.findByText('X-Bacon');

    await userEvent.click(screen.getByRole('button', { name: 'Selecionar X-Bacon' }));
    await userEvent.click(screen.getByRole('button', { name: 'Aumentar quantidade de X-Bacon' }));
    await userEvent.click(screen.getByRole('button', { name: /Bebidas/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Selecionar Coca' }));

    await userEvent.click(screen.getByRole('button', { name: /Ver seleção/i }));
    const panel = screen.getByRole('dialog');
    expect(within(panel).getByText('Minha seleção')).toBeInTheDocument();
    expect(within(panel).getByText(/3 itens selecionados/i)).toBeInTheDocument();
    expect(within(panel).getByText(/Valor estimado/i)).toBeInTheDocument();
    expect(within(panel).getByText(/lembrar suas escolhas/i)).toBeInTheDocument();
    expect(within(panel).queryByText(/pedido|checkout|pagamento/i)).not.toBeInTheDocument();

    await userEvent.click(within(panel).getByRole('button', { name: 'Limpar seleção' }));
    const confirmDialog = screen.getByRole('dialog', { name: /Limpar seleção/i });
    expect(within(confirmDialog).getByText(/Remover todos os 3 itens/i)).toBeInTheDocument();
    await userEvent.click(within(confirmDialog).getByRole('button', { name: 'Limpar seleção' }));
    expect(screen.queryByRole('button', { name: /Ver seleção/i })).not.toBeInTheDocument();
    expect(screen.queryByText('3 itens selecionados')).not.toBeInTheDocument();
  });
});

describe('PublicMenu — assinatura Weper', () => {
  it('mostra a assinatura depois dos produtos e só o nome da marca é link', async () => {
    getPublicMenuBySlug.mockResolvedValue({
      status: 200,
      data: menuPayload,
    });
    renderMenu();
    expect(await screen.findByText('X-Bacon')).toBeInTheDocument();

    const prefix = screen.getByText('Cardápio digital por');
    expect(prefix.closest('a')).toBeNull();

    const link = screen.getByRole('link', { name: /weper/i });
    expect(link).toHaveAttribute('href', WEPER_COMMERCIAL_URL);
    expect(WEPER_COMMERCIAL_URL).toBe('https://weper.com.br');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('↗');
  });
});

describe('PublicMenu — fechado', () => {
  it('mostra tag Fechado e o cardápio quando a loja está fechada', async () => {
    getPublicMenuBySlug.mockResolvedValue({
      status: 200,
      data: {
        storeName: 'Padaria Belas Artes',
        slug: 'padaria',
        open: false,
        acceptingOrders: false,
        schedule: [
          { weekday: 1, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
          { weekday: 2, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
          { weekday: 3, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
          { weekday: 4, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
          { weekday: 5, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
          { weekday: 6, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
          { weekday: 7, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
        ],
        categories: [
          {
            id: 1,
            name: 'Pães',
            products: [{ id: 10, name: 'Pão francês', value: 1.5, isAvailable: true }],
          },
        ],
      },
    });

    renderMenu();

    expect(await screen.findByText('Fechado')).toBeInTheDocument();
    expect(screen.getByText(/está fechado no momento/i)).toBeInTheDocument();
    expect(screen.getByText(/não é possível enviar pedido/i)).toBeInTheDocument();
    expect(screen.queryByText('Segunda-feira')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /está fechado no momento/i })
    ).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(screen.getByRole('button', { name: /está fechado no momento/i }));
    expect(screen.getByText('Segunda-feira')).toBeInTheDocument();
    expect(screen.getByText('Pão francês')).toBeInTheDocument();
  });
});
