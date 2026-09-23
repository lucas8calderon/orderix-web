import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
} from '@mui/material';
import { CreditCardOutlined as CreditCardIcon } from '@mui/icons-material';
import {
  CHANNEL_CHARGE_TIMING_OPTIONS,
  INTEGRATED_PROVIDER,
  PAYMENT_FALLBACK_OPTIONS,
  PAYMENT_METHOD_ORDER,
  PAYMENT_MODE_OPTIONS,
} from '../../../../services/paymentConfigService';
import { SettingsSectionCard } from './SettingsSectionCard';

export function PaymentsSection({
  settings,
  onSettingChange,
  onSave,
  getPaymentMethodLabel,
  switchStyles,
  saving,
}) {
  const showInfinitePayFields = [
    settings.tablePaymentProvider,
    settings.comandaPaymentProvider,
    settings.counterPaymentProvider,
  ].some((value) => String(value || '').toUpperCase() === 'INFINITEPAY');

  return (
    <SettingsSectionCard
      icon={CreditCardIcon}
      title="Pedidos e pagamentos"
      description="Cada canal (balcão, mesa e comanda) tem modo, momento e fallback independentes. A loja define a cobrança. O aparelho só informa se o InfinitePay está disponível. O colaborador não escolhe adquirente."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('paymentMethods')}
      actionDisabled={saving}
    >
      <ChannelPolicy
        title="Balcão"
        mode={settings.counterPaymentMode}
        timing={settings.counterTiming}
        fallbackMode={settings.counterFallbackMode}
        provider={settings.counterPaymentProvider}
        onModeChange={(value) => changeMode(onSettingChange, 'counter', value)}
        onTimingChange={(value) => onSettingChange('counterTiming', null, value)}
        onFallbackChange={(value) => onSettingChange('counterFallbackMode', null, value)}
      />
      <ChannelPolicy
        title="Mesa"
        mode={settings.tablePaymentMode}
        timing={settings.tableTiming}
        fallbackMode={settings.tableFallbackMode}
        provider={settings.tablePaymentProvider}
        onModeChange={(value) => changeMode(onSettingChange, 'table', value)}
        onTimingChange={(value) => onSettingChange('tableTiming', null, value)}
        onFallbackChange={(value) => onSettingChange('tableFallbackMode', null, value)}
      />
      <ChannelPolicy
        title="Comanda"
        mode={settings.comandaPaymentMode}
        timing={settings.comandaTiming}
        fallbackMode={settings.comandaFallbackMode}
        provider={settings.comandaPaymentProvider}
        onModeChange={(value) => changeMode(onSettingChange, 'comanda', value)}
        onTimingChange={(value) => onSettingChange('comandaTiming', null, value)}
        onFallbackChange={(value) => onSettingChange('comandaFallbackMode', null, value)}
      />

      {showInfinitePayFields && (
        <Box className="payment-provider-fields">
          <Typography className="setting-hint" variant="body2">
            Credenciais opcionais do InfinitePay. Só valem se algum canal estiver em pagamento integrado com InfinitePay.
          </Typography>
          <TextField
            label="Handle InfinitePay"
            value={settings.infinitePayHandle}
            onChange={(e) => onSettingChange('infinitePayHandle', null, e.target.value)}
            className="setting-input"
            fullWidth
          />
          <TextField
            label="CNPJ InfinitePay"
            value={settings.infinitePayDocument}
            onChange={(e) => onSettingChange('infinitePayDocument', null, e.target.value)}
            className="setting-input"
            fullWidth
          />
        </Box>
      )}

      <Box className="payment-channel-timing">
        <Typography className="setting-label">Pagamentos online · Delivery</Typography>
        <Typography className="setting-hint" variant="body2">
          Mercado Pago · {settings.mercadoPagoEnvironment === 'prod' ? 'produção' : 'teste'} ·{' '}
          {settings.mercadoPagoConfigured ? 'configurado' : 'não configurado'}.
          Credenciais da loja têm prioridade; o servidor também pode usar variáveis de ambiente.
        </Typography>
        <Box className="payment-provider-fields">
          <TextField
            select
            label="Ambiente"
            value={settings.mercadoPagoEnvironment === 'prod' ? 'prod' : 'test'}
            onChange={(e) => onSettingChange('mercadoPagoEnvironment', null, e.target.value)}
            className="setting-input"
            fullWidth
          >
            <MenuItem value="test">Teste</MenuItem>
            <MenuItem value="prod">Produção</MenuItem>
          </TextField>
          <SecretField
            label="Access Token"
            value={settings.mercadoPagoAccessToken}
            configured={Boolean(settings.mercadoPagoAccessTokenConfigured || settings.mercadoPagoConfigured)}
            onChange={(value) => onSettingChange('mercadoPagoAccessToken', null, value)}
            autoComplete="new-password"
          />
          <SecretField
            label="Public Key"
            value={settings.mercadoPagoPublicKey}
            configured={Boolean(settings.mercadoPagoPublicKeyConfigured)}
            onChange={(value) => onSettingChange('mercadoPagoPublicKey', null, value)}
          />
          <SecretField
            label="Webhook secret"
            value={settings.mercadoPagoWebhookSecret}
            configured={Boolean(settings.mercadoPagoWebhookSecretConfigured)}
            onChange={(value) => onSettingChange('mercadoPagoWebhookSecret', null, value)}
          />
        </Box>
        <FormControlLabel
          control={(
            <Switch
              checked={Boolean(settings.onlinePixEnabled)}
              disabled={!canEnableOnlinePix(settings)}
              onChange={(e) => onSettingChange('onlinePixEnabled', null, e.target.checked)}
              sx={switchStyles}
            />
          )}
          label="Pix online"
        />
        {!canEnableOnlinePix(settings) ? (
          <Typography className="setting-hint" variant="body2">
            Digite o Access Token acima (ou configure MERCADO_PAGO_ACCESS_TOKEN no servidor) e clique em Salvar para ligar o Pix online.
          </Typography>
        ) : null}
        <FormControlLabel
          control={(
            <Switch
              checked={Boolean(settings.onlineCardEnabled)}
              disabled={!canEnableOnlineCard(settings)}
              onChange={(e) => onSettingChange('onlineCardEnabled', null, e.target.checked)}
              sx={switchStyles}
            />
          )}
          label="Cartão de crédito online"
        />
        {!canEnableOnlineCard(settings) ? (
          <Typography className="setting-hint" variant="body2">
            {canEnableOnlinePix(settings)
              ? 'Digite a Public Key acima (ou configure MERCADO_PAGO_PUBLIC_KEY no servidor) para ligar o cartão online.'
              : 'Access Token e Public Key são necessários para ligar o cartão online.'}
          </Typography>
        ) : null}
      </Box>

      <Typography className="setting-label">Meios aceitos</Typography>
      <Box className="payment-methods payment-methods--grid">
        {PAYMENT_METHOD_ORDER.map((method) => (
          <Box key={method} className="payment-method-item payment-method-item--card">
            <FormControlLabel
              control={(
                <Switch
                  checked={Boolean(settings.paymentMethods?.[method])}
                  onChange={(e) => onSettingChange('paymentMethods', method, e.target.checked)}
                  sx={switchStyles}
                />
              )}
              label={getPaymentMethodLabel(method)}
            />
          </Box>
        ))}
      </Box>
    </SettingsSectionCard>
  );
}

