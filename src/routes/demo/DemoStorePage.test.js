import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import axios from 'axios';
import DemoStorePage from './DemoStorePage';

function renderStore(slug) {
  return render(
    <MemoryRouter initialEntries={[`/demo/${slug}`]}>
      <Routes>
        <Route path="/demo/:slug" element={<DemoStorePage />} />
      </Routes>
    </MemoryRouter>
  );
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

  it('simula pedido local sem chamar API', async () => {
    renderStore('weper-burger');
    fireEvent.click(screen.getByRole('button', { name: 'Ver Smash Original' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Adicionar ao carrinho' }));
    fireEvent.click(await screen.findByRole('button', { name: /Ver carrinho/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Ir para o checkout' }));
    fireEvent.click(screen.getByRole('button', { name: 'Simular pedido' }));

    expect(await screen.findByText('Pedido simulado')).toBeInTheDocument();
    expect(screen.getByText('Pedido #1042')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
    expect(window.localStorage.getItem('weper_demo_cart_weper-burger')).toBeNull();
  });
});
