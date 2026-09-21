import React, { useCallback, useEffect } from 'react';
import { Alert, Portal, Snackbar } from '@mui/material';
import { SettingsOutlined as SettingsIcon } from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSettingsState, useSliderStyles, useSwitchStyles } from './hooks/useSettingsState';
import {
  DEFAULT_SETTINGS_SECTION,
  isValidSettingsSection,
  resolveSettingsSection,
  settingsSectionPath,
} from './settingsSections';
import { SettingsNav } from './components/SettingsNav';
import { SettingsSkeleton } from './components/SettingsSkeleton';
import { GeneralSection } from './components/GeneralSection';
import { HoursCard } from './components/HoursCard';
import { DeliverySettingsCard } from './components/DeliverySettingsCard';
import { DigitalMenuCard } from './components/DigitalMenuCard';
import { PaymentsSection } from './components/PaymentsSection';
import { FeesSection } from './components/FeesSection';
import { PermissionsSection } from './components/PermissionsSection';
import { CompanySection } from './components/CompanySection';
import './Settings.css';

export function Settings() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const activeSection = resolveSettingsSection({
    splat: params['*'],
    searchParams,
  });

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

  const goToSection = useCallback((sectionId) => {
    navigate(settingsSectionPath(sectionId));
  }, [navigate]);

  // Canonicaliza /app/configuracoes e ?section= legado para /app/configuracoes/:section
  useEffect(() => {
    const pathParts = String(params['*'] || '').split('/').filter(Boolean);
    const pathSection = pathParts[0];
    const querySection = searchParams.get('section');
    const needsCanonical =
      !isValidSettingsSection(pathSection)
      || Boolean(querySection)
      || pathParts.length > 1;
    if (needsCanonical) {
      navigate(settingsSectionPath(activeSection), { replace: true });
    }
  }, [params, searchParams, activeSection, navigate]);

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
      <>
        <SettingsSkeleton />
        {toastSnackbar}
      </>
    );
  }

  let sectionContent = null;
  switch (activeSection) {
    case 'horarios':
      sectionContent = (
        <HoursCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          switchStyles={switchStyles}
          saving={saving}
        />
      );
      break;
    case 'pagamentos':
      sectionContent = (
        <PaymentsSection
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          getPaymentMethodLabel={getPaymentMethodLabel}
          switchStyles={switchStyles}
          saving={saving}
        />
      );
      break;
    case 'delivery':
      sectionContent = (
        <DeliverySettingsCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          onToast={showToast}
          switchStyles={switchStyles}
          saving={saving}
        />
      );
      break;
    case 'cardapio-digital':
      sectionContent = (
        <DigitalMenuCard
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          onToast={showToast}
          switchStyles={switchStyles}
          saving={saving}
        />
      );
      break;
    case 'taxas':
      sectionContent = (
        <FeesSection
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          onNavigate={goToSection}
          sliderStyles={sliderStyles}
          saving={saving}
        />
      );
      break;
    case 'permissoes':
      sectionContent = (
        <PermissionsSection
          settings={settings}
          onPermissionChange={updatePermission}
          onSave={saveSettings}
          getProfileLabel={getProfileLabel}
          getPermissionLabel={getPermissionLabel}
          switchStyles={switchStyles}
        />
      );
      break;
    case 'empresa':
      sectionContent = (
        <CompanySection
          settings={settings}
          onSettingChange={updateSetting}
          onSave={saveSettings}
          onToast={showToast}
        />
      );
      break;
    case 'geral':
    default:
      sectionContent = (
        <GeneralSection settings={settings} onNavigate={goToSection} />
      );
      break;
  }

  return (
    <div className="settings-container">
      <header className="settings-header settings-header--page">
        <div className="settings-header__icon" aria-hidden>
          <SettingsIcon />
        </div>
        <div className="settings-header__text">
          <h1 className="settings-title">Configurações da Loja</h1>
          <p className="settings-subtitle">
            Gerencie as preferências e parâmetros operacionais da sua empresa.
          </p>
        </div>
      </header>

      <SettingsNav activeSection={activeSection || DEFAULT_SETTINGS_SECTION} onNavigate={goToSection} />

      <div className="settings-section-panel" role="tabpanel">
        {sectionContent}
      </div>

      {toastSnackbar}
    </div>
  );
}

export default Settings;
