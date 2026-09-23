import { fireEvent, render, screen } from '@testing-library/react';
import { OnlineDeliveryPayments } from './OnlineDeliveryPayments';
import { secretInputMask } from '../../../../services/paymentConfigService';

function renderSection(settings = {}, onSettingChange = jest.fn(), onSave = jest.fn()) {
  return render(
    <OnlineDeliveryPayments
      settings={settings}
      onSettingChange={onSettingChange}
      onSave={onSave}
      switchStyles={{}}
      saving={false}
    />,
  );
}

describe('OnlineDeliveryPayments', () => {
  it('mostra campos vazios e desliga Pix online sem credencial', () => {
    renderSection();
    expect(screen.getByText('Pagamentos online')).toBeInTheDocument();
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
    expect(screen.getByLabelText('Public Key')).toHaveValue('');
    expect(screen.getByLabelText('Webhook secret')).toHaveValue('');
    expect(screen.getByText(/não configurado/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Pix online')).toBeDisabled();
    expect(screen.getByLabelText('Cartão de crédito online')).toBeDisabled();
  });

  it('mostra máscara com length exato quando já configurado e não coloca token da API', () => {
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoPublicKeyConfigured: true,
      mercadoPagoWebhookSecretConfigured: true,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessTokenLength: 32,
      mercadoPagoPublicKeyLength: 20,
      mercadoPagoWebhookSecretLength: 16,
      mercadoPagoAccessToken: '',
      mercadoPagoPublicKey: '',
      mercadoPagoWebhookSecret: '',
    });
    expect(screen.getByLabelText('Access Token')).toHaveValue(secretInputMask(32));
    expect(screen.getByLabelText('Public Key')).toHaveValue(secretInputMask(20));
    expect(screen.getByLabelText('Webhook secret')).toHaveValue(secretInputMask(16));
    expect(screen.getByLabelText('Access Token')).toHaveAttribute('placeholder', 'Configurado');
    expect(screen.getAllByText(/Já configurado\. Preencha só para substituir\./).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByDisplayValue(/APP_USR|TEST-|access_token/i)).not.toBeInTheDocument();
  });

  it('length 0 ou ausente deixa o campo vazio mesmo com flag configurado', () => {
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoPublicKeyConfigured: true,
      mercadoPagoWebhookSecretConfigured: true,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessTokenLength: 0,
      mercadoPagoPublicKeyLength: undefined,
      mercadoPagoWebhookSecretLength: null,
    });
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
    expect(screen.getByLabelText('Public Key')).toHaveValue('');
    expect(screen.getByLabelText('Webhook secret')).toHaveValue('');
  });

  it('em Produção configurada mostra máscara do tamanho informado', () => {
    renderSection({
      mercadoPagoEnvironment: 'prod',
      mercadoPagoStoreAccessTokenConfigured: true,
      mercadoPagoPublicKeyConfigured: true,
      mercadoPagoWebhookSecretConfigured: true,
      mercadoPagoAccessTokenLength: 40,
      mercadoPagoPublicKeyLength: 24,
      mercadoPagoWebhookSecretLength: 10,
      mercadoPagoAccessToken: '',
      mercadoPagoPublicKey: '',
      mercadoPagoWebhookSecret: '',
    });
    expect(screen.getByText(/Mercado Pago · produção · configurado/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Access Token')).toHaveValue(secretInputMask(40));
    expect(screen.getByLabelText('Public Key')).toHaveValue(secretInputMask(24));
    expect(screen.getByLabelText('Webhook secret')).toHaveValue(secretInputMask(10));
  });

  it('campo não configurado fica vazio sem máscara', () => {
    renderSection({
      mercadoPagoEnvironment: 'prod',
      mercadoPagoStoreAccessTokenConfigured: false,
      mercadoPagoPublicKeyConfigured: false,
      mercadoPagoWebhookSecretConfigured: false,
      mercadoPagoAccessTokenLength: 0,
      mercadoPagoPublicKeyLength: 0,
      mercadoPagoWebhookSecretLength: 0,
    });
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
    expect(screen.getByLabelText('Public Key')).toHaveValue('');
    expect(screen.getByLabelText('Webhook secret')).toHaveValue('');
  });

  it('ao focar limpa a máscara para digitar valor novo', () => {
    const onSettingChange = jest.fn();
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessTokenLength: 32,
      mercadoPagoAccessToken: '',
    }, onSettingChange);
    fireEvent.focus(screen.getByLabelText('Access Token'));
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoAccessToken', null, '');
  });

  it('permite substituir a máscara digitando um valor novo', () => {
    const onSettingChange = jest.fn();
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoAccessTokenConfigured: true,
      mercadoPagoEnvironment: 'test',
      mercadoPagoAccessTokenLength: 32,
      mercadoPagoAccessToken: '',
    }, onSettingChange);
    fireEvent.change(screen.getByLabelText('Access Token'), { target: { value: 'token-novo-digitado' } });
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoAccessToken', null, 'token-novo-digitado');
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
    expect(screen.getByText(/ligar o cartão online/i)).toBeInTheDocument();
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

  it('ao selecionar Teste com credencial do servidor marca configurado sem preencher inputs', () => {
    const onSettingChange = jest.fn();
    renderSection({
      mercadoPagoEnvironment: 'prod',
      mercadoPagoConfigured: false,
      mercadoPagoStoreAccessTokenConfigured: false,
      mercadoPagoServerTestCredentialsAvailable: true,
      mercadoPagoServerTestPublicKeyAvailable: true,
    }, onSettingChange);
    const native = screen.getByLabelText('Ambiente').parentElement.querySelector('input');
    fireEvent.change(native, { target: { value: 'test' } });
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoEnvironment', null, 'test');
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoConfigured', null, true);
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoAccessTokenConfigured', null, true);
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoPublicKeyConfigured', null, true);
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
  });

  it('em Teste com flag do servidor habilita Pix e mostra máscara pelo length', () => {
    renderSection({
      mercadoPagoEnvironment: 'test',
      mercadoPagoServerTestCredentialsAvailable: true,
      mercadoPagoAccessTokenLength: 28,
    });
    expect(screen.getByText(/Mercado Pago · teste · configurado/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Pix online')).not.toBeDisabled();
    expect(screen.getByLabelText('Access Token')).toHaveValue(secretInputMask(28));
    expect(screen.getByLabelText('Access Token')).toHaveAttribute('placeholder', 'Configurado');
  });

  it('em Produção sem credencial da loja não usa fallback do servidor', () => {
    renderSection({
      mercadoPagoEnvironment: 'prod',
      mercadoPagoServerTestCredentialsAvailable: true,
      mercadoPagoServerTestPublicKeyAvailable: true,
      mercadoPagoStoreAccessTokenConfigured: false,
    });
    expect(screen.getByText(/Mercado Pago · produção · não configurado/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Pix online')).toBeDisabled();
  });

  it('salva como pagamentos online do delivery', () => {
    const onSave = jest.fn();
    renderSection({}, jest.fn(), onSave);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledWith('onlinePayments');
  });
});
