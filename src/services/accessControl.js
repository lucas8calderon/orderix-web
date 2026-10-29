import { PRICING_TIERS } from '../config/pricingTiers';

export const ROLES = {
  MASTER: 'MASTER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  STORE_ADMIN: 'STORE_ADMIN',
  ADMIN: 'ADMIN',
  WAITER: 'WAITER',
  KITCHEN: 'KITCHEN',
  CASHIER: 'CASHIER',
  PARTNER: 'PARTNER',
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

/**
 * Planos 1 a 5. O código coincide com SubscriptionPlan no backend.
 * Preço e volume vêm das mesmas faixas do site; o cliente vê só o valor.
 */
export const PLANS = Object.fromEntries(
  PRICING_TIERS.map((tier) => [
    tier.code,
    {
      id: tier.code,
      label: `Plano ${tier.number}`,
      price: tier.monthlyPrice,
      volumeLabel: tier.label,
    },
  ])
);

export const PLAN_LABELS = Object.fromEntries(
  Object.values(PLANS).map((plan) => [plan.id, plan.label])
);

export function getPlan(planId) {
  return PLANS[planId] || null;
}

/** Nome interno da faixa, com o volume quando for uma faixa atual. */
export function formatPlanSummary(planId) {
  if (planId === 'PLAN_TEST') {
    return 'Plano teste · Homologação R$ 5,00';
  }
  const plan = getPlan(planId);
  if (!plan) return planId || '—';
  return plan.volumeLabel ? `${plan.label} · ${plan.volumeLabel}` : plan.label;
}

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
  ADMIN_ESTABELECIMENTOS: '/admin/estabelecimentos',
  /** Endereços antigos; o painel redireciona para ADMIN_ESTABELECIMENTOS. */
  ADMIN_RESTAURANTES: '/admin/restaurantes',
  ADMIN_PLANOS: '/admin/planos',
  ADMIN_ASSINATURAS: '/admin/assinaturas',
  ADMIN_CRM: '/admin/crm',
  ADMIN_PARTNERS: '/admin/parceiros',
  LEGACY_DASHBOARD: '/dashboard',
  LEGACY_MASTER: '/master/dashboard',
  PUBLIC_MENU: '/cardapio',
  PUBLIC_MENU_SLUG: '/cardapio/:slug',
  PUBLIC_DELIVERY: '/delivery',
  PUBLIC_DELIVERY_SLUG: '/delivery/:slug',
  PUBLIC_DELIVERY_ACCOUNT: '/delivery/:slug/conta',
  PUBLIC_DELIVERY_ORDERS: '/delivery/:slug/conta/pedidos',
  PUBLIC_DELIVERY_ORDER: '/delivery/pedido/:publicToken',
  DEMO: '/demo',
  DEMO_SLUG: '/demo/:slug',
  PARTNERS: '/parceiros',
  PARTNERS_LOGIN: '/parceiros/login',
  PARTNERS_DASHBOARD: '/parceiros/dashboard',
  PARTNERS_PROFILE: '/parceiros/perfil',
  PARTNERS_PAYOUTS: '/parceiros/pagamentos',
  PARTNERS_RECOVERY: '/parceiros/recuperar-acesso',
  PARTNERS_RESET: '/parceiros/redefinir-senha',
  SIGNUP: '/contratar',
  SIGNUP_RETURN: '/contratar/retorno',
  INVITE: '/convite',
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
  PATHS.ADMIN_ESTABELECIMENTOS,
  PATHS.ADMIN_RESTAURANTES,
  PATHS.ADMIN_PLANOS,
  PATHS.ADMIN_ASSINATURAS,
  PATHS.ADMIN_CRM,
  PATHS.ADMIN_PARTNERS,
];

/** Área autenticada do parceiro. Login, recuperação e redefinição são públicos. */
const PARTNER_AREA_ROUTES = [
  PATHS.PARTNERS_DASHBOARD,
  PATHS.PARTNERS_PROFILE,
  PATHS.PARTNERS_PAYOUTS,
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
  [ROLES.PARTNER]: {
    home: PATHS.PARTNERS_DASHBOARD,
    routes: PARTNER_AREA_ROUTES,
  },
};

/**
 * Permissões futuras por role (stub). Não é RBAC completo —
 * a autorização real continua no backend via JWT + SecurityConfig.
 */
export const ROLE_PERMISSIONS = {
  [ROLES.MASTER]: ['platform.admin', 'stores.manage', 'plans.manage', 'subscriptions.manage', 'crm.manage'],
  [ROLES.SUPER_ADMIN]: ['platform.admin', 'stores.manage', 'plans.manage', 'subscriptions.manage', 'crm.manage'],
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
  [ROLES.PARTNER]: ['partner.portal'],
};

export const PUBLIC_PATHS = [
  PATHS.HOME,
  PATHS.LOGIN,
  PATHS.FORGOT_PASSWORD,
  PATHS.PRIVACY,
  PATHS.TERMS,
  PATHS.DEMO,
  PATHS.PARTNERS,
  PATHS.PARTNERS_LOGIN,
  PATHS.PARTNERS_RECOVERY,
  PATHS.PARTNERS_RESET,
  PATHS.SIGNUP,
  PATHS.SIGNUP_RETURN,
  PATHS.INVITE,
];

