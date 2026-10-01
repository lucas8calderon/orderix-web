import React, { useState } from 'react';
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
} from '../../../../services/paymentConfigService';
import { SettingsSectionCard } from './SettingsSectionCard';

export function OnlineDeliveryPayments({
  settings,
  onSettingChange,
  onSave,
  switchStyles,
  saving,
}) {
  const environment = settings.mercadoPagoEnvironment === 'prod' ? 'prod' : 'test';
  const accessConfigured = hasMercadoPagoAccessToken(settings, environment);
  const publicKeyConfigured = hasMercadoPagoPublicKey(settings, environment);

  return (
    <SettingsSectionCard
      icon={CreditCardIcon}
      title="Pagamentos online"
      description="Pix e cartão pelo Mercado Pago, só no delivery. Em Teste, o servidor pode usar MERCADO_PAGO_* do ambiente. Em Produção, digite as credenciais da loja."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('onlinePayments')}
      actionDisabled={saving}
    >
      <Typography className="setting-hint" variant="body2">
        Mercado Pago · {environment === 'prod' ? 'produção' : 'teste'} ·{' '}
        {accessConfigured ? 'configurado' : 'não configurado'}.
      </Typography>
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
          onChange={(value) => onSettingChange('mercadoPagoAccessToken', null, value)}
        />
        <SecretField
          label="Public Key"
          value={settings.mercadoPagoPublicKey}
          configuredLength={settings.mercadoPagoPublicKeyLength}
          configured={publicKeyConfigured && isUnsetSecret(settings.mercadoPagoPublicKey)}
          onChange={(value) => onSettingChange('mercadoPagoPublicKey', null, value)}
        />
        <SecretField
          label="Webhook secret"
          value={settings.mercadoPagoWebhookSecret}
          configuredLength={settings.mercadoPagoWebhookSecretLength}
          configured={hasMercadoPagoWebhookSecret(settings, environment)
            && isUnsetSecret(settings.mercadoPagoWebhookSecret)}
          onChange={(value) => onSettingChange('mercadoPagoWebhookSecret', null, value)}
        />
      </Box>
      <FormControlLabel
        control={(
          <Switch
            checked={Boolean(settings.onlinePixEnabled)}
            disabled={!accessConfigured}
            onChange={(e) => onSettingChange('onlinePixEnabled', null, e.target.checked)}
            sx={switchStyles}
          />
        )}
        label="Pix online"
      />
      {!accessConfigured ? (
        <Typography className="setting-hint" variant="body2">
          {environment === 'prod'
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
          {!accessConfigured
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
function SecretField({ label, value, configured, configuredLength, onChange }) {
  const [editing, setEditing] = useState(false);
  const [markedClear, setMarkedClear] = useState(false);
  const length = Number(configuredLength) || 0;
  const mask = secretInputMask(length);
  const cleared = markedClear || isClearStoredSecret(value);
  const showingMask = !editing && !cleared && Boolean(configured) && length > 0 && isUnsetSecret(value);
  const displayValue = showingMask ? mask : (cleared ? '' : (value || ''));
  const showHelper = showingMask;

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
      onFocus={openForEdit}
      onChange={handleChange}
      className="setting-input"
      fullWidth
      autoComplete="new-password"
      placeholder={showingMask ? 'Configurado' : undefined}
      helperText={
        cleared
          ? 'Será removido ao salvar. Digite outro valor para substituir.'
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
