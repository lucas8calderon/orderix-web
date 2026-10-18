import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { saveSession, clearSession } from '../../services/session';
import SubscriptionBlocked from './SubscriptionBlocked';

function renderPage() {
  return render(
    <MemoryRouter>
      <SubscriptionBlocked />
    </MemoryRouter>,
  );
}

afterEach(() => {
  clearSession();
});

test('day 8 offers consultation, regularization and finishing started orders', () => {
  saveSession('token', {
    role: 'STORE_ADMIN',
    storeId: 10,
    subscriptionActive: false,
    subscriptionStatus: 'BLOCKED',
  });
  renderPage();
  expect(screen.getByRole('heading', { name: 'Assinatura suspensa' })).toBeInTheDocument();
  expect(screen.getByText(/consulta, regularização/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Consultar a loja' })).toHaveAttribute('href', '/app/dashboard');
  expect(screen.getByRole('link', { name: 'Regularizar a mensalidade' })).toHaveAttribute('href', '/app/configuracoes/empresa');
  expect(screen.getByRole('link', { name: 'Concluir pedidos em andamento' })).toHaveAttribute('href', '/app/atendimento');
});

test('pending payment stays a dead end without operational routes', () => {
  saveSession('token', {
    role: 'STORE_ADMIN',
    storeId: 10,
    subscriptionActive: false,
    subscriptionStatus: 'PENDING',
  });
  renderPage();
  expect(screen.getByRole('heading', { name: 'Assinatura indisponível' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Consultar a loja' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Regularizar a mensalidade' })).not.toBeInTheDocument();
});

test('kitchen can finish started orders and does not regularize', () => {
  saveSession('token', {
    role: 'KITCHEN',
    storeId: 10,
    subscriptionActive: false,
    subscriptionStatus: 'BLOCKED',
  });
  renderPage();
  expect(screen.getByRole('link', { name: 'Consultar e concluir pedidos em andamento' })).toHaveAttribute('href', '/app/cozinha');
  expect(screen.getByText(/administrador da loja/i)).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Regularizar a mensalidade' })).not.toBeInTheDocument();
});
