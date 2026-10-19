import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import ForgotPassword from './ForgotPassword';

jest.mock('axios', () => ({ post: jest.fn() }));
jest.mock('../../commons/components/ThemeToggleButton', () => ({
  ThemeToggleButton: () => null,
}));

function setup(path = '/forgot-password') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ForgotPassword />
    </MemoryRouter>,
  );
}

test('request does not reveal whether the account exists', async () => {
  axios.post.mockResolvedValue({ status: 204 });
  setup();
  fireEvent.change(screen.getByRole('textbox', { name: /E-mail/ }), { target: { value: 'maria@example.com' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar link' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    '/api/auth/password/forgot',
    { email: 'maria@example.com' },
    { timeout: 60000 },
  ));
  expect(await screen.findByText(/Se houver uma conta com este e-mail/)).toBeInTheDocument();
  expect(screen.queryByText(/não está disponível/)).not.toBeInTheDocument();
});

test('reset link posts the token and the new password', async () => {
  axios.post.mockResolvedValue({ status: 204 });
  setup('/forgot-password?token=token-unico');
  fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
    '/api/auth/password/reset',
    { token: 'token-unico', password: 'senha123' },
    { timeout: 60000 },
  ));
  expect(await screen.findByText(/Senha redefinida/)).toBeInTheDocument();
});

test('mismatched confirmation does not call the api', () => {
  setup('/forgot-password?token=token-unico');
  fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'outra' } });
  fireEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
  expect(screen.getByRole('alert')).toHaveTextContent('não confere');
  expect(axios.post).not.toHaveBeenCalled();
});

test('expired link stays on the form', async () => {
  axios.post.mockRejectedValue({ response: { data: { message: 'Link expirado ou já utilizado.' } } });
  setup('/forgot-password?token=token-unico');
  fireEvent.change(screen.getByLabelText('Nova senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Redefinir senha' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Link expirado ou já utilizado.');
  expect(screen.queryByText(/Senha redefinida/)).not.toBeInTheDocument();
});