function hasMercadoPagoAccessToken(settings) {
  if (settings.mercadoPagoConfigured || settings.mercadoPagoAccessTokenConfigured) return true;
  return Boolean(String(settings.mercadoPagoAccessToken || '').trim());
}

function hasMercadoPagoPublicKey(settings) {
  if (settings.mercadoPagoPublicKeyConfigured) return true;
  return Boolean(String(settings.mercadoPagoPublicKey || '').trim());
}

function canEnableOnlinePix(settings) {
  return hasMercadoPagoAccessToken(settings);
}

/** Cartão exige token + Public Key (Checkout Transparente). */
function canEnableOnlineCard(settings) {
  return hasMercadoPagoAccessToken(settings) && hasMercadoPagoPublicKey(settings);
}

function SecretField({ label, value, configured, onChange, autoComplete = 'new-password' }) {
  return (
    <TextField
      label={label}
      type="password"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="setting-input"
      fullWidth
      autoComplete={autoComplete}
      placeholder={configured ? 'Configurado' : undefined}
      helperText={configured ? 'Já configurado. Preencha só para substituir.' : undefined}
      inputProps={{ 'aria-label': label }}
    />
  );
}

function changeMode(onSettingChange, channel, value) {
  onSettingChange(`${channel}PaymentMode`, null, value);
  if (value === 'INTEGRATED_PAYMENT') {
    onSettingChange(`${channel}PaymentProvider`, null, INTEGRATED_PROVIDER);
    onSettingChange(`${channel}FallbackMode`, null, 'BLOCK');
    return;
  }
  onSettingChange(`${channel}PaymentProvider`, null, 'NONE');
  onSettingChange(`${channel}FallbackMode`, null, 'BLOCK');
}

function ChannelPolicy({
  title,
  mode,
  timing,
  fallbackMode,
  provider,
  onModeChange,
  onTimingChange,
  onFallbackChange,
}) {
  const resolvedMode = mode || 'MANUAL_CONFIRMATION';
  const selected = PAYMENT_MODE_OPTIONS.find((option) => option.id === resolvedMode);
  const hideTiming = resolvedMode === 'ORDER_ONLY';
  const showFallback = resolvedMode === 'INTEGRATED_PAYMENT';
  const fallback = PAYMENT_FALLBACK_OPTIONS.find((option) => option.id === (fallbackMode || 'BLOCK'));
  const providerLabel = String(provider || '').toUpperCase() === 'GETNET'
    ? 'Getnet (legado neste canal — não convertida automaticamente)'
    : 'InfinitePay';

  return (
    <Box className="payment-channel-timing">
      <Typography className="setting-label">{title}</Typography>
      <Box className="setting-item">
        <TextField
          select
          label="Modo de pagamento"
          value={resolvedMode}
          onChange={(e) => onModeChange(e.target.value)}
          className="setting-input"
          fullWidth
          helperText={selected?.hint}
        >
          {PAYMENT_MODE_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {showFallback && (
        <>
          <Typography className="setting-hint" variant="body2">
            Integração: {providerLabel}. O APK Play executa a cobrança se o aparelho tiver o SDK.
          </Typography>
          <Box className="setting-item">
            <TextField
              select
              label="Se o InfinitePay não estiver disponível"
              value={fallbackMode || 'BLOCK'}
              onChange={(e) => onFallbackChange(e.target.value)}
              className="setting-input"
              fullWidth
              helperText={fallback?.hint}
            >
              {PAYMENT_FALLBACK_OPTIONS.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </>
      )}
      {!hideTiming && (
        <Box className="setting-item">
          <TextField
            select
            label="Quando cobrar"
            value={timing || 'AFTER_KITCHEN'}
            onChange={(e) => onTimingChange(e.target.value)}
            className="setting-input"
            fullWidth
            helperText={timing === 'BEFORE_KITCHEN'
              ? 'Resolver a cobrança antes de enviar à cozinha.'
              : 'Vários pedidos vão à cozinha; cobra o total aberto no fechamento.'}
          >
            {CHANNEL_CHARGE_TIMING_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
    </Box>
  );
}
