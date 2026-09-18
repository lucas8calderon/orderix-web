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

/** Preços iguais a SubscriptionPlan no backend (49,90 / 79,90 / 119,90). */
export const PLANS = {
  BASIC: { id: 'BASIC', label: 'Básico', price: 49.9 },
  PRO: { id: 'PRO', label: 'Profissional', price: 79.9 },
  PREMIUM: { id: 'PREMIUM', label: 'Premium', price: 119.9 },
};

export const PLAN_LABELS = {
  BASIC: 'Básico',
  PRO: 'Profissional',
  PREMIUM: 'Premium',
};

/** Rotas canônicas da aplicação. storeId do backend = restaurantId conceitual. */
export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SUBSCRIPTION_BLOCKED: '/subscription-blocked',
  APP: '/app',
  APP_DASHBOARD: '/app/dashboard',
  APP_ATENDIMENTO: '/app/atendimento',
  APP_PRODUTOS: '/app/produtos',
  APP_ESTOQUE: '/app/estoque',
  APP_COZINHA: '/app/cozinha',
  APP_COLABORADORES: '/app/colaboradores',
  APP_CONFIGURACOES: '/app/configuracoes',
  APP_GARCOM: '/app/garcom',
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_RESTAURANTES: '/admin/restaurantes',
  ADMIN_PLANOS: '/admin/planos',
  ADMIN_ASSINATURAS: '/admin/assinaturas',
  LEGACY_DASHBOARD: '/dashboard',
  LEGACY_MASTER: '/master/dashboard',
};

const STORE_ADMIN_ROLES = [ROLES.ADMIN, ROLES.STORE_ADMIN];
const PLATFORM_ROLES = [ROLES.MASTER, ROLES.SUPER_ADMIN];

/** Inventário mockado fica fora do menu; configurações de cobrança entram pelo path APP_CONFIGURACOES. */
const STORE_ADMIN_APP_ROUTES = [
  PATHS.APP_DASHBOARD,
  PATHS.APP_ATENDIMENTO,
  PATHS.APP_PRODUTOS,
  PATHS.APP_ESTOQUE,
  PATHS.APP_COZINHA,
  PATHS.APP_COLABORADORES,
  PATHS.APP_CONFIGURACOES,
];

const PLATFORM_ADMIN_ROUTES = [
  PATHS.ADMIN_DASHBOARD,
  PATHS.ADMIN_RESTAURANTES,
  PATHS.ADMIN_PLANOS,
  PATHS.ADMIN_ASSINATURAS,
];

/**
 * Configuração central de rotas por role.
 * Evita `if (role === ...)` espalhados no app.
 */
export const ROLE_ROUTES = {
  [ROLES.MASTER]: {
    home: PATHS.ADMIN_DASHBOARD,
    routes: PLATFORM_ADMIN_ROUTES,
  },
  [ROLES.SUPER_ADMIN]: {
    home: PATHS.ADMIN_DASHBOARD,
    routes: PLATFORM_ADMIN_ROUTES,
  },
  [ROLES.ADMIN]: {
    home: PATHS.APP_DASHBOARD,
    routes: STORE_ADMIN_APP_ROUTES,
  },
  [ROLES.STORE_ADMIN]: {
    home: PATHS.APP_DASHBOARD,
    routes: STORE_ADMIN_APP_ROUTES,
  },
  [ROLES.CASHIER]: {
    home: PATHS.APP_ATENDIMENTO,
    routes: [PATHS.APP_ATENDIMENTO],
  },
  [ROLES.KITCHEN]: {
    home: PATHS.APP_COZINHA,
    routes: [PATHS.APP_COZINHA],
  },
  [ROLES.WAITER]: {
    home: PATHS.APP_GARCOM,
    routes: [PATHS.APP_GARCOM],
  },
};

/**
 * Permissões futuras por role (stub). Não é RBAC completo —
 * a autorização real continua no backend via JWT + SecurityConfig.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.MASTER]: ['platform.admin', 'stores.manage', 'plans.manage', 'subscriptions.manage'],
  [ROLES.SUPER_ADMIN]: ['platform.admin', 'stores.manage', 'plans.manage', 'subscriptions.manage'],
  [ROLES.ADMIN]: [
    'store.dashboard',
    'store.floor',
    'store.catalog',
    'store.inventory',
    'store.kitchen',
    'store.employees',
    'store.settings',
  ],
  [ROLES.STORE_ADMIN]: [
    'store.dashboard',
    'store.floor',
    'store.catalog',
    'store.inventory',
    'store.kitchen',
    'store.employees',
    'store.settings',
  ],
  [ROLES.CASHIER]: ['store.floor'],
  [ROLES.KITCHEN]: ['store.kitchen'],
  [ROLES.WAITER]: ['store.waiter'],
};

export const PUBLIC_PATHS = [
  PATHS.HOME,
  PATHS.LOGIN,
  PATHS.FORGOT_PASSWORD,
  PATHS.PRIVACY,
  PATHS.TERMS,
];

export function isPlatformAdmin(user) {
  const role = user?.role;
  return role === ROLES.MASTER || role === ROLES.SUPER_ADMIN;
}

export function isStoreAdmin(user) {
  const role = user?.role;
  return role === ROLES.STORE_ADMIN || role === ROLES.ADMIN;
}

export function isFloorOperator(user) {
  const role = user?.role;
  return role === ROLES.WAITER || role === ROLES.CASHIER || isStoreAdmin(user) || isPlatformAdmin(user);
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

/**
 * ID da loja/restaurante na sessão. O backend usa storeId (não restaurantId).
 * Query params NÃO devem trocar de loja — o tenant vem do JWT.
 */
export function getRestaurantId(user) {
  return user?.storeId ?? null;
}

export function hasStoreContext(user) {
  if (isPlatformAdmin(user)) {
    return true;
  }
  return Boolean(getRestaurantId(user));
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

export function normalizePath(path) {
  if (!path || typeof path !== 'string') {
    return PATHS.HOME;
  }
  const clean = path.split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean;
}

export function isPublicPath(path) {
  return PUBLIC_PATHS.includes(normalizePath(path));
}

export function hasPermission(user, permission) {
  if (!user?.role || !permission) {
    return false;
  }
  const granted = ROLE_PERMISSIONS[user.role] || [];
  return granted.includes(permission);
}

export function canAccessRoute(user, path) {
  if (!user) {
    return false;
  }

  const normalized = normalizePath(path);
  if (isPublicPath(normalized)) {
    return true;
  }

  if (normalized === PATHS.SUBSCRIPTION_BLOCKED) {
    return !isPlatformAdmin(user) && !isSubscriptionActive(user);
  }

  if (!isPlatformAdmin(user) && !isSubscriptionActive(user)) {
    return false;
  }

  if (!isPlatformAdmin(user) && !hasStoreContext(user)) {
    return false;
  }

  const config = ROLE_ROUTES[user.role];
  if (!config) {
    return false;
  }
  return config.routes.includes(normalized);
}

export function getPostLoginPath(user) {
  if (!user) {
    return PATHS.LOGIN;
  }
  if (isPlatformAdmin(user)) {
    return ROLE_ROUTES[user.role]?.home || PATHS.ADMIN_DASHBOARD;
  }
  if (!isSubscriptionActive(user)) {
    return PATHS.SUBSCRIPTION_BLOCKED;
  }
  return ROLE_ROUTES[user.role]?.home || PATHS.LOGIN;
}

export function getDefaultRouteByRole(user) {
  return getPostLoginPath(user);
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

export { STORE_ADMIN_ROLES, PLATFORM_ROLES };
