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
  testPagBankConnection,
} from '../../../../services/paymentConfigService';
import { SettingsSectionCard } from './SettingsSectionCard';

export function OnlineDeliveryPayments({
  settings,
  onSettingChange,
  onSave,
  switchStyles,
  saving,
}) {
  const provider = settings.deliveryOnlineProvider === 'PAGBANK' ? 'PAGBANK' : 'MERCADOPAGO';
  const pagbank = provider === 'PAGBANK';
  const environment = settings.mercadoPagoEnvironment === 'prod' ? 'prod' : 'test';
  const pagbankEnvironment = settings.pagbankEnvironment === 'prod' ? 'prod' : 'sandbox';
  const accessConfigured = pagbank
    ? hasTypedSecret(settings.pagbankAccessToken) || Boolean(settings.pagbankAccessTokenConfigured)
    : hasMercadoPagoAccessToken(settings, environment);
  const publicKeyConfigured = pagbank
    ? Boolean(settings.pagbankCardPublicKeyConfigured)
    : hasMercadoPagoPublicKey(settings, environment);
  const [testing, setTesting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [pixPausedForMissingToken, setPixPausedForMissingToken] = useState(false);
  const pagbankTokenInputRef = useRef(null);
  const tokenStored = Boolean(settings.pagbankAccessTokenConfigured);
  const publicKeyStored = Boolean(settings.pagbankCardPublicKeyConfigured);

  useEffect(() => {
    if (!pagbank) {
      setPixPausedForMissingToken(false);
      return;
    }
    if (tokenStored) {
      setPixPausedForMissingToken(false);
    } else if (settings.onlinePixEnabled) {
      onSettingChange('onlinePixEnabled', null, false);
      setPixPausedForMissingToken(true);
    }
    if (!publicKeyStored && settings.onlineCardEnabled) {
      onSettingChange('onlineCardEnabled', null, false);
    }
  }, [
    pagbank,
    tokenStored,
    publicKeyStored,
    settings.onlinePixEnabled,
    settings.onlineCardEnabled,
    onSettingChange,
  ]);

  const selectProvider = (nextProvider) => {
    onSettingChange('deliveryOnlineProvider', null, nextProvider);
    if (nextProvider === 'PAGBANK' && !tokenStored) {
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
    const typed = pagbankTokenInputRef.current?.value;
    if (pagbank && hasTypedSecret(typed)) {
      onSave('onlinePayments', {
        paymentOverrides: { pagbankAccessToken: String(typed).trim() },
      });
      return;
    }
    onSave('onlinePayments');
  };

  const testConnection = async () => {
    setTesting(true);
    setTestMessage('');
    try {
      const response = await testPagBankConnection();
      if (response?.data?.ok) {
        onSettingChange('pagbankCardPublicKeyConfigured', null, true);
        setTestMessage('Conexão ok. A chave de cartão ficou guardada nesta loja.');
      } else {
        setTestMessage('Não foi possível consultar a chave com o token salvo.');
      }
    } catch {
      setTestMessage('Não foi possível consultar a chave com o token salvo.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <SettingsSectionCard
      icon={CreditCardIcon}
      title="Pagamentos online"
      description="Pix e cartão no delivery. O dinheiro cai na conta do provedor escolhido para esta loja. Mercado Pago e PagBank ficam separados."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={saveOnlinePayments}
      actionDisabled={saving}
    >
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
      </TextField>
      <Typography className="setting-hint" variant="body2">
        {pagbank ? 'PagBank' : 'Mercado Pago'}
        {' · '}
        {pagbank ? (pagbankEnvironment === 'prod' ? 'produção' : 'sandbox') : (environment === 'prod' ? 'produção' : 'teste')}
        {' · '}
        {accessConfigured ? 'configurado' : 'não configurado'}.
      </Typography>
      {pagbank ? (
        <Box className="payment-provider-fields">
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
      ) : (
        <Box className="payment-provider-fields">
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
      )}
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
      {pagbank && pixPausedForMissingToken ? (
        <Typography className="setting-hint" variant="body2">
          Salve o token primeiro e só depois ligue o Pix.
        </Typography>
      ) : !accessConfigured ? (
        <Typography className="setting-hint" variant="body2">
          {pagbank
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
            disabled={!accessConfigured || !publicKeyConfigured}
            onChange={(e) => onSettingChange('onlineCardEnabled', null, e.target.checked)}
            sx={switchStyles}
          />
        )}
        label="Cartão de crédito online"
      />
      {!accessConfigured || !publicKeyConfigured ? (
        <Typography className="setting-hint" variant="body2">
          {pagbank
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
