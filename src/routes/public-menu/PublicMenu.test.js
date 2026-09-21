import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PublicMenu from './PublicMenu';
import { getPublicMenuBySlug } from '../../services/publicMenuService';

jest.mock('../../services/publicMenuService', () => ({
  getPublicMenuBySlug: jest.fn(),
}));

function renderMenu() {
  return render(
    <MemoryRouter initialEntries={['/cardapio/padaria']}>
      <Routes>
        <Route path="/cardapio/:slug" element={<PublicMenu />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PublicMenu', () => {
  it('mostra tag Fechado e o cardápio quando a loja está fechada', async () => {
    getPublicMenuBySlug.mockResolvedValue({
      status: 200,
      data: {
        storeName: 'Padaria Belas Artes',
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
    expect(screen.getByText('Pão francês')).toBeInTheDocument();
  });
});
