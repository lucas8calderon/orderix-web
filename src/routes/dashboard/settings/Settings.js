import React, { lazy, Suspense } from 'react';
import {
  Alert,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Slider,
  Tooltip,
  Chip,
  Divider,
  CircularProgress,
  MenuItem,
  Portal,
  Snackbar,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import {
  CHARGE_TIMING_OPTIONS,
  PAYMENT_METHOD_ORDER,
  PAYMENT_PROVIDER_OPTIONS,
} from '../../../services/paymentConfigService';
import { useSettingsState, useSliderStyles, useSwitchStyles } from './hooks/useSettingsState';
import { DigitalMenuCard } from './components/DigitalMenuCard';
import './Settings.css';

const LazySlider = lazy(() => Promise.resolve({ default: Slider }));

const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <CircularProgress size={24} />
  </Box>
);

const PaymentMethodsCard = React.memo(({
  settings,
  onSettingChange,
  onSave,
  getPaymentMethodLabel,
  switchStyles,
  saving,
}) => (
  <Card className="settings-card">
    <CardContent>
      <Box className="card-header">
        <Box className="card-title-section">
          <CreditCardIcon className="card-icon" />
          <Typography className="card-title">Cobrança da loja</Typography>
        </Box>
        <Button
          className="save-button"
          startIcon={<SaveIcon />}
          onClick={() => onSave('paymentMethods')}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </Box>

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
          control={
            <Switch
              checked={Boolean(settings.waiterPaymentEnabled)}
              onChange={(e) => onSettingChange('waiterPaymentEnabled', null, e.target.checked)}
              sx={switchStyles}
            />
          }
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
      <Box className="payment-methods">
        {PAYMENT_METHOD_ORDER.map((method) => (
          <Box key={method} className="payment-method-item">
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(settings.paymentMethods?.[method])}
                  onChange={(e) => onSettingChange('paymentMethods', method, e.target.checked)}
                  sx={switchStyles}
                />
              }
              label={getPaymentMethodLabel(method)}
            />
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
));

const PermissionsCard = React.memo(({ settings, onPermissionChange, onSave, getProfileLabel, getPermissionLabel, switchStyles }) => (
  <Card className="settings-card">
    <CardContent>
      <Box className="card-header">
        <Box className="card-title-section">
          <PeopleIcon className="card-icon" />
          <Typography className="card-title">Perfis e Permissões</Typography>
        </Box>
        <Button
          className="save-button"
          startIcon={<SaveIcon />}
          onClick={() => onSave('permissions')}
        >
          Salvar Permissões
        </Button>
      </Box>

      <Box className="permissions-section">
        {Object.entries(settings.permissions).map(([profile, permissions]) => (
          <Box key={profile} className="profile-section">
            <Typography className="profile-title">
              {getProfileLabel(profile)}
            </Typography>

            <Box className="permissions-grid">
              {Object.entries(permissions).map(([permission, enabled]) => (
                <FormControlLabel
                  key={`${profile}-${permission}`}
                  control={
                    <Switch
                      checked={enabled}
                      onChange={(e) => onPermissionChange(profile, permission, e.target.checked)}
                      sx={switchStyles}
                    />
                  }
                  label={getPermissionLabel(permission)}
                  className="permission-item"
                />
              ))}
            </Box>

            {profile !== 'caixa' && <Divider className="profile-divider" />}
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
));

const CompanyInfoCard = React.memo(({ settings, onSettingChange, onSave, onToast }) => (
  <Card className="settings-card">
    <CardContent>
      <Box className="card-header">
        <Box className="card-title-section">
          <BusinessIcon className="card-icon" />
          <Typography className="card-title">Dados Fiscais e Empresa</Typography>
        </Box>
        <Button
          className="save-button"
          startIcon={<SaveIcon />}
          onClick={() => onSave('companyInfo')}
        >
          Salvar Alterações
        </Button>
      </Box>

      <Box className="company-fields">
        <TextField
          label="Nome da empresa"
          value={settings.companyInfo.companyName}
          onChange={(e) => onSettingChange('companyInfo', 'companyName', e.target.value)}
          className="setting-input"
          fullWidth
        />

        <TextField
          label="CNPJ"
          value={settings.companyInfo.cnpj}
          onChange={(e) => onSettingChange('companyInfo', 'cnpj', e.target.value)}
          className="setting-input"
          fullWidth
        />

        <TextField
          label="Endereço"
          value={settings.companyInfo.address}
          onChange={(e) => onSettingChange('companyInfo', 'address', e.target.value)}
          className="setting-input"
          fullWidth
          multiline
          rows={2}
        />

        <TextField
          label="Telefone"
          value={settings.companyInfo.phone}
          onChange={(e) => onSettingChange('companyInfo', 'phone', e.target.value)}
          className="setting-input"
          fullWidth
        />

        <Box className="upload-section">
          <Typography className="setting-label">Logotipo da empresa</Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadIcon />}
            className="upload-button"
          >
            Upload Logotipo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={() => {
                onToast?.(
                  'Upload de logotipo ainda não está disponível no servidor.',
                  'info'
                );
              }}
            />
          </Button>
        </Box>
      </Box>
    </CardContent>
  </Card>
));

export function Settings() {
  const {
    settings,
    loading,
    saving,
    toast,
    setToast,
    showToast,
    updateSetting,
    updatePermission,
    saveSettings,
    getPaymentMethodLabel,
    getProfileLabel,
    getPermissionLabel,
  } = useSettingsState();

  const sliderStyles = useSliderStyles();
  const switchStyles = useSwitchStyles();

  const toastSnackbar = (
    <Portal>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Portal>
  );

  if (loading) {
    return (
      <div className="settings-container">
        <LoadingSpinner />
        {toastSnackbar}
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Box className="settings-header">
        <Typography className="settings-title">Configurações do Negócio</Typography>
        <Typography className="settings-subtitle">
          Gerencie as preferências e parâmetros operacionais da sua empresa.
        </Typography>
      </Box>

      <div className="settings-grid">
        <Card className="settings-card">
          <CardContent>
            <Box className="card-header">
              <Box className="card-title-section">
                <SettingsIcon className="card-icon" />
                <Typography className="card-title">Taxa de Serviço</Typography>
              </Box>
              <Button
                className="save-button"
                startIcon={<SaveIcon />}
                onClick={() => saveSettings('serviceFee')}
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </Box>

            <Box className="setting-item">
              <Typography className="setting-label">Percentual da taxa de serviço</Typography>
              <Box className="slider-container">
                <Suspense fallback={<LoadingSpinner />}>
                  <Slider
                    value={settings.serviceFee}
                    onChange={(e, value) => updateSetting('serviceFee', null, value)}
                    min={0}
                    max={20}
                    step={1}
                    marks={[
                      { value: 0, label: '0%' },
                      { value: 10, label: '10%' },
                      { value: 20, label: '20%' },
                    ]}
                    className="custom-slider"
                    sx={sliderStyles}
                  />
                </Suspense>
                <Typography className="slider-value">{settings.serviceFee}%</Typography>
              </Box>
              <Tooltip title="A taxa de serviço será aplicada automaticamente aos pedidos.">
                <Chip label="ℹ️ Informação" size="small" color="info" />
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        <PaymentMethodsCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          getPaymentMethodLabel={getPaymentMethodLabel}
          switchStyles={switchStyles}
          saving={saving}
        />

        <DigitalMenuCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          onToast={showToast}
          switchStyles={switchStyles}
          saving={saving}
        />

        <PermissionsCard
          settings={settings}
          onPermissionChange={updatePermission}
          onSave={saveSettings}
          getProfileLabel={getProfileLabel}
          getPermissionLabel={getPermissionLabel}
          switchStyles={switchStyles}
        />

        <CompanyInfoCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          onToast={showToast}
        />
      </div>

      {toastSnackbar}
    </div>
  );
}
