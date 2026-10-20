import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  InputAdornment,
  Button,
} from '@mui/material';
import { CreditCardOutlined as CreditCardIcon } from '@mui/icons-material';
import {
  CLEAR_STORED_SECRET,
  isClearStoredSecret,
  isSecretInputMask,
  secretInputMask,
  testAsaasConnection,
  testPagBankConnection,
} from '../../../../services/paymentConfigService';
import {
  canChoosePaymentTestEnvironment,
  defaultAsaasEnvironment,
  defaultMercadoPagoEnvironment,
  defaultPagBankEnvironment,
} from '../../../../services/paymentTestEnvironment';
import { SettingsSectionCard } from './SettingsSectionCard';
import { PagBankSetupTutorials } from './PagBankSetupTutorials';

function resolveProvider(value) {
  if (value === 'PAGBANK' || value === 'ASAAS') return value;
  return 'MERCADOPAGO';
}

export function OnlineDeliveryPayments({
  settings,
  onSettingChange,
  onSave,
  switchStyles,
  saving,
}) {
  const provider = resolveProvider(settings.deliveryOnlineProvider);
  const pagbank = provider === 'PAGBANK';
  const asaas = provider === 'ASAAS';
  const mercadoPago = provider === 'MERCADOPAGO';
  const showTestEnvironment = canChoosePaymentTestEnvironment();
  const environment = settings.mercadoPagoEnvironment === 'test' ? 'test' : 'prod';
  const pagbankEnvironment = settings.pagbankEnvironment === 'sandbox' ? 'sandbox' : 'prod';
  const asaasEnvironment = settings.asaasEnvironment === 'sandbox' ? 'sandbox' : 'prod';
  const accessConfigured = pagbank
    ? hasTypedSecret(settings.pagbankAccessToken) || Boolean(settings.pagbankAccessTokenConfigured)
    : asaas
      ? hasTypedSecret(settings.asaasApiKey) || Boolean(settings.asaasApiKeyConfigured)
      : hasMercadoPagoAccessToken(settings, environment);
  const publicKeyConfigured = pagbank
    ? Boolean(settings.pagbankCardPublicKeyConfigured)
    : asaas
      ? accessConfigured
      : hasMercadoPagoPublicKey(settings, environment);
  const cardReady = asaas ? accessConfigured : (accessConfigured && publicKeyConfigured);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [pixPausedForMissingToken, setPixPausedForMissingToken] = useState(false);
  const pagbankTokenInputRef = useRef(null);
  const asaasKeyInputRef = useRef(null);
  const tokenStored = Boolean(settings.pagbankAccessTokenConfigured);
  const asaasKeyStored = Boolean(settings.asaasApiKeyConfigured);
  const publicKeyStored = Boolean(settings.pagbankCardPublicKeyConfigured);

  useEffect(() => {
    if (!pagbank && !asaas) {
      setPixPausedForMissingToken(false);
      return;
    }
    if (pagbank) {
      if (tokenStored) {
        setPixPausedForMissingToken(false);
      } else if (settings.onlinePixEnabled) {
        onSettingChange('onlinePixEnabled', null, false);
        setPixPausedForMissingToken(true);
      }
      if (!publicKeyStored && settings.onlineCardEnabled) {
        onSettingChange('onlineCardEnabled', null, false);
      }
      return;
    }
    if (asaasKeyStored) {
      setPixPausedForMissingToken(false);
    } else if (settings.onlinePixEnabled) {
      onSettingChange('onlinePixEnabled', null, false);
      setPixPausedForMissingToken(true);
    }
    if (!asaasKeyStored && settings.onlineCardEnabled) {
      onSettingChange('onlineCardEnabled', null, false);
    }
  }, [
    pagbank,
    asaas,
    tokenStored,
    asaasKeyStored,
    publicKeyStored,
    settings.onlinePixEnabled,
    settings.onlineCardEnabled,
    onSettingChange,
  ]);

  const selectProvider = (nextProvider) => {
    onSettingChange('deliveryOnlineProvider', null, nextProvider);
    if (!showTestEnvironment) {
      if (nextProvider === 'PAGBANK') {
        onSettingChange('pagbankEnvironment', null, defaultPagBankEnvironment());
      } else if (nextProvider === 'ASAAS') {
        onSettingChange('asaasEnvironment', null, defaultAsaasEnvironment());
      } else {
        onSettingChange('mercadoPagoEnvironment', null, defaultMercadoPagoEnvironment());
      }
    }
    if (nextProvider === 'PAGBANK' && !tokenStored) {
      if (settings.onlinePixEnabled) {
        onSettingChange('onlinePixEnabled', null, false);
        setPixPausedForMissingToken(true);
      }
      if (settings.onlineCardEnabled) {
        onSettingChange('onlineCardEnabled', null, false);
      }
    }
    if (nextProvider === 'ASAAS' && !asaasKeyStored) {
      if (settings.onlinePixEnabled) {
        onSettingChange('onlinePixEnabled', null, false);
        setPixPausedForMissingToken(true);
      }
      if (settings.onlineCardEnabled) {
        onSettingChange('onlineCardEnabled', null, false);
      }
    }
  };

  const saveOnlinePayments = () => {
    if (pagbank) {
      const typed = pagbankTokenInputRef.current?.value;
      if (hasTypedSecret(typed)) {
        onSave('onlinePayments', {
          paymentOverrides: { pagbankAccessToken: String(typed).trim() },
        });
        return;
      }
    }
    if (asaas) {
      const typed = asaasKeyInputRef.current?.value;
      if (hasTypedSecret(typed)) {
        onSave('onlinePayments', {
          paymentOverrides: { asaasApiKey: String(typed).trim() },
        });
        return;
      }
    }
    onSave('onlinePayments');
  };

  const testConnection = async () => {
    setTesting(true);
    setTestMessage('');
    try {
      const response = asaas ? await testAsaasConnection() : await testPagBankConnection();
      if (response?.data?.ok) {
        if (!asaas) {
          onSettingChange('pagbankCardPublicKeyConfigured', null, true);
        }
        setTestMessage(asaas
          ? 'Conexão ok. A API key da loja está válida para Pix e cartão.'
          : 'Conexão ok. A chave de cartão ficou guardada nesta loja.');
      } else {
        setTestMessage(asaas
          ? 'Não foi possível validar a API key salva.'
          : 'Não foi possível consultar a chave com o token salvo.');
      }
    } catch {
      setTestMessage(asaas
        ? 'Não foi possível validar a API key salva.'
        : 'Não foi possível consultar a chave com o token salvo.');
    } finally {
      setTesting(false);
    }
  };

  const providerLabel = asaas ? 'Asaas' : pagbank ? 'PagBank' : 'Mercado Pago';
  const envLabel = asaas
    ? (asaasEnvironment === 'prod' ? 'produção' : 'sandbox')
    : pagbank
      ? (pagbankEnvironment === 'prod' ? 'produção' : 'sandbox')
      : (environment === 'prod' ? 'produção' : 'teste');

  return (
    <SettingsSectionCard
      icon={CreditCardIcon}
      title="Pagamentos online"
      description="Pix e cartão no delivery. O dinheiro cai na conta do provedor escolhido para esta loja. Mercado Pago, PagBank e Asaas ficam separados da assinatura Weper."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={saveOnlinePayments}
      actionDisabled={saving}
    >
      <PagBankSetupTutorials />
      <TextField
        select
        label="Provedor online"
        value={provider}
        onChange={(e) => selectProvider(e.target.value)}
        className="setting-input"
        fullWidth
      >
        <MenuItem value="MERCADOPAGO">Mercado Pago</MenuItem>
        <MenuItem value="PAGBANK">PagBank</MenuItem>
        <MenuItem value="ASAAS">Asaas</MenuItem>
      </TextField>
      <Typography className="setting-hint" variant="body2">
        {providerLabel}
        {' · '}
        {envLabel}
        {' · '}
        {accessConfigured ? 'configurado' : 'não configurado'}.
      </Typography>
      {pagbank ? (
        <Box className="payment-provider-fields">
          {showTestEnvironment ? (
            <TextField
              select
              label="Ambiente"
              value={pagbankEnvironment}
              onChange={(e) => onSettingChange('pagbankEnvironment', null, e.target.value === 'prod' ? 'prod' : 'sandbox')}
              className="setting-input"
              fullWidth
            >
              <MenuItem value="sandbox">Sandbox</MenuItem>
              <MenuItem value="prod">Produção</MenuItem>
            </TextField>
          ) : null}
          <SecretField
            label="Token da conta"
            value={settings.pagbankAccessToken}
            configuredLength={settings.pagbankAccessTokenLength}
            configured={Boolean(settings.pagbankAccessTokenConfigured) && isUnsetSecret(settings.pagbankAccessToken)}
            saving={saving}
            inputRef={pagbankTokenInputRef}
            onChange={(value) => onSettingChange('pagbankAccessToken', null, value)}
          />
          <Button type="button" variant="outlined" onClick={testConnection} disabled={testing || saving}>
            {testing ? 'Testando...' : 'Testar conexão'}
          </Button>
          <Typography className="setting-hint" variant="body2">
            Salve o token antes de testar. O teste só consulta a chave pública de cartão e não mostra o token.
          </Typography>
          {testMessage ? <Typography className="setting-hint" variant="body2">{testMessage}</Typography> : null}
        </Box>
      ) : null}
      {asaas ? (
        <Box className="payment-provider-fields">
          {showTestEnvironment ? (
            <TextField
              select
              label="Ambiente"
              value={asaasEnvironment}
              onChange={(e) => onSettingChange('asaasEnvironment', null, e.target.value === 'prod' ? 'prod' : 'sandbox')}
              className="setting-input"
              fullWidth
            >
              <MenuItem value="sandbox">Sandbox</MenuItem>
              <MenuItem value="prod">Produção</MenuItem>
            </TextField>
          ) : null}
          <SecretField
            label="API key da loja"
            value={settings.asaasApiKey}
            configuredLength={settings.asaasApiKeyLength}
            configured={Boolean(settings.asaasApiKeyConfigured) && isUnsetSecret(settings.asaasApiKey)}
            saving={saving}
            inputRef={asaasKeyInputRef}
            onChange={(value) => onSettingChange('asaasApiKey', null, value)}
          />
          <Button type="button" variant="outlined" onClick={testConnection} disabled={testing || saving}>
            {testing ? 'Testando...' : 'Testar conexão'}
          </Button>
          <Typography className="setting-hint" variant="body2">
            Salve a API key antes de testar. O Asaas não tem chave pública de cartão: a tokenização roda no servidor Weper com a API key da loja.
          </Typography>
          {testMessage ? <Typography className="setting-hint" variant="body2">{testMessage}</Typography> : null}
          <SecretField
            label="Token do webhook de delivery"
            value={settings.asaasWebhookToken}
            configuredLength={settings.asaasWebhookTokenLength}
            configured={Boolean(settings.asaasWebhookTokenConfigured) && isUnsetSecret(settings.asaasWebhookToken)}
            saving={saving}
            onChange={(value) => onSettingChange('asaasWebhookToken', null, value)}
          />
          <Typography className="setting-hint" variant="body2">
            Use a API key da conta Asaas desta loja — nunca a chave da assinatura Weper. No Asaas, aponte o webhook de
            cobrança para /api/webhooks/asaas/delivery com o token acima (header asaas-access-token).
          </Typography>
        </Box>
      ) : null}
      {mercadoPago ? (
        <Box className="payment-provider-fields">
          {showTestEnvironment ? (
            <TextField
              select
              label="Ambiente"
              value={environment}
              onChange={(e) => onEnvironmentChange(e.target.value, settings, onSettingChange)}
              className="setting-input"
              fullWidth
            >
              <MenuItem value="test">Teste</MenuItem>
              <MenuItem value="prod">Produção</MenuItem>
            </TextField>
          ) : null}
          <SecretField
            label="Access Token"
            value={settings.mercadoPagoAccessToken}
            configuredLength={settings.mercadoPagoAccessTokenLength}
            configured={accessConfigured && isUnsetSecret(settings.mercadoPagoAccessToken)}
            saving={saving}
            onChange={(value) => onSettingChange('mercadoPagoAccessToken', null, value)}
          />
          <SecretField
            label="Public Key"
            value={settings.mercadoPagoPublicKey}
            configuredLength={settings.mercadoPagoPublicKeyLength}
            configured={publicKeyConfigured && isUnsetSecret(settings.mercadoPagoPublicKey)}
            saving={saving}
            onChange={(value) => onSettingChange('mercadoPagoPublicKey', null, value)}
          />
          <SecretField
            label="Webhook secret"
            value={settings.mercadoPagoWebhookSecret}
            configuredLength={settings.mercadoPagoWebhookSecretLength}
            configured={hasMercadoPagoWebhookSecret(settings, environment)
              && isUnsetSecret(settings.mercadoPagoWebhookSecret)}
            saving={saving}
            onChange={(value) => onSettingChange('mercadoPagoWebhookSecret', null, value)}
          />
        </Box>
      ) : null}
      <FormControlLabel
        control={(
          <Switch
            checked={Boolean(settings.onlinePixEnabled)}
            disabled={!accessConfigured && !settings.onlinePixEnabled}
            onChange={(e) => onSettingChange('onlinePixEnabled', null, e.target.checked)}
            sx={switchStyles}
          />
        )}
        label="Pix online"
      />
      {(pagbank || asaas) && pixPausedForMissingToken ? (
        <Typography className="setting-hint" variant="body2">
          {asaas
            ? 'Salve a API key da loja primeiro e só depois ligue o Pix.'
            : 'Salve o token primeiro e só depois ligue o Pix.'}
        </Typography>
      ) : !accessConfigured ? (
        <Typography className="setting-hint" variant="body2">
          {asaas
            ? 'Digite a API key Asaas da loja e clique em Salvar para ligar o Pix online.'
            : pagbank
              ? 'Digite o token da conta PagBank e clique em Salvar para ligar o Pix online.'
              : environment === 'prod'
                ? 'Digite o Access Token da loja e clique em Salvar para ligar o Pix online.'
                : 'Selecione Teste (com MERCADO_PAGO_ACCESS_TOKEN no servidor) ou digite o Access Token e clique em Salvar.'}
        </Typography>
      ) : null}
      <FormControlLabel
        control={(
          <Switch
            checked={Boolean(settings.onlineCardEnabled)}
            disabled={!cardReady}
            onChange={(e) => onSettingChange('onlineCardEnabled', null, e.target.checked)}
            sx={switchStyles}
          />
        )}
        label="Cartão de crédito online"
      />
      {!cardReady ? (
        <Typography className="setting-hint" variant="body2">
          {asaas
            ? 'Salve a API key Asaas da loja antes de ligar o cartão online.'
            : pagbank
              ? 'Salve o token e teste a conexão para guardar a chave pública antes de ligar o cartão.'
              : !accessConfigured
                ? 'Access Token e Public Key são necessários para ligar o cartão online.'
                : environment === 'prod'
                  ? 'Digite a Public Key da loja para ligar o cartão online.'
                  : 'Configure MERCADO_PAGO_PUBLIC_KEY no servidor ou digite a Public Key para ligar o cartão online.'}
        </Typography>
      ) : null}
    </SettingsSectionCard>
  );
}

