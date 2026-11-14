import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MercadoPagoReturnPage from './MercadoPagoReturnPage';
import { completeMercadoPagoOAuth } from '../../../services/paymentConfigService';

jest.mock('../../../services/paymentConfigService', () => ({
  completeMercadoPagoOAuth: jest.fn(),
}));

function renderAt(search) {
  return render(
    <MemoryRouter initialEntries={[`/app/configuracoes/mercado-pago/retorno${search}`]}>
      <MercadoPagoReturnPage />
    </MemoryRouter>,
  );
}

describe('retorno do Conectar com Mercado Pago', () => {
  beforeEach(() => {
    completeMercadoPagoOAuth.mockReset();
  });

  it('entrega code e state ao backend uma vez e confirma a conexão', async () => {
    completeMercadoPagoOAuth.mockResolvedValue({ data: { ok: true } });
    renderAt('?code=TG-123&state=abc');

    expect(await screen.findByText(/Mercado Pago conectado/)).toBeInTheDocument();
    expect(completeMercadoPagoOAuth).toHaveBeenCalledTimes(1);
    expect(completeMercadoPagoOAuth).toHaveBeenCalledWith('TG-123', 'abc');
    expect(screen.getByRole('link', { name: 'Voltar às configurações' })).toHaveAttribute('href', '/app/configuracoes');
  });

  it('mostra a mensagem do servidor quando a conexão é recusada', async () => {
    completeMercadoPagoOAuth.mockRejectedValue({
      response: { data: { message: 'Esta tentativa de conexão expirou.' } },
    });
    renderAt('?code=TG-123&state=abc');

    expect(await screen.findByText('Esta tentativa de conexão expirou.')).toBeInTheDocument();
  });

  it('não chama o backend quando a loja negou a autorização', () => {
    renderAt('?error=access_denied&state=abc');

    expect(screen.getByText(/não foi autorizada no Mercado Pago/)).toBeInTheDocument();
    expect(completeMercadoPagoOAuth).not.toHaveBeenCalled();
  });
});
