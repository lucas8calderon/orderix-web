import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SignupPage from './SignupPage';

jest.mock('axios', () => ({ post: jest.fn() }));

function setup(path = '/contratar?plan=PLAN_02') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SignupPage />
    </MemoryRouter>,
  );
}

test('pix signup does not ask for address or send a price', async () => {
  axios.post.mockResolvedValue({ data: { pixPayload: '000201', invoiceUrl: 'https://sandbox.asaas.com/i/1', storeActive: false } });
  setup();
  expect(screen.queryByLabelText('CEP')).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/CNPJ do estabelecimento/i)).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/boleto/i)).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Maria' } });
  fireEvent.change(screen.getByLabelText('CPF do responsável'), { target: { value: '529.982.247-25' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar contratação' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalled());
  const payload = axios.post.mock.calls[0][1];
  expect(axios.post.mock.calls[0][0]).toBe('/api/public/billing/signup');
  expect(payload.planCode).toBe('PLAN_02');
  expect(payload.billingType).toBe('PIX');
  expect(payload.price).toBeUndefined();
  expect(payload.postalCode).toBeUndefined();
  expect(await screen.findByText('Pagamento em confirmação')).toBeInTheDocument();
  expect(screen.getByTestId('pix-payload')).toHaveTextContent('000201');
  expect(screen.getByText('A loja ainda não está ativa.')).toBeInTheDocument();
});

test('card without postal code stays on the form', () => {
  setup('/contratar');
  fireEvent.click(screen.getByLabelText('Cartão'));
  expect(screen.getByLabelText('CEP')).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Maria' } });
  fireEvent.change(screen.getByLabelText('CPF do responsável'), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar contratação' }));
  expect(screen.getByRole('alert')).toHaveTextContent('telefone, CEP e número');
  expect(axios.post).not.toHaveBeenCalled();
});

test('api error stays visible and does not claim the store is active', async () => {
  axios.post.mockRejectedValue({ response: { data: { message: 'Plano inexistente.' } } });
  setup();
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Maria' } });
  fireEvent.change(screen.getByLabelText('CPF do responsável'), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar contratação' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Plano inexistente.');
  expect(screen.queryByText('Pagamento em confirmação')).not.toBeInTheDocument();
});
