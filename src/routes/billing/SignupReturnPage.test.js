import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import SignupReturnPage from './SignupReturnPage';

jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: {},
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

test('returning from the invoice does not call the API or mark the store active', () => {
  render(
    <MemoryRouter>
      <SignupReturnPage />
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Pagamento em confirmação' })).toBeInTheDocument();
  expect(screen.getByText('A loja ainda não está ativa.')).toBeInTheDocument();
  expect(screen.getByText(/Voltar da fatura não ativa a loja/i)).toBeInTheDocument();
  expect(axios.post).not.toHaveBeenCalled();
  expect(axios.get).not.toHaveBeenCalled();
});
