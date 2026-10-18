import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import AcceptInvitePage from './AcceptInvitePage';

jest.mock('axios', () => ({ post: jest.fn() }));

function setup(path = '/convite?token=token-unico') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AcceptInvitePage />
    </MemoryRouter>,
  );
}

test('link token is sent with the new password', async () => {
  axios.post.mockResolvedValue({ status: 204 });
  setup();
  expect(screen.getByLabelText('Código do convite')).toHaveValue('token-unico');
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Definir senha' }));
  await waitFor(() => expect(axios.post).toHaveBeenCalledWith('/api/auth/invite/accept', {
    token: 'token-unico',
    password: 'senha123',
  }, { timeout: 60000 }));
  expect(await screen.findByText('Senha definida')).toBeInTheDocument();
});

test('mismatched confirmation does not call the api', () => {
  setup('/convite');
  fireEvent.change(screen.getByLabelText('Código do convite'), { target: { value: 'token-unico' } });
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'outra' } });
  fireEvent.click(screen.getByRole('button', { name: 'Definir senha' }));
  expect(screen.getByRole('alert')).toHaveTextContent('não confere');
  expect(axios.post).not.toHaveBeenCalled();
});

test('slow server asks to try again', async () => {
  axios.post.mockRejectedValue({ code: 'ECONNABORTED' });
  setup();
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Definir senha' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('demorou para responder');
});

test('api error stays on the form', async () => {
  axios.post.mockRejectedValue({ response: { data: { message: 'Convite expirado ou já utilizado.' } } });
  setup();
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } });
  fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: 'senha123' } });
  fireEvent.click(screen.getByRole('button', { name: 'Definir senha' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Convite expirado ou já utilizado.');
  expect(screen.queryByText('Senha definida')).not.toBeInTheDocument();
});
