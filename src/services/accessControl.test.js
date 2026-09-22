import {
  PATHS,
  ROLES,
  canAccessRoute,
  formatDate,
  getDefaultRouteByRole,
  getPostLoginPath,
  getRestaurantId,
  hasPermission,
  hasStoreContext,
  isPlatformAdmin,
  isPublicPath,
  isStoreAdmin,
  toDateInputValue,
} from './accessControl';

function user(overrides) {
  return {
    id: 1,
    name: 'Teste',
    role: ROLES.ADMIN,
    storeId: 10,
    storeName: 'Loja Teste',
    subscriptionActive: true,
    subscriptionStatus: 'ACTIVE',
    ...overrides,
  };
}

describe('getRestaurantId', () => {
  it('retorna storeId (restaurantId conceitual)', () => {
    expect(getRestaurantId(user({ storeId: 42 }))).toBe(42);
  });

  it('não lê query string — só a sessão', () => {
    expect(getRestaurantId(user({ storeId: 7 }))).toBe(7);
  });
});

describe('getPostLoginPath / getDefaultRouteByRole', () => {
  it('MASTER e SUPER_ADMIN vão para o admin', () => {
    expect(getPostLoginPath(user({ role: ROLES.MASTER, storeId: null }))).toBe(PATHS.ADMIN_DASHBOARD);
    expect(getDefaultRouteByRole(user({ role: ROLES.SUPER_ADMIN, storeId: null }))).toBe(PATHS.ADMIN_DASHBOARD);
  });

  it('ADMIN e STORE_ADMIN vão para o dashboard da loja', () => {
    expect(getPostLoginPath(user({ role: ROLES.ADMIN }))).toBe(PATHS.APP_DASHBOARD);
    expect(getPostLoginPath(user({ role: ROLES.STORE_ADMIN }))).toBe(PATHS.APP_DASHBOARD);
  });

  it('operadores vão para a tela da função', () => {
    expect(getPostLoginPath(user({ role: ROLES.CASHIER }))).toBe(PATHS.APP_ATENDIMENTO);
    expect(getPostLoginPath(user({ role: ROLES.KITCHEN }))).toBe(PATHS.APP_COZINHA);
    expect(getPostLoginPath(user({ role: ROLES.WAITER }))).toBe(PATHS.APP_GARCOM);
  });

  it('assinatura inativa bloqueia a loja', () => {
    expect(getPostLoginPath(user({ subscriptionActive: false, subscriptionStatus: 'BLOCKED' })))
      .toBe(PATHS.SUBSCRIPTION_BLOCKED);
  });
});

describe('isPublicPath', () => {
  it('trata /cardapio/:slug como rota pública', () => {
    expect(isPublicPath('/cardapio/mcdonalds')).toBe(true);
    expect(isPublicPath('/cardapio')).toBe(true);
    expect(isPublicPath('/app/dashboard')).toBe(false);
  });

  it('trata /delivery/:slug e acompanhamento como rotas públicas', () => {
    expect(isPublicPath('/delivery/padaria')).toBe(true);
    expect(isPublicPath('/delivery/pedido/abc')).toBe(true);
    expect(isPublicPath('/delivery')).toBe(true);
  });

  it('trata /demo e /demo/:slug como rotas públicas', () => {
    expect(isPublicPath(PATHS.DEMO)).toBe(true);
    expect(isPublicPath('/demo')).toBe(true);
    expect(isPublicPath('/demo/weper-burger')).toBe(true);
    expect(isPublicPath('/demo/weper-pizza')).toBe(true);
    expect(isPublicPath('/app/dashboard')).toBe(false);
  });
});

