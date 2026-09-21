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
  CHARGE_TIMING_OPTIONS,
  PAYMENT_METHOD_ORDER,
  PAYMENT_PROVIDER_OPTIONS,
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
  return (
    <SettingsSectionCard
      icon={CreditCardIcon}
      title="Cobrança da loja"
      description="Momento da cobrança, meios aceitos e adquirente padrão."
      actionLabel={saving ? 'Salvando...' : 'Salvar'}
      onAction={() => onSave('paymentMethods')}
      actionDisabled={saving}
    >
      <Box className="setting-item">
        <TextField
          select
          label="Momento da cobrança"
          value={settings.timing}
          onChange={(e) => onSettingChange('timing', null, e.target.value)}
          className="setting-input"
          fullWidth
        >
          {CHARGE_TIMING_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box className="setting-item">
        <FormControlLabel
          control={(
            <Switch
              checked={Boolean(settings.waiterPaymentEnabled)}
              onChange={(e) => onSettingChange('waiterPaymentEnabled', null, e.target.checked)}
              sx={switchStyles}
            />
          )}
          label="Garçom pode cobrar"
        />
      </Box>

      <Box className="setting-item">
        <TextField
          select
          label="Adquirente padrão"
          value={settings.defaultProvider}
          onChange={(e) => onSettingChange('defaultProvider', null, e.target.value)}
          className="setting-input"
          fullWidth
        >
          {PAYMENT_PROVIDER_OPTIONS.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {settings.defaultProvider === 'INFINITEPAY' && (
        <Box className="payment-provider-fields">
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