/** Ao escolher Teste, a UI passa a usar as credenciais do servidor (sem colar segredo nos inputs). */
function onEnvironmentChange(nextEnvironment, settings, onSettingChange) {
  const env = nextEnvironment === 'prod' ? 'prod' : 'test';
  onSettingChange('mercadoPagoEnvironment', null, env);
  if (env === 'test' && settings.mercadoPagoServerTestCredentialsAvailable) {
    onSettingChange('mercadoPagoConfigured', null, true);
    onSettingChange('mercadoPagoAccessTokenConfigured', null, true);
    if (settings.mercadoPagoServerTestPublicKeyAvailable) {
      onSettingChange('mercadoPagoPublicKeyConfigured', null, true);
    }
  }
  if (env === 'prod' && !settings.mercadoPagoStoreAccessTokenConfigured) {
    onSettingChange('mercadoPagoConfigured', null, false);
    onSettingChange('mercadoPagoAccessTokenConfigured', null, false);
    onSettingChange('onlinePixEnabled', null, false);
    onSettingChange('onlineCardEnabled', null, false);
  }
}

function isUnsetSecret(value) {
  if (isClearStoredSecret(value)) return true;
  const trimmed = String(value || '').trim();
  return !trimmed || isSecretInputMask(trimmed);
}