export function isPlatformAdmin(user) {
  const role = user?.role;
  return role === ROLES.MASTER || role === ROLES.SUPER_ADMIN;
}

export function isPartner(user) {
  return user?.role === ROLES.PARTNER;
}

/** Rotas da área autenticada do parceiro (exclui landing, login e recuperação). */
export function isPartnerAreaPath(path) {
  const normalized = normalizePath(path);
  return PARTNER_AREA_ROUTES.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`)
  );
}

/** Qualquer path sob /parceiros, público ou não. */
export function isPartnersPath(path) {
  const normalized = normalizePath(path);
  return normalized === PATHS.PARTNERS || normalized.startsWith(`${PATHS.PARTNERS}/`);
}

export function isStoreAdmin(user) {
  const role = user?.role;
  return role === ROLES.STORE_ADMIN || role === ROLES.ADMIN;
}

export function isCashier(user) {
  return user?.role === ROLES.CASHIER;
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

const LIMITED_STATUSES = new Set([
  SUBSCRIPTION_STATUS.BLOCKED,
  SUBSCRIPTION_STATUS.CANCELED,
  SUBSCRIPTION_STATUS.OVERDUE,
]);

/** 8º dia ou suspensão: a loja consulta, regulariza e conclui pedido já aberto. */
export function isLimitedSubscription(user) {
  if (!user || isPlatformAdmin(user) || isSubscriptionActive(user)) {
    return false;
  }
  return LIMITED_STATUSES.has(user.subscriptionStatus);
}

export function limitedSubscriptionPaths(user) {
  if (!isLimitedSubscription(user)) {
    return [];
  }
  if (isStoreAdmin(user)) {
    return [
      PATHS.APP_DASHBOARD,
      PATHS.APP_CONFIGURACOES,
      PATHS.APP_ATENDIMENTO,
      PATHS.APP_COZINHA,
    ];
  }
  if (user.role === ROLES.KITCHEN) {
    return [PATHS.APP_COZINHA];
  }
  if (user.role === ROLES.CASHIER) {
    return [PATHS.APP_ATENDIMENTO];
  }
  if (user.role === ROLES.WAITER) {
    return [PATHS.APP_GARCOM];
  }
  return [];
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
  const normalized = normalizePath(path);
  if (PUBLIC_PATHS.includes(normalized)) {
    return true;
  }
  return normalized === PATHS.PUBLIC_MENU
    || normalized.startsWith(`${PATHS.PUBLIC_MENU}/`)
    || normalized === PATHS.PUBLIC_DELIVERY
    || normalized.startsWith(`${PATHS.PUBLIC_DELIVERY}/`)
    || normalized === PATHS.DEMO
    || normalized.startsWith(`${PATHS.DEMO}/`);
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

  // Parceiro não tem loja nem assinatura: só enxerga a própria área.
  if (isPartner(user)) {
    return isPartnerAreaPath(normalized);
  }

  if (normalized === PATHS.SUBSCRIPTION_BLOCKED) {
    return !isPlatformAdmin(user) && !isSubscriptionActive(user);
  }

  if (!isPlatformAdmin(user) && !isSubscriptionActive(user)) {
    if (!isLimitedSubscription(user) || !hasStoreContext(user)) {
      return false;
    }
    return limitedSubscriptionPaths(user).some(
      (route) => normalized === route || normalized.startsWith(`${route}/`)
    );
  }

  if (!isPlatformAdmin(user) && !hasStoreContext(user)) {
    return false;
  }

  const config = ROLE_ROUTES[user.role];
  if (!config) {
    return false;
  }
  // Permite sub-rotas (ex.: /app/configuracoes/geral) sob um path permitido.
  return config.routes.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`)
  );
}

export function getPostLoginPath(user) {
  if (!user) {
    return PATHS.LOGIN;
  }
  if (isPlatformAdmin(user)) {
    return ROLE_ROUTES[user.role]?.home || PATHS.ADMIN_DASHBOARD;
  }
  if (isPartner(user)) {
    return PATHS.PARTNERS_DASHBOARD;
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

/**
 * Normaliza datas vindas da API (ISO, yyyy-MM-dd, yyyyMMdd ou array Jackson [y,m,d])
 * para `yyyy-MM-dd` (valor de `<input type="date">`).
 */
export function toDateInputValue(value) {
  if (value == null || value === '') return '';
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value;
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  if (/^\d{8}$/.test(raw)) return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  const parsed = new Date(raw.includes('T') ? raw : `${raw}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Exibe data em dd/MM/yyyy (pt-BR). */
export function formatDate(value) {
  if (value == null || value === '') return '—';
  const iso = toDateInputValue(value);
  if (!iso) return typeof value === 'string' ? value : '—';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR');
}

export { STORE_ADMIN_ROLES, PLATFORM_ROLES };
