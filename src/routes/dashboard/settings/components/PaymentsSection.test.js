import { fireEvent, render, screen } from '@testing-library/react';
import { PaymentsSection } from './PaymentsSection';

const baseSettings = {
  tableTiming: 'AFTER_KITCHEN',
  comandaTiming: 'AFTER_KITCHEN',
  counterTiming: 'AFTER_KITCHEN',
  tablePaymentMode: 'MANUAL_CONFIRMATION',
  comandaPaymentMode: 'MANUAL_CONFIRMATION',
  counterPaymentMode: 'MANUAL_CONFIRMATION',
  tablePaymentProvider: 'NONE',
  comandaPaymentProvider: 'NONE',
  counterPaymentProvider: 'NONE',
  tableFallbackMode: 'BLOCK',
  comandaFallbackMode: 'BLOCK',
  counterFallbackMode: 'BLOCK',
  waiterPaymentEnabled: true,
  defaultProvider: 'NONE',
  infinitePayHandle: '',
  infinitePayDocument: '',
  paymentMethods: { PIX: true, DEBIT: true, CREDIT: true, CASH: true, VOUCHER: false, OTHER: false },
};

function renderSection(settings = {}, onSettingChange = jest.fn()) {
  return render(
    <PaymentsSection
      settings={{ ...baseSettings, ...settings }}
      onSettingChange={onSettingChange}
      onSave={jest.fn()}
      getPaymentMethodLabel={(method) => method}
      switchStyles={{}}
      saving={false}
    />,
  );
}

describe('PaymentsSection', () => {
  it('mostra os três canais com modo e momento', () => {
    renderSection();
    expect(screen.getByText('Pedidos e pagamentos')).toBeInTheDocument();
    expect(screen.getByText('Mesa')).toBeInTheDocument();
    expect(screen.getByText('Comanda')).toBeInTheDocument();
    expect(screen.getByText('Balcão')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Modo de pagamento')).toHaveLength(3);
    expect(screen.getAllByLabelText('Quando cobrar')).toHaveLength(3);
  });

  it('oculta o momento da cobrança quando o canal é somente pedidos', () => {
    renderSection({ tablePaymentMode: 'ORDER_ONLY' });
    expect(screen.getAllByLabelText('Quando cobrar')).toHaveLength(2);
  });

  it('permite alterar o modo da mesa e zera o provider', () => {
    const onSettingChange = jest.fn();
    renderSection({}, onSettingChange);
    fireEvent.mouseDown(screen.getAllByLabelText('Modo de pagamento')[1]);
    fireEvent.click(screen.getByRole('option', { name: 'Somente lançar pedidos' }));
    expect(onSettingChange).toHaveBeenCalledWith('tablePaymentMode', null, 'ORDER_ONLY');
    expect(onSettingChange).toHaveBeenCalledWith('tablePaymentProvider', null, 'NONE');
  });

  it('ao escolher integrado define InfinitePay e fallback BLOCK', () => {
    const onSettingChange = jest.fn();
    renderSection({}, onSettingChange);
    fireEvent.mouseDown(screen.getAllByLabelText('Modo de pagamento')[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Pagamento integrado' }));
    expect(onSettingChange).toHaveBeenCalledWith('counterPaymentMode', null, 'INTEGRATED_PAYMENT');
    expect(onSettingChange).toHaveBeenCalledWith('counterPaymentProvider', null, 'INFINITEPAY');
    expect(onSettingChange).toHaveBeenCalledWith('counterFallbackMode', null, 'BLOCK');
  });

  it('mostra fallback só no canal integrado', () => {
    renderSection({ counterPaymentMode: 'INTEGRATED_PAYMENT', counterPaymentProvider: 'INFINITEPAY' });
    expect(screen.getAllByLabelText('Se o InfinitePay não estiver disponível')).toHaveLength(1);
    expect(screen.getByText(/Integração: InfinitePay/)).toBeInTheDocument();
  });

  it('permite alterar o momento do balcão independentemente', () => {
    const onSettingChange = jest.fn();
    renderSection({ counterPaymentMode: 'INTEGRATED_PAYMENT', counterPaymentProvider: 'INFINITEPAY' }, onSettingChange);
    fireEvent.mouseDown(screen.getAllByLabelText('Quando cobrar')[0]);
    fireEvent.click(screen.getByRole('option', { name: 'Antes de enviar à cozinha' }));
    expect(onSettingChange).toHaveBeenCalledWith('counterTiming', null, 'BEFORE_KITCHEN');
  });

  it('mostra campos vazios e desliga Pix online sem credencial', () => {
    renderSection();
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
    expect(screen.getByLabelText('Public Key')).toHaveValue('');
    expect(screen.getByLabelText('Webhook secret')).toHaveValue('');
    expect(screen.getByText(/não configurado/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Pix online')).toBeDisabled();
    expect(screen.getByLabelText('Cartão de crédito online')).toBeDisabled();
  });

  it('não coloca token da API no input e usa placeholder Configurado', () => {
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoPublicKeyConfigured: true,
      mercadoPagoWebhookSecretConfigured: true,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessToken: '',
      mercadoPagoPublicKey: '',
      mercadoPagoWebhookSecret: '',
    });
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
    expect(screen.getByLabelText('Access Token')).toHaveAttribute('placeholder', 'Configurado');
    expect(screen.getAllByText(/Já configurado\. Preencha só para substituir\./).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByDisplayValue(/APP_USR|TEST-|access_token/i)).not.toBeInTheDocument();
  });

  it('permite ligar Pix online quando o servidor está configurado', () => {
    renderSection({ mercadoPagoConfigured: true, mercadoPagoEnvironment: 'test' });
    expect(screen.getByLabelText('Pix online')).not.toBeDisabled();
    expect(screen.getByText(/Mercado Pago · teste · configurado/i)).toBeInTheDocument();
  });

  it('permite ligar Pix online ao digitar Access Token novo', () => {
    const onSettingChange = jest.fn();
    renderSection({ mercadoPagoAccessToken: 'token-novo-digitado' }, onSettingChange);
    expect(screen.getByLabelText('Pix online')).not.toBeDisabled();
    fireEvent.click(screen.getByLabelText('Pix online'));
    expect(onSettingChange).toHaveBeenCalledWith('onlinePixEnabled', null, true);
  });

  it('mantém cartão desligado sem Public Key mesmo com Access Token', () => {
    renderSection({ mercadoPagoAccessToken: 'token-novo-digitado' });
    expect(screen.getByLabelText('Pix online')).not.toBeDisabled();
    expect(screen.getByLabelText('Cartão de crédito online')).toBeDisabled();
    expect(screen.getByText(/Digite a Public Key acima/i)).toBeInTheDocument();
  });

  it('permite ligar cartão com Access Token e Public Key digitados', () => {
    const onSettingChange = jest.fn();
    renderSection(
      { mercadoPagoAccessToken: 'token-novo', mercadoPagoPublicKey: 'pk-novo' },
      onSettingChange,
    );
    expect(screen.getByLabelText('Cartão de crédito online')).not.toBeDisabled();
    fireEvent.click(screen.getByLabelText('Cartão de crédito online'));
    expect(onSettingChange).toHaveBeenCalledWith('onlineCardEnabled', null, true);
  });

  it('permite ligar cartão quando o servidor já tem Public Key configurada', () => {
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoPublicKeyConfigured: true,
    });
    expect(screen.getByLabelText('Cartão de crédito online')).not.toBeDisabled();
  });
});
