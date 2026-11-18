import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acknowledgeOnboardingChecklist,
  completeOnboarding,
  dismissOnboarding,
  dismissOnboardingChecklist,
  getOnboardingChecklist,
  getOnboardingStatus,
  reopenOnboardingChecklist,
  saveOnboardingProgress,
  startOnboarding,
} from '../../../services/onboardingService';

const ADMIN_ROLES = new Set(['STORE_ADMIN', 'ADMIN']);

export function isOnboardingRole(user) {
  return ADMIN_ROLES.has(user?.role);
}

/**
 * Estado do onboarding no painel da loja. Tudo vem do backend; falha de rede só esconde o
 * onboarding e nunca bloqueia o painel.
 */
export function useOnboarding(user) {
  const eligibleRole = isOnboardingRole(user);
  const [status, setStatus] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const manualRef = useRef(false);

  const refreshChecklist = useCallback(() => {
    if (!eligibleRole) return Promise.resolve();
    return getOnboardingChecklist().then(setChecklist).catch(() => {});
  }, [eligibleRole]);

  useEffect(() => {
    if (!eligibleRole) return undefined;
    let active = true;
    getOnboardingStatus()
      .then((data) => {
        if (!active || !data) return;
        setStatus(data);
        if (data.eligible && data.showWelcome) {
          manualRef.current = false;
          setWelcomeOpen(true);
          if (data.status === 'NOT_STARTED') startOnboarding().catch(() => {});
        }
      })
      .catch(() => {});
    refreshChecklist();
    // Configurações feitas em outra aba ou tela atualizam o checklist ao voltar.
    const onFocus = () => refreshChecklist();
    window.addEventListener('focus', onFocus);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
    };
  }, [eligibleRole, refreshChecklist]);

  const onStep = useCallback((step) => {
    if (manualRef.current) return;
    saveOnboardingProgress(step).catch(() => {});
  }, []);

  const onFinish = useCallback((reason) => {
    setWelcomeOpen(false);
    const manual = manualRef.current;
    manualRef.current = false;
    if (manual) return;
    const request = reason === 'complete' ? completeOnboarding() : dismissOnboarding();
    request.then((data) => data && setStatus(data)).catch(() => {});
    refreshChecklist();
  }, [refreshChecklist]);

  const openWelcome = useCallback(() => {
    manualRef.current = true;
    setWelcomeOpen(true);
  }, []);

  const showChecklist = useCallback(() => {
    reopenOnboardingChecklist().then(setChecklist).catch(() => {});
  }, []);

  const dismissChecklist = useCallback(() => {
    dismissOnboardingChecklist().then(setChecklist).catch(() => {});
  }, []);

  const acknowledgeChecklist = useCallback(() => {
    acknowledgeOnboardingChecklist().then(setChecklist).catch(() => {});
  }, []);

  return {
    eligible: eligibleRole && Boolean(status?.eligible),
    storeName: status?.storeName || user?.storeName || '',
    initialStep: welcomeOpen && !manualRef.current ? status?.currentStep || 0 : 0,
    welcomeOpen,
    checklist,
    onStep,
    onFinish,
    openWelcome,
    showChecklist,
    dismissChecklist,
    acknowledgeChecklist,
  };
}
