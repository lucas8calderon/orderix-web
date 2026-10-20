import { getCurrentUser } from './authService';

const PLATFORM_ROLES = new Set(['MASTER', 'SUPER_ADMIN']);

/**
 * Sandbox/teste só para master/super admin ou site de staging.
 * Loja em produção trabalha só com ambiente prod.
 */
export function canChoosePaymentTestEnvironment() {
  const role = getCurrentUser()?.role;
  if (PLATFORM_ROLES.has(role)) {
    return true;
  }
  if (typeof window === 'undefined') {
    return false;
  }
  const host = String(window.location.hostname || '').toLowerCase();
  return host.includes('staging');
}

export function defaultMercadoPagoEnvironment() {
  return 'prod';
}

export function defaultPagBankEnvironment() {
  return 'prod';
}

export function defaultAsaasEnvironment() {
  return 'prod';
}
