import React, { useCallback, useEffect, useRef } from 'react';
import { Alert, Portal, Snackbar } from '@mui/material';
import {
  Inventory2Outlined as InventoryIcon,
  SettingsOutlined as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PATHS } from '../../../services/accessControl';
import { useSettingsState, useSliderStyles, useSwitchStyles } from './hooks/useSettingsState';
import {
  DEFAULT_SETTINGS_SECTION,
  isValidSettingsSection,
  resolveSettingsSection,
  settingsSectionPath,
} from './settingsSections';
import { SettingsNav } from './components/SettingsNav';
import { SettingsSkeleton } from './components/SettingsSkeleton';
import { SettingsOverview, SettingsModuleIntro } from './components/SettingsOverview';
import { HoursCard } from './components/HoursCard';
import { DeliverySettingsCard } from './components/DeliverySettingsCard';
import { DigitalMenuCard } from './components/DigitalMenuCard';
import { PaymentsSection } from './components/PaymentsSection';
import { OnlineDeliveryPayments } from './components/OnlineDeliveryPayments';
import { FeesSection } from './components/FeesSection';
import { PermissionsSection } from './components/PermissionsSection';
import { CompanySection } from './components/CompanySection';
import { SettingsSectionCard } from './components/SettingsSectionCard';
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

  const imageSaveQueued = useRef(false);
  const handleSettingChange = useCallback((section, key, value) => {
    updateSetting(section, key, value);
    if (section === 'deliveryLogoUrl' || section === 'deliveryCoverUrl') {
      imageSaveQueued.current = true;
    }
  }, [updateSetting]);

  useEffect(() => {
    if (!imageSaveQueued.current || loading) return;
    imageSaveQueued.current = false;
    saveSettings('delivery', { imageOnly: true });
  }, [settings.deliveryLogoUrl, settings.deliveryCoverUrl, loading, saveSettings]);

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

  const hoursCard = (
    <HoursCard
      settings={settings}
      onSettingChange={updateSetting}
      onSave={saveSettings}
      switchStyles={switchStyles}
      saving={saving}
    />
  );

  const paymentsSection = (
    <PaymentsSection
      settings={settings}
      onSettingChange={updateSetting}
      onSave={saveSettings}
      getPaymentMethodLabel={getPaymentMethodLabel}
      switchStyles={switchStyles}
      saving={saving}
    />
  );

  const deliveryCard = (
    <DeliverySettingsCard
      settings={settings}
      onSettingChange={handleSettingChange}
      onSave={saveSettings}
      onToast={showToast}
      switchStyles={switchStyles}
      saving={saving}
    />
  );

  const onlineDeliveryPayments = (
    <OnlineDeliveryPayments
      settings={settings}
      onSettingChange={updateSetting}
      onSave={saveSettings}
      switchStyles={switchStyles}
      saving={saving}
    />
  );

  const digitalMenuCard = (
    <DigitalMenuCard
      settings={settings}
      onSettingChange={updateSetting}
      onSave={saveSettings}
      onToast={showToast}
      switchStyles={switchStyles}
      saving={saving}
    />
  );

  const feesSection = (
    <FeesSection
      settings={settings}
      onSettingChange={updateSetting}
      onSave={saveSettings}
      onNavigate={goToSection}
      sliderStyles={sliderStyles}
      saving={saving}
    />
  );

  const permissionsSection = (
    <PermissionsSection
      settings={settings}
      onPermissionChange={updatePermission}
      onSave={saveSettings}
      getProfileLabel={getProfileLabel}
      getPermissionLabel={getPermissionLabel}
      switchStyles={switchStyles}
    />
  );

  const companySection = (
    <CompanySection
      settings={settings}
      onSettingChange={handleSettingChange}
      onSave={saveSettings}
      saving={saving}
    />
  );

  const stockShortcut = (
    <SettingsSectionCard
      icon={InventoryIcon}
      title="Disponibilidade dos produtos"
      description="Ative ou desative produtos no catálogo para definir o que pode ser vendido."
      actionLabel="Abrir catálogo"
      actionVariant="link"
      onAction={() => navigate(PATHS.APP_PRODUTOS)}
      compact
      className="settings-card--nav"
    />
  );

  const settingsNav = (
    <SettingsNav activeSection={activeSection || DEFAULT_SETTINGS_SECTION} onNavigate={goToSection} />
  );

  const isOverview = activeSection === 'geral' || !activeSection;

  let sectionContent = null;
  switch (activeSection) {
    case 'geral':
      sectionContent = null;
      break;
    case 'operacao':
      sectionContent = (
        <div className="settings-section-stack">
          {hoursCard}
          <FeesSection
            settings={settings}
            onSettingChange={updateSetting}
            onSave={saveSettings}
            onNavigate={goToSection}
            sliderStyles={sliderStyles}
            saving={saving}
            variant="fee"
          />
        </div>
      );
      break;
    case 'horarios':
      sectionContent = hoursCard;
      break;
    case 'vendas':
    case 'pagamentos':
    case 'integracoes':
      sectionContent = paymentsSection;
      break;
    case 'canais':
    case 'delivery':
      sectionContent = (
        <div className="settings-section-stack">
          {deliveryCard}
          {onlineDeliveryPayments}
        </div>
      );
      break;
    case 'cardapio':
      sectionContent = (
        <div className="settings-section-stack">
          {digitalMenuCard}
          {stockShortcut}
        </div>
      );
      break;
    case 'cardapio-digital':
      sectionContent = digitalMenuCard;
      break;
    case 'taxas':
      sectionContent = feesSection;
      break;
    case 'equipe':
    case 'permissoes':
      sectionContent = permissionsSection;
      break;
    case 'empresa':
      sectionContent = companySection;
      break;
    case 'aparencia':
      sectionContent = (
        <div className="settings-section-stack">
          <SettingsModuleIntro
            title="Aparência"
            text="Logo e banner são editados na Visão Geral, na personalização visual."
          />
          <SettingsSectionCard
            title="Personalização visual"
            description="Altere o logo e o banner da loja na Visão Geral, sem sair das Configurações."
            actionLabel="Ir para Visão Geral"
            actionVariant="edit"
            onAction={() => goToSection('geral')}
            compact
            className="settings-card--nav"
          />
        </div>
      );
      break;
    default:
      sectionContent = null;
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
            Gerencie todas as informações e preferências do seu estabelecimento.
          </p>
        </div>
      </header>

      {isOverview ? (
        <div className="settings-section-panel" role="tabpanel">
          <SettingsOverview
            settings={settings}
            onNavigate={goToSection}
            onSettingChange={handleSettingChange}
            saving={saving}
            nav={settingsNav}
          />
        </div>
      ) : (
        <>
          {settingsNav}
          <div className="settings-section-panel" role="tabpanel">
            {sectionContent}
          </div>
        </>
      )}

      {toastSnackbar}
    </div>
  );
}

export default Settings;
