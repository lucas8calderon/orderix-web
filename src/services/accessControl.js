export const ROLES = {
  MASTER: 'MASTER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  STORE_ADMIN: 'STORE_ADMIN',
  ADMIN: 'ADMIN',
  WAITER: 'WAITER',
  KITCHEN: 'KITCHEN',
  CASHIER: 'CASHIER',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  OVERDUE: 'OVERDUE',
  BLOCKED: 'BLOCKED',
  CANCELED: 'CANCELED',
};

export const SUBSCRIPTION_STATUS_LABELS = {
  ACTIVE: 'Ativa',
  PENDING: 'Pendente',
  OVERDUE: 'Inadimplente',
  BLOCKED: 'Bloqueada',
  CANCELED: 'Cancelada',
};

export const PLANS = {
  BASIC: { id: 'BASIC', label: 'Básico', price: 49.9 },
  PRO: { id: 'PRO', label: 'Pro', price: 79.9 },
  PREMIUM: { id: 'PREMIUM', label: 'Premium', price: 119.9 },
};

export const PLAN_LABELS = {
  BASIC: 'Básico',
  PRO: 'Pro',
  PREMIUM: 'Premium',
};

export function isPlatformAdmin(user) {
  const role = user?.role;
  return role === ROLES.MASTER || role === ROLES.SUPER_ADMIN;
}

export function isStoreAdmin(user) {
  const role = user?.role;
  return role === ROLES.STORE_ADMIN || role === ROLES.ADMIN;
}

export function isSubscriptionActive(user) {
  if (isPlatformAdmin(user)) {
    return true;
  }
  if (typeof user?.subscriptionActive === 'boolean') {
    return user.subscriptionActive;
  }
  return user?.subscriptionStatus === SUBSCRIPTION_STATUS.ACTIVE;
}

export function canManageFloor(user) {
  return isPlatformAdmin(user) || isStoreAdmin(user);
}

export function canAccessDashboardItem(user, item) {
  if (!item) return false;
  if (isPlatformAdmin(user)) {
    return true;
  }
  const allowed = item.roles;
  if (!allowed || allowed.length === 0) {
    return isStoreAdmin(user);
  }
  return allowed.includes(user?.role);
}

export function getVisibleDashboardItems(user, items) {
  return (items || []).filter((item) => canAccessDashboardItem(user, item));
}

export function getPostLoginPath(user) {
  if (!user) {
    return '/login';
  }
  if (isPlatformAdmin(user)) {
    return '/master/dashboard';
  }
  if (!isSubscriptionActive(user)) {
    return '/subscription-blocked';
  }
  return '/dashboard';
}

export function formatCurrency(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value) {
  if (!value) return '—';
  const date = typeof value === 'string' && value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('pt-BR');
}