function hasTypedSecret(value) {
  if (isClearStoredSecret(value)) return false;
  const trimmed = String(value || '').trim();
  return Boolean(trimmed) && !isSecretInputMask(trimmed);
}

function hasMercadoPagoAccessToken(settings, environment = settings.mercadoPagoEnvironment) {
  if (hasTypedSecret(settings.mercadoPagoAccessToken)) return true;
  if (environment === 'prod') {
    return Boolean(settings.mercadoPagoStoreAccessTokenConfigured);
  }
  return Boolean(
    settings.mercadoPagoConfigured
    || settings.mercadoPagoAccessTokenConfigured
    || settings.mercadoPagoServerTestCredentialsAvailable
  );
}

function hasMercadoPagoPublicKey(settings, environment = settings.mercadoPagoEnvironment) {
  if (hasTypedSecret(settings.mercadoPagoPublicKey)) return true;
  if (environment === 'prod') {
    return Boolean(settings.mercadoPagoPublicKeyConfigured);
  }
  return Boolean(
    settings.mercadoPagoPublicKeyConfigured
    || settings.mercadoPagoServerTestPublicKeyAvailable
  );
}

function hasMercadoPagoWebhookSecret(settings, environment = settings.mercadoPagoEnvironment) {
  if (hasTypedSecret(settings.mercadoPagoWebhookSecret)) return true;
  if (environment === 'prod') {
    return Boolean(settings.mercadoPagoWebhookSecretConfigured);
  }
  return Boolean(settings.mercadoPagoWebhookSecretConfigured);
}

