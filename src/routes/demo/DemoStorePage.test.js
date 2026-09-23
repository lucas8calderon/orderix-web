import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import DemoIndex from './DemoIndex';
import DemoStorePage from './DemoStorePage';
import { DEMO_STORES_SECTION_ID } from './demoStores';

function renderStore(slug) {
  return render(
    <MemoryRouter initialEntries={[`/demo/${slug}`]}>
      <Routes>
        <Route path="/demo/:slug" element={<DemoStorePage />} />
        <Route path="/demo" element={<DemoIndex />} />
      </Routes>
    </MemoryRouter>
  );
}

async function simulateOrder(slug = 'weper-burger') {
  renderStore(slug);
  fireEvent.click(screen.getByRole('button', { name: 'Ver Smash Original' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Adicionar ao carrinho' }));
  fireEvent.click(await screen.findByRole('button', { name: /Ver carrinho/ }));
  fireEvent.click(await screen.findByRole('button', { name: 'Ir para o checkout' }));
  fireEvent.click(screen.getByRole('button', { name: 'Simular pedido' }));
  expect(await screen.findByRole('heading', { name: 'Pedido #1042' })).toBeInTheDocument();
}

describe('DemoStorePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  it('não adiciona produto indisponível e isola o localStorage', async () => {
    renderStore('weper-burger');

    expect(screen.getByRole('heading', { name: 'Weper Burger' })).toBeInTheDocument();
    expect(screen.getByText('Você está explorando uma demonstração da Weper.')).toBeInTheDocument();

    const unavailable = screen.getByRole('button', { name: 'Veggie Weper indisponível' });
    expect(unavailable).toBeDisabled();
    fireEvent.click(unavailable);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver Smash Original' }));
    const sheet = await screen.findByRole('dialog');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Adicionar ao carrinho' }));

    await waitFor(() => {
      expect(window.localStorage.getItem('weper_demo_cart_weper-burger')).toBeTruthy();
    });
    expect(window.localStorage.getItem('weper.delivery.cart.weper-burger')).toBeNull();
  });

  it('filtra o cardápio pela busca', () => {
    renderStore('weper-pizza');
    expect(screen.getByRole('button', { name: 'Portuguesa indisponível' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Ver Calabresa' }));
    expect(screen.getByText('Tamanho')).toBeInTheDocument();
    expect(screen.getByLabelText(/Borda de catupiry/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.change(screen.getByLabelText('Buscar no cardápio'), { target: { value: 'calabresa' } });
    expect(screen.getByRole('heading', { name: 'Calabresa' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Margherita' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Portuguesa indisponível' })).not.toBeInTheDocument();
  });

  it('simula pedido local sem chamar API e mostra layout de acompanhamento', async () => {
    await simulateOrder();

    expect(screen.getByText(/Demonstração — nenhum pedido real foi enviado/i)).toBeInTheDocument();
    expect(screen.getByText('Weper Burger', { selector: '.dt-store-name' })).toBeInTheDocument();
    expect(screen.getAllByText('Em preparação').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText('Progresso do pedido')).toBeInTheDocument();
    expect(screen.getByLabelText('Resumo do pedido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar ao início' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quero a Weper no meu negócio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar explorando' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Outras lojas de demonstração' })).toHaveAttribute(
      'href',
      `/demo#${DEMO_STORES_SECTION_ID}`
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('weper_demo_cart_weper-burger')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao início' }));
    expect(await screen.findByRole('heading', { name: 'Weper Burger' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Pedido #1042' })).not.toBeInTheDocument();
  });

  it('navega para a seção de outras lojas de demonstração a partir do sucesso', async () => {
    await simulateOrder();

    fireEvent.click(screen.getByRole('link', { name: 'Outras lojas de demonstração' }));

    expect(await screen.findByRole('heading', { name: 'Veja a Weper em ação' })).toBeInTheDocument();
    const storesSection = document.getElementById(DEMO_STORES_SECTION_ID);
    expect(storesSection).toBeTruthy();
    expect(within(storesSection).getByRole('link', { name: /Weper Burger/i })).toBeInTheDocument();
    expect(within(storesSection).getByRole('link', { name: /Weper Pizza/i })).toBeInTheDocument();
  });
});
