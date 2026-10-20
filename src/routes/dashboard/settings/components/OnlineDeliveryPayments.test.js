import { fireEvent, render, screen } from '@testing-library/react';
import { OnlineDeliveryPayments } from './OnlineDeliveryPayments';
import { CLEAR_STORED_SECRET, secretInputMask } from '../../../../services/paymentConfigService';

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
  it('mostra o tutorial de cadastro do PagBank', () => {
    renderSection();
    expect(screen.getByRole('tab', { name: 'Na Weper' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Entre na loja')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(screen.getByText('Abra Configurações')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'No PagBank' }));
    expect(screen.getByText('Use a conta que recebe')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }));
    expect(screen.getByText('Gere o token de produção')).toBeInTheDocument();
  });

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
    expect(screen.getAllByText(/Já configurado\. Clique no campo para substituir\./).length).toBeGreaterThanOrEqual(1);
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
    expect(screen.getAllByText(/Salvo no servidor\. O valor não volta para esta tela\./).length).toBe(3);
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
    expect(screen.getByLabelText('Access Token')).toHaveValue('');
  });

  it('Limpar remove a máscara e marca o segredo para apagar', () => {
    const onSettingChange = jest.fn();
    renderSection({
      mercadoPagoConfigured: true,
      mercadoPagoWebhookSecretConfigured: true,
      mercadoPagoEnvironment: 'test',
      mercadoPagoWebhookSecretLength: 16,
      mercadoPagoWebhookSecret: '',
    }, onSettingChange);
    fireEvent.click(screen.getByRole('button', { name: 'Limpar Webhook secret' }));
    expect(onSettingChange).toHaveBeenCalledWith('mercadoPagoWebhookSecret', null, CLEAR_STORED_SECRET);
    expect(screen.getByLabelText('Webhook secret')).toHaveValue('');
    expect(screen.getByText(/Será removido ao salvar/)).toBeInTheDocument();
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

  it('depois de salvar restaura a máscara de configurado', () => {
    const props = {
      onSettingChange: jest.fn(),
      onSave: jest.fn(),
      switchStyles: {},
    };
    const { rerender } = render(
      <OnlineDeliveryPayments
        {...props}
        saving
        settings={{
          mercadoPagoEnvironment: 'test',
          mercadoPagoAccessToken: 'token-novo-digitado',
          mercadoPagoPublicKey: 'pk-nova',
          mercadoPagoWebhookSecret: 'whsec-novo',
        }}
      />,
    );
    fireEvent.focus(screen.getByLabelText('Access Token'));
    expect(screen.getByLabelText('Access Token')).toHaveValue('token-novo-digitado');

    rerender(
      <OnlineDeliveryPayments
        {...props}
        saving={false}
        settings={{
          mercadoPagoEnvironment: 'test',
          mercadoPagoConfigured: true,
          mercadoPagoAccessTokenConfigured: true,
          mercadoPagoStoreAccessTokenConfigured: true,
          mercadoPagoPublicKeyConfigured: true,
          mercadoPagoWebhookSecretConfigured: true,
          mercadoPagoAccessTokenLength: 19,
          mercadoPagoPublicKeyLength: 7,
          mercadoPagoWebhookSecretLength: 10,
          mercadoPagoAccessToken: '',
          mercadoPagoPublicKey: '',
          mercadoPagoWebhookSecret: '',
        }}
      />,
    );

    expect(screen.getByLabelText('Access Token')).toHaveValue(secretInputMask(19));
    expect(screen.getByLabelText('Public Key')).toHaveValue(secretInputMask(7));
    expect(screen.getByLabelText('Webhook secret')).toHaveValue(secretInputMask(10));
    expect(screen.getAllByText(/Já configurado\. Clique no campo para substituir\./).length).toBe(3);
    expect(screen.queryByDisplayValue('token-novo-digitado')).not.toBeInTheDocument();
  });

  it('salva como pagamentos online do delivery', () => {
    const onSave = jest.fn();
    renderSection({}, jest.fn(), onSave);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledWith('onlinePayments');
  });

  it('PagBank com Pix herdado desliga o Pix e pede para salvar o token antes', () => {
    const onSettingChange = jest.fn();
    renderSection({
      deliveryOnlineProvider: 'PAGBANK',
      pagbankAccessTokenConfigured: false,
      pagbankCardPublicKeyConfigured: false,
      onlinePixEnabled: true,
      onlineCardEnabled: true,
    }, onSettingChange);
    expect(onSettingChange).toHaveBeenCalledWith('onlinePixEnabled', null, false);
    expect(onSettingChange).toHaveBeenCalledWith('onlineCardEnabled', null, false);
    expect(screen.getByText('Salve o token primeiro e só depois ligue o Pix.')).toBeInTheDocument();
  });

  it('ao selecionar PagBank sem token gravado desliga Pix e cartão herdados', () => {
    const onSettingChange = jest.fn();
    renderSection({
      deliveryOnlineProvider: 'MERCADOPAGO',
      mercadoPagoConfigured: true,
      pagbankAccessTokenConfigured: false,
      onlinePixEnabled: true,
      onlineCardEnabled: true,
    }, onSettingChange);
    const native = screen.getByLabelText('Provedor online').parentElement.querySelector('input');
    fireEvent.change(native, { target: { value: 'PAGBANK' } });
    expect(onSettingChange).toHaveBeenCalledWith('deliveryOnlineProvider', null, 'PAGBANK');
    expect(onSettingChange).toHaveBeenCalledWith('onlinePixEnabled', null, false);
    expect(onSettingChange).toHaveBeenCalledWith('onlineCardEnabled', null, false);
  });

  it('Pix ligado sem credencial PagBank pode ser desligado', () => {
    const onSettingChange = jest.fn();
    renderSection({
      deliveryOnlineProvider: 'PAGBANK',
      pagbankAccessTokenConfigured: false,
      onlinePixEnabled: true,
    }, onSettingChange);
    const pix = screen.getByLabelText('Pix online');
    expect(pix).not.toBeDisabled();
    fireEvent.click(pix);
    expect(onSettingChange).toHaveBeenCalledWith('onlinePixEnabled', null, false);
  });

  it('salvar envia o token lido do input do PagBank', () => {
    const onSave = jest.fn();
    renderSection({
      deliveryOnlineProvider: 'PAGBANK',
      pagbankAccessTokenConfigured: false,
      onlinePixEnabled: false,
      pagbankAccessToken: '',
    }, jest.fn(), onSave);
    const input = screen.getByLabelText('Token da conta');
    const valueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    valueSetter.call(input, 'token-sandbox-loja-teste');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(onSave).toHaveBeenCalledWith('onlinePayments', {
      paymentOverrides: { pagbankAccessToken: 'token-sandbox-loja-teste' },
    });
  });

  it('mostra o token do PagBank sem o segredo de webhook do Mercado Pago', () => {
    renderSection({ deliveryOnlineProvider: 'PAGBANK' });
    expect(screen.getByLabelText('Token da conta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Testar conexão' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Webhook secret')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Access Token')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Pix online')).toBeDisabled();
    expect(screen.getByLabelText('Cartão de crédito online')).toBeDisabled();
  });

  it('mostra campos Asaas da loja sem misturar Mercado Pago', () => {
    renderSection({ deliveryOnlineProvider: 'ASAAS' });
    expect(screen.getByLabelText('API key da loja')).toBeInTheDocument();
    expect(screen.getByLabelText('Chave pública (cartão)')).toBeInTheDocument();
    expect(screen.getByLabelText('Token do webhook de delivery')).toBeInTheDocument();
    expect(screen.queryByLabelText('Access Token')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Token da conta')).not.toBeInTheDocument();
    expect(screen.getByText(/nunca a chave da assinatura Weper/i)).toBeInTheDocument();
  });

  it('ao selecionar Asaas sem API key desliga Pix e cartão herdados', () => {
    const onSettingChange = jest.fn();
    renderSection({
      deliveryOnlineProvider: 'MERCADOPAGO',
      mercadoPagoConfigured: true,
      asaasApiKeyConfigured: false,
      onlinePixEnabled: true,
      onlineCardEnabled: true,
    }, onSettingChange);
    const native = screen.getByLabelText('Provedor online').parentElement.querySelector('input');
    fireEvent.change(native, { target: { value: 'ASAAS' } });
    expect(onSettingChange).toHaveBeenCalledWith('deliveryOnlineProvider', null, 'ASAAS');
    expect(onSettingChange).toHaveBeenCalledWith('onlinePixEnabled', null, false);
    expect(onSettingChange).toHaveBeenCalledWith('onlineCardEnabled', null, false);
  });
});
