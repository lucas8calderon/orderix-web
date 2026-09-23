import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeliveryAccountPage from './DeliveryAccountPage';
import {
  getDeliveryCustomerMe,
  listDeliveryCustomerAddresses,
} from '../../services/deliveryCustomerService';
import { saveDeliveryCustomerSession } from '../../services/deliveryCustomerSession';

jest.mock('../../services/deliveryCustomerService', () => ({
  getDeliveryCustomerMe: jest.fn(),
  listDeliveryCustomerAddresses: jest.fn(),
}));

function renderAccount() {
  return render(
    <MemoryRouter initialEntries={['/delivery/minions/conta']}>
      <Routes>
        <Route path="/delivery/:slug/conta" element={<DeliveryAccountPage />} />
        <Route path="/delivery/:slug" element={<div>Cardápio da loja</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('DeliveryAccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    getDeliveryCustomerMe.mockResolvedValue({
      data: { name: 'Lucas Silva', email: 'lucas@email.com', phone: '11988887777' },
    });
    listDeliveryCustomerAddresses.mockResolvedValue({
      data: [{
        id: 1,
        label: 'Casa',
        street: 'Rua A',
        number: '10',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        isDefault: true,
      }],
    });
  });

  it('mostra os dados da conta logada', async () => {
    saveDeliveryCustomerSession({
      token: 'jwt',
      name: 'Lucas Silva',
      email: 'lucas@email.com',
      phone: '11988887777',
    });

    renderAccount();

    expect(await screen.findByRole('heading', { name: 'Minha conta' })).toBeInTheDocument();
    expect(await screen.findByText('lucas@email.com')).toBeInTheDocument();
    expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    expect(screen.getByText('(11) 98888-7777')).toBeInTheDocument();
    expect(screen.getByText(/Rua A, 10/)).toBeInTheDocument();
  });

  it('pede login quando não há sessão', async () => {
    renderAccount();

    expect(await screen.findByText(/entre na sua conta/i)).toBeInTheDocument();
    expect(screen.queryByText('Lucas Silva')).not.toBeInTheDocument();
  });

  it('a barra Conta permanece na página da conta', async () => {
    saveDeliveryCustomerSession({
      token: 'jwt',
      name: 'Lucas Silva',
      email: 'lucas@email.com',
      phone: '11988887777',
    });

    renderAccount();
    await screen.findByText('Lucas Silva');

    await userEvent.click(screen.getByRole('button', { name: 'Conta' }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Minha conta' })).toBeInTheDocument();
    });
  });
});
