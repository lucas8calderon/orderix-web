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
