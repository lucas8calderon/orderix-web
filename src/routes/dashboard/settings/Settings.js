import React, { lazy, Suspense } from 'react';
import { 
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
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CreditCard as CreditCardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Save as SaveIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useSettingsState, useSliderStyles, useSwitchStyles } from './hooks/useSettingsState';
import './Settings.css';

// Lazy loading para componentes pesados
const LazySlider = lazy(() => Promise.resolve({ default: Slider }));

// Componente de loading
const LoadingSpinner = () => (
  <Box display="flex" justifyContent="center" alignItems="center" p={2}>
    <CircularProgress size={24} />
  </Box>
);

// Componente otimizado para Payment Methods
const PaymentMethodsCard = React.memo(({ settings, onSettingChange, onSave, getPaymentMethodLabel, switchStyles }) => (
  <Card className="settings-card">
    <CardContent>
      <Box className="card-header">
        <Box className="card-title-section">
          <CreditCardIcon className="card-icon" />
          <Typography className="card-title">Métodos de Pagamento</Typography>
        </Box>
        <Button
          className="save-button"
          startIcon={<SaveIcon />}
          onClick={() => onSave('paymentMethods')}
        >
          Salvar
        </Button>
      </Box>
      
      <Box className="payment-methods">
        {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
          <Box key={method} className="payment-method-item">
            <FormControlLabel
                  control={
                    <Switch
                      checked={enabled}
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

// Componente otimizado para Permissions
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

// Componente otimizado para Company Info
const CompanyInfoCard = React.memo(({ settings, onSettingChange, onSave }) => (
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
            <input type="file" hidden onChange={(e) => console.log('Upload logo:', e.target.files[0])} />
          </Button>
        </Box>
      </Box>
    </CardContent>
  </Card>
));

export function Settings() {
  const {
    settings,
    toast,
    setToast,
    updateSetting,
    updatePermission,
    saveSettings,
    getSectionTitle,
    getPaymentMethodLabel,
    getProfileLabel,
    getPermissionLabel
  } = useSettingsState();

  const sliderStyles = useSliderStyles();
  const switchStyles = useSwitchStyles();

    return (
    <div className="settings-container">
      {/* Header */}
      <Box className="settings-header">
        <Typography className="settings-title">Configurações do Negócio</Typography>
        <Typography className="settings-subtitle">
          Gerencie as preferências e parâmetros operacionais da sua empresa.
        </Typography>
      </Box>

      {/* Settings Sections */}
      <div className="settings-grid">
        
        {/* Taxa de Serviço */}
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
              >
                Salvar
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
                      { value: 20, label: '20%' }
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

        {/* Métodos de Pagamento */}
        <PaymentMethodsCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          getPaymentMethodLabel={getPaymentMethodLabel}
          switchStyles={switchStyles}
        />

        {/* Perfis e Permissões */}
        <PermissionsCard
          settings={settings}
          onPermissionChange={updatePermission}
          onSave={saveSettings}
          getProfileLabel={getProfileLabel}
          getPermissionLabel={getPermissionLabel}
          switchStyles={switchStyles}
        />

        {/* Dados Fiscais e Empresa */}
        <CompanyInfoCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
        />

      </div>
    </div>
  );
}