/**
 * A máscara é só visual. O valor controlado fica vazio enquanto ela aparece,
 * então backspace não a remove. Ao focar, o campo abre vazio para digitar outro segredo.
 * Limpar marca a remoção do valor gravado.
 */
function SecretField({ label, value, configured, configuredLength, saving, onChange, inputRef }) {
  const [editing, setEditing] = useState(false);
  const [markedClear, setMarkedClear] = useState(false);
  const wasSaving = useRef(false);
  const length = Number(configuredLength) || 0;
  const mask = secretInputMask(length);
  const cleared = markedClear || isClearStoredSecret(value);
  const savedWithoutLength = !editing && !cleared && Boolean(configured) && length <= 0 && isUnsetSecret(value);
  const showingMask = !editing && !cleared && Boolean(configured) && length > 0 && isUnsetSecret(value);
  const displayValue = showingMask ? mask : (cleared ? '' : (value || ''));
  const showHelper = showingMask || savedWithoutLength;

  useEffect(() => {
    if (wasSaving.current && !saving) {
      setEditing(false);
      setMarkedClear(false);
    }
    wasSaving.current = Boolean(saving);
  }, [saving]);

  const openForEdit = () => {
    setEditing(true);
    if (showingMask) {
      onChange('');
    }
  };

  const handleChange = (event) => {
    setEditing(true);
    setMarkedClear(false);
    const next = event.target.value;
    if (isSecretInputMask(next) || isClearStoredSecret(next)) {
      onChange('');
      return;
    }
    onChange(next);
  };

  const handleClear = () => {
    setEditing(true);
    setMarkedClear(true);
    onChange(CLEAR_STORED_SECRET);
  };

  return (
    <TextField
      label={label}
      type="text"
      value={displayValue}
      inputRef={inputRef}
      onFocus={openForEdit}
      onChange={handleChange}
      className="setting-input"
      fullWidth
      autoComplete="new-password"
      placeholder={showingMask || savedWithoutLength ? 'Configurado' : undefined}
      helperText={
        cleared
          ? 'Será removido ao salvar. Digite outro valor para substituir.'
          : savedWithoutLength
            ? 'Salvo no servidor. O valor não volta para esta tela.'
            : showHelper
              ? 'Já configurado. Clique no campo para substituir.'
              : undefined
      }
      inputProps={{ 'aria-label': label, spellCheck: false }}
      InputProps={showingMask || cleared ? {
        endAdornment: (
          <InputAdornment position="end">
            <Button
              type="button"
              size="small"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClear}
              aria-label={`Limpar ${label}`}
            >
              Limpar
            </Button>
          </InputAdornment>
        ),
      } : undefined}
    />
  );
}
