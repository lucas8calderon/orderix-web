import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MasterSubscriptions } from './MasterSubscriptions';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('../../../services/apiConfig', () => ({}));

const ROW = {
  signupId: 1,
  storeId: 4,
  storeName: 'Padaria',
  contractorName: 'Contratante Teste',
  contractorEmail: 'loja@example.com',
  plan: 'PLAN_01',
  price: 39.9,
  status: 'ACTIVE',
  expiresAt: '2026-11-18',
  asaasSubscriptionId: 'sub_1',
  inviteMailPending: true,
  exempt: false,
  renewalCanceled: false,
  audits: [],
};

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url === '/api/billing/subscriptions/4') {
      return Promise.resolve({ data: { ...ROW, audits: [{ action: 'SUSPEND', reason: 'Conferência', createdAt: '2026-10-18T10:00:00' }] } });
    }
    return Promise.resolve({ data: [ROW] });
  });
  axios.post.mockResolvedValue({ status: 202 });
});

test('lists the contractor apart from the store and keeps the invite pending visible', async () => {
  render(<MasterSubscriptions />);
  expect(await screen.findByText('Padaria')).toBeInTheDocument();
  expect(screen.getByText('Contratante Teste')).toBeInTheDocument();
  expect(screen.getByText('Convite pendente')).toBeInTheDocument();
  expect(screen.queryByText(/cpf|cnpj|api key/i)).not.toBeInTheDocument();
});

test('suspend without a reason does not call the api', async () => {
  render(<MasterSubscriptions />);
  fireEvent.click(await screen.findByText('Padaria'));
  fireEvent.click(await screen.findByRole('button', { name: 'Suspender' }));
  expect(await screen.findByText('Informe o motivo.')).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
});

test('suspend with a reason is separate from cancel', async () => {
  render(<MasterSubscriptions />);
  fireEvent.click(await screen.findByText('Padaria'));
  fireEvent.change(await screen.findByLabelText('Motivo'), { target: { value: 'Conferência' } });
  fireEvent.click(screen.getByRole('button', { name: 'Suspender' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    '/api/billing/subscriptions/4/suspend',
    { reason: 'Conferência' },
  ));
  expect(axios.post).not.toHaveBeenCalledWith('/api/billing/subscriptions/4/cancel', expect.anything());
});
