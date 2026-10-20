import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PartnerLoginPage from './PartnerLoginPage';
import { loginPartner } from '../../services/partnerService';

jest.mock('../../services/partnerService', () => ({
  ...jest.requireActual('../../services/partnerService'),
  loginPartner: jest.fn(),
}));

function setup() {
  return render(
    <MemoryRouter initialEntries={['/parceiros/login']}>
      <Routes>
        <Route path="/parceiros/login" element={<PartnerLoginPage />} />
        <Route path="/parceiros/dashboard" element={<p>painel do parceiro</p>} />
        <Route path="/parceiros/recuperar-acesso" element={<p>recuperação</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('PartnerLoginPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('valida campos antes de chamar a API', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByText('Informe seu WhatsApp com DDD.')).toBeInTheDocument();
    expect(screen.getByText('Digite sua senha.')).toBeInTheDocument();
    expect(loginPartner).not.toHaveBeenCalled();
  });

  it('mostra e oculta a senha', () => {
    setup();
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }));
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('entra e vai para o dashboard de parceiros', async () => {
    loginPartner.mockResolvedValue({ role: 'PARTNER', firstName: 'Ana' });
    setup();
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '11999998888' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'abc12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByText('painel do parceiro')).toBeInTheDocument();
    expect(loginPartner).toHaveBeenCalledWith('(11) 99999-8888', 'abc12345');
  });

  it('mostra o erro da API sem sair da tela', async () => {
    loginPartner.mockRejectedValue({ response: { data: { message: 'Credenciais inválidas.' } } });
    setup();
    fireEvent.change(screen.getByLabelText('WhatsApp'), { target: { value: '11999998888' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'errada123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Credenciais inválidas.'));
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });

  it('oferece recuperação e cadastro', () => {
    setup();
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toHaveAttribute('href', '/parceiros/recuperar-acesso');
    fireEvent.click(screen.getByRole('button', { name: 'Quero ser parceiro' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