describe('canAccessRoute', () => {
  it('CASHIER acessa atendimento e é recusado em produtos', () => {
    const cashier = user({ role: ROLES.CASHIER });
    expect(canAccessRoute(cashier, PATHS.APP_ATENDIMENTO)).toBe(true);
    expect(canAccessRoute(cashier, PATHS.APP_PRODUTOS)).toBe(false);
    expect(canAccessRoute(cashier, PATHS.APP_DASHBOARD)).toBe(false);
  });

  it('KITCHEN acessa cozinha e é recusado no dashboard', () => {
    const kitchen = user({ role: ROLES.KITCHEN });
    expect(canAccessRoute(kitchen, PATHS.APP_COZINHA)).toBe(true);
    expect(canAccessRoute(kitchen, PATHS.APP_DASHBOARD)).toBe(false);
  });

  it('WAITER acessa só a área do garçom', () => {
    const waiter = user({ role: ROLES.WAITER });
    expect(canAccessRoute(waiter, PATHS.APP_GARCOM)).toBe(true);
    expect(canAccessRoute(waiter, PATHS.APP_ATENDIMENTO)).toBe(false);
  });

  it('MASTER não entra em /app e entra em /admin', () => {
    const master = user({ role: ROLES.MASTER, storeId: null });
    expect(canAccessRoute(master, PATHS.APP_DASHBOARD)).toBe(false);
    expect(canAccessRoute(master, PATHS.ADMIN_DASHBOARD)).toBe(true);
    expect(canAccessRoute(master, PATHS.ADMIN_RESTAURANTES)).toBe(true);
    expect(canAccessRoute(master, PATHS.ADMIN_CRM)).toBe(true);
    expect(canAccessRoute(user({ role: ROLES.ADMIN }), PATHS.ADMIN_CRM)).toBe(false);
  });

  it('ADMIN acessa configurações da loja', () => {
    expect(canAccessRoute(user({ role: ROLES.ADMIN }), PATHS.APP_CONFIGURACOES)).toBe(true);
    expect(canAccessRoute(user({ role: ROLES.CASHIER }), PATHS.APP_CONFIGURACOES)).toBe(false);
  });

  it('ADMIN acessa sub-rotas de configurações', () => {
    expect(canAccessRoute(user({ role: ROLES.ADMIN }), `${PATHS.APP_CONFIGURACOES}/geral`)).toBe(true);
    expect(canAccessRoute(user({ role: ROLES.ADMIN }), `${PATHS.APP_CONFIGURACOES}/delivery`)).toBe(true);
    expect(canAccessRoute(user({ role: ROLES.CASHIER }), `${PATHS.APP_CONFIGURACOES}/geral`)).toBe(false);
  });

  it('rotas incompletas /app e /admin não são acessíveis (redirect para o default)', () => {
    expect(canAccessRoute(user({ role: ROLES.ADMIN }), PATHS.APP)).toBe(false);
    expect(canAccessRoute(user({ role: ROLES.MASTER, storeId: null }), PATHS.ADMIN)).toBe(false);
  });

  it('loja sem storeId não acessa rotas de restaurante', () => {
    const orphan = user({ storeId: null });
    expect(hasStoreContext(orphan)).toBe(false);
    expect(canAccessRoute(orphan, PATHS.APP_DASHBOARD)).toBe(false);
  });
});

describe('roles auxiliares', () => {
  it('trata ADMIN e STORE_ADMIN como admin da loja', () => {
    expect(isStoreAdmin(user({ role: ROLES.ADMIN }))).toBe(true);
    expect(isStoreAdmin(user({ role: ROLES.STORE_ADMIN }))).toBe(true);
    expect(isPlatformAdmin(user({ role: ROLES.SUPER_ADMIN, storeId: null }))).toBe(true);
  });

  it('hasPermission é um stub por role', () => {
    expect(hasPermission(user({ role: ROLES.CASHIER }), 'store.floor')).toBe(true);
    expect(hasPermission(user({ role: ROLES.CASHIER }), 'store.catalog')).toBe(false);
    expect(hasPermission(user({ role: ROLES.MASTER, storeId: null }), 'crm.manage')).toBe(true);
    expect(hasPermission(user({ role: ROLES.ADMIN }), 'crm.manage')).toBe(false);
  });
});

describe('formatDate / toDateInputValue', () => {
  it('formata ISO, yyyyMMdd e array Jackson como dd/MM/yyyy', () => {
    expect(formatDate('2026-10-21')).toBe('21/10/2026');
    expect(formatDate('20261021')).toBe('21/10/2026');
    expect(formatDate([2026, 10, 21])).toBe('21/10/2026');
    expect(formatDate(null)).toBe('—');
  });

  it('normaliza para input type=date (yyyy-MM-dd)', () => {
    expect(toDateInputValue('20261021')).toBe('2026-10-21');
    expect(toDateInputValue([2026, 10, 21])).toBe('2026-10-21');
    expect(toDateInputValue('2026-10-21T00:00:00')).toBe('2026-10-21');
  });
});
