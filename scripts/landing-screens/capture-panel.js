// Captura telas reais do painel Weper (dev server local) com a API interceptada
// e dados fictícios da loja de demonstração "Weper Burger". Nada chega a um backend.
const path = require('path');
const fs = require('fs');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '../../../orderix-visual/node_modules/playwright');

const OUT = path.join(__dirname, '.shots');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.WEPER_WEB_BASE_URL || 'http://localhost:3000';
const only = new Set(process.argv.slice(2));
const want = name => only.size === 0 || only.has(name);

const USER = { id: 1, name: 'Marina Costa', email: 'demo@weper.local', role: 'STORE_ADMIN', storeId: 1, storeName: 'Weper Burger', subscriptionActive: true, subscriptionStatus: 'ACTIVE' };
const ago = minutes => new Date(Date.now() - minutes * 60000).toISOString();
const img = file => `${BASE}/images/demo/burger/${file}`;

const CATEGORIES = [
  { id: 1, name: 'Smash', active: true, sortOrder: 1 },
  { id: 2, name: 'Clássicos', active: true, sortOrder: 2 },
  { id: 3, name: 'Acompanhamentos', active: true, sortOrder: 3 },
  { id: 4, name: 'Bebidas', active: true, sortOrder: 4 },
];
const P = (id, name, value, file, categoryId) => ({ id, name, value, image: img(file), categoryId, categoryName: CATEGORIES.find(c => c.id === categoryId).name, isAvailable: true, sellable: true, extras: [], mandatoryGroups: [], variations: [] });
const PRODUCTS = [
  P(1, 'Smash Cheddar', 22.9, 'smash-cheddar.jpg', 1),
  P(2, 'Smash Bacon', 34.9, 'smash-bacon.jpg', 1),
  P(3, 'Smash Original', 36.9, 'smash-original.jpg', 1),
  P(4, 'Clássico Cheddar', 24.9, 'classico-cheddar.jpg', 2),
  P(5, 'Clássico Americano', 25.9, 'classico-americano.jpg', 2),
  P(6, 'Clássico Weper', 27.9, 'classico-weper.jpg', 2),
  P(7, 'Bacon Weper', 31.9, 'bacon-weper.jpg', 2),
  P(8, 'Chicken Crispy', 26.9, 'chicken-crispy.jpg', 2),
  P(9, 'Batata Frita', 14.9, 'batatas.jpg', 3),
  P(10, 'Onion Rings', 16.9, 'onion-rings.jpg', 3),
  P(11, 'Nuggets', 18.9, 'nuggets.jpg', 3),
  P(12, 'Refrigerante Lata', 6.9, 'refrigerante-lata.jpg', 4),
  P(13, 'Suco Natural', 9.9, 'sucos.jpg', 4),
  P(14, 'Milkshake', 17.9, 'milkshake.jpg', 4),
];

const TABLES = [
  [1, 4, false], [2, 4, false], [3, 2, true], [4, 2, false], [5, 6, true], [6, 4, true],
  [7, 2, false], [8, 4, true], [9, 6, false], [10, 2, true], [11, 4, true], [12, 8, false],
].map(([number, capacity, isAvailable]) => ({ id: number, number, capacity, isAvailable }));
const COMANDAS = [[1, false], [2, false], [3, true], [4, false], [5, true], [6, true], [7, false], [8, true], [9, true], [10, true], [11, false], [12, true]]
  .map(([number, isAvailable]) => ({ id: 100 + number, number, isAvailable }));

const item = (name, quantity = 1, value = 20, observation = '') => ({ name, quantity, value, observation, extras: [] });
const COUNTER_ORDERS = [
  { id: 148, status: 'ACTIVE', customerName: 'Rafael', createdAt: ago(4), paymentStatus: 'APPROVED', products: [item('Smash Bacon', 2, 34.9), item('Batata Frita', 1, 14.9)] },
  { id: 147, status: 'ACTIVE', customerName: 'Juliana', createdAt: ago(9), paymentStatus: 'PENDING', products: [item('Clássico Weper', 1, 27.9), item('Suco Natural', 1, 9.9)] },
  { id: 145, status: 'ACTIVE', customerName: 'Diego', createdAt: ago(16), paymentStatus: 'APPROVED', products: [item('Chicken Crispy', 1, 26.9), item('Refrigerante Lata', 2, 6.9)] },
];

function kitchenOrders(stage) {
  // stage 0: pedido 152 acabou de chegar · stage 1: 152 em produção e 149 pronto
  const list = [
    { id: 152, kitchenStatus: stage <= 0 ? 'NEW' : 'IN_PREPARATION', customerName: 'Camila', orderSource: 'DELIVERY', createdAt: ago(1), products: [item('Smash Bacon', 1, 34.9, 'Sem cebola'), item('Batata Frita', 1, 14.9), item('Refrigerante Lata', 1, 6.9)] },
    { id: 151, kitchenStatus: 'NEW', customerName: 'Mesa 2', tableId: 2, tableNumber: 2, waiterId: 7, waiterName: 'Bruno', orderSource: 'WAITER', createdAt: ago(3), products: [item('Clássico Weper', 2, 27.9), item('Onion Rings', 1, 16.9)] },
    { id: 150, kitchenStatus: 'IN_PREPARATION', customerName: 'Comanda 4', comandaId: 104, comandaNumber: 4, createdAt: ago(7), products: [item('Chicken Crispy', 1, 26.9), item('Milkshake', 1, 17.9)] },
    { id: 149, kitchenStatus: stage <= 0 ? 'IN_PREPARATION' : 'READY', customerName: 'Rafael', tableId: 999, createdAt: ago(10), products: [item('Smash Original', 1, 36.9), item('Nuggets', 1, 18.9)] },
    { id: 148, kitchenStatus: 'READY', customerName: 'Mesa 9', tableId: 9, tableNumber: 9, waiterId: 7, waiterName: 'Bruno', orderSource: 'WAITER', createdAt: ago(13), products: [item('Bacon Weper', 2, 31.9), item('Batata Frita', 2, 14.9)] },
    { id: 146, kitchenStatus: 'DELIVERED', customerName: 'Juliana', orderSource: 'PICKUP', createdAt: ago(21), products: [item('Smash Cheddar', 1, 22.9), item('Suco Natural', 1, 9.9)] },
    { id: 144, kitchenStatus: 'DELIVERED', customerName: 'Mesa 4', tableId: 4, tableNumber: 4, waiterId: 8, waiterName: 'Lívia', orderSource: 'WAITER', createdAt: ago(26), products: [item('Clássico Americano', 1, 25.9)] },
  ];
  return list.filter(order => stage >= 0 || order.id !== 152).map(order => ({ status: 'ACTIVE', ...order }));
}

const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const OVERVIEW = {
  revenue: { value: 18460.5, previousValue: 16120.0, changePercent: 14.5 },
  orders: { value: 412, previousValue: 371, changePercent: 11.1 },
  averageTicket: { value: 44.81, previousValue: 43.45, changePercent: 3.1 },
  alerts: [],
  operation: { tablesOccupied: 6, tablesAvailable: 6, tablesTotal: 12, kitchenOrders: 5, lateOrders: 0, avgPrepMinutes: 14, openComandas: 5 },
  kitchen: { inPreparation: 3, late: 0, onTimePercent: 96 },
  revenueSeries: [1980, 2140, 2310, 2480, 3120, 3650, 2780.5].map((current, index) => ({ label: days[index], current, previous: [1820, 1900, 2050, 2200, 2760, 3100, 2290][index] })),
  salesByHour: [['11h', 14], ['12h', 38], ['13h', 46], ['14h', 22], ['15h', 9], ['16h', 7], ['17h', 12], ['18h', 31], ['19h', 58], ['20h', 72], ['21h', 61], ['22h', 42]].map(([label, value]) => ({ label, value })),
  recentOrders: [
    { id: 152, source: 'Delivery · Camila', amount: 56.7, status: 'NEW', statusLabel: 'Novo', createdAt: ago(1) },
    { id: 151, source: 'Mesa 2', amount: 72.7, status: 'NEW', statusLabel: 'Novo', createdAt: ago(3) },
    { id: 150, source: 'Comanda 4', amount: 44.8, status: 'IN_PREPARATION', statusLabel: 'Em produção', createdAt: ago(7) },
    { id: 149, source: 'Balcão · Rafael', amount: 55.8, status: 'IN_PREPARATION', statusLabel: 'Em produção', createdAt: ago(10) },
    { id: 148, source: 'Mesa 9', amount: 93.6, status: 'READY', statusLabel: 'Pronto', createdAt: ago(13) },
  ],
  products: [
    { name: 'Smash Bacon', category: 'Smash', quantity: 96, revenue: 3350.4 },
    { name: 'Clássico Weper', category: 'Clássicos', quantity: 81, revenue: 2259.9 },
    { name: 'Batata Frita', category: 'Acompanhamentos', quantity: 77, revenue: 1147.3 },
    { name: 'Smash Original', category: 'Smash', quantity: 64, revenue: 2361.6 },
    { name: 'Refrigerante Lata', category: 'Bebidas', quantity: 58, revenue: 400.2 },
  ],
  paymentMethods: [
    { method: 'PIX', label: 'Pix', value: 8307.2, percent: 45 },
    { method: 'CREDIT', label: 'Crédito', value: 5538.2, percent: 30 },
    { method: 'DEBIT', label: 'Débito', value: 2769.1, percent: 15 },
    { method: 'CASH', label: 'Dinheiro', value: 1846.0, percent: 10 },
  ],
  team: [
    { name: 'Bruno', orders: 128, sales: 5720.4 },
    { name: 'Lívia', orders: 112, sales: 4980.1 },
    { name: 'Caixa', orders: 94, sales: 4210.0 },
  ],
};

const stock = (productId, name, stockQuantity, minimumStock, trackInventory = true) => ({ productId, name, stockQuantity, minimumStock, trackInventory });
const INVENTORY = { items: [
  stock(1, 'Pão brioche', 180, 60),
  stock(2, 'Blend bovino 90 g', 42, 50),
  stock(3, 'Queijo cheddar (fatia)', 210, 80),
  stock(4, 'Bacon fatiado (porção)', 12, 30),
  stock(5, 'Batata congelada (porção)', 96, 40),
  stock(6, 'Refrigerante Lata', 0, 24),
  stock(7, 'Milkshake', 0, 0, false),
] };
const MOVEMENTS = [
  { id: 1, type: 'SALE', productName: 'Pão brioche', quantity: -2 },
  { id: 2, type: 'SALE', productName: 'Blend bovino 90 g', quantity: -4 },
  { id: 3, type: 'RESTOCK', productName: 'Queijo cheddar (fatia)', quantity: 100 },
  { id: 4, type: 'SALE', productName: 'Refrigerante Lata', quantity: -1 },
];

let kitchenStage = 0;
function respond(method, pathname) {
  if (pathname === '/dashboard/overview') return OVERVIEW;
  if (pathname === '/cash-sessions/current') return { id: 31, openedAt: ago(214), openedByName: 'Marina', openingAmount: 150 };
  if (pathname === '/tables/all') return [...TABLES, { id: 999, number: 999, capacity: 0, isAvailable: true }];
  if (pathname === '/comandas/all') return COMANDAS;
  if (pathname === '/tables/999/orders') return COUNTER_ORDERS;
  if (pathname === '/product/all') return PRODUCTS;
  if (pathname === '/category/all') return CATEGORIES;
  if (pathname === '/kitchen/orders') return kitchenOrders(kitchenStage);
  if (pathname === '/stores/me/inventory') return INVENTORY;
  if (pathname === '/stores/me/inventory/movements') return MOVEMENTS;
  if (pathname === '/stores/me/sync-status') return { cursor: 0 };
  if (pathname === '/stores/me/sync') return { events: [], cursor: 0 };
  if (pathname === '/api/auth/me') return USER;
  return [];
}

async function settle(page, ms = 1400) {
  // Cabeçalho do painel opaco: o desfoque borra o conteúdo rolado por baixo na captura.
  await page.addStyleTag({ content: '.weper-shell-header{backdrop-filter:none!important;background:#f8fafc!important}' }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

async function newPanelPage(browser, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  await context.addInitScript(user => {
    localStorage.setItem('weper.token', 'demo-token');
    localStorage.setItem('weper.user', JSON.stringify(user));
    localStorage.setItem('weper-cookie-consent', 'rejected');
    localStorage.setItem('weper.sidebar.collapsed', 'true');
  }, USER);
  const page = await context.newPage();
  const unknown = new Set();
  await page.route(url => url.port === '8081' || url.port === '8080', route => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const body = respond(request.method(), pathname);
    if (Array.isArray(body) && body.length === 0) unknown.add(`${request.method()} ${pathname}`);
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  page.on('pageerror', error => console.log('PAGEERROR', error.message.slice(0, 160)));
  page.unknown = unknown;
  return page;
}

const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`), type: 'png' }).then(() => console.log('ok', name));


// Rola até o seletor ficar logo abaixo do cabeçalho fixo do painel.
async function frame(page, selector, gap = 16, stickySel = '.app-shell__topbar, header') {
  await page.evaluate(([sel, gap, stickySel]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    let scroller = el.parentElement;
    while (scroller && scroller !== document.body) {
      const style = getComputedStyle(scroller);
      if (/(auto|scroll)/.test(style.overflowY) && scroller.scrollHeight > scroller.clientHeight) break;
      scroller = scroller.parentElement;
    }
    if (!scroller || scroller === document.body) scroller = document.scrollingElement;
    const sticky = document.querySelector(stickySel);
    const top = sticky ? sticky.getBoundingClientRect().bottom : 0;
    scroller.scrollTop += el.getBoundingClientRect().top - top - gap;
  }, [selector, gap, stickySel]);
  await page.waitForTimeout(700);
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] });
  const laptop = { width: 1280, height: 800 };
  const tablet = { width: 1240, height: 860 };

  if (want('dashboard')) {
    const page = await newPanelPage(browser, laptop);
    await page.goto(`${BASE}/app/dashboard`); await settle(page, 2200);
    await frame(page, '.overview-period-chips');
    await page.waitForTimeout(1200);
    await shot(page, 'dashboard');
    await frame(page, '.overview-charts');
    await page.waitForTimeout(1200);
    await shot(page, 'dashboard-2');
    await page.close();
  }
  if (want('atendimento')) {
    const page = await newPanelPage(browser, laptop);
    await page.goto(`${BASE}/app/atendimento`); await settle(page);
    await frame(page, '.atendimento-modes');
    await shot(page, 'mesas');
    await page.getByRole('tab', { name: 'Comandas' }).click(); await settle(page, 700);
    await frame(page, '.atendimento-modes');
    await shot(page, 'comandas');
    await page.getByRole('tab', { name: /Balcão/ }).click(); await settle(page, 1500);
    await page.getByRole('button', { name: 'Ver produtos de Smash' }).click(); await page.waitForTimeout(700);
    const add = async name => { await page.locator(`.counter-pos button[aria-label="Adicionar ${name}"]`).first().click({ timeout: 6000 }).catch(e => console.log(name, e.message.split('\n')[0])); await page.waitForTimeout(250); };
    await add('Smash Bacon'); await add('Smash Bacon');
    // Os filtros de categoria são Chips do MUI (role=button), não <button>.
    const chip = async name => { await page.locator(`.counter-pos [role="button"][aria-label^="${name}"]`).first().click({ timeout: 6000 }).catch(e => console.log(name, String(e.message).slice(0, 80))); await page.waitForTimeout(600); };
    await chip('Acompanhamentos'); await add('Batata Frita');
    await chip('Bebidas'); await add('Refrigerante Lata');
    await chip('Clássicos');
    await page.getByLabel('Nome do cliente *').first().fill('Rafael');
    await page.locator('.counter-pos').click({ position: { x: 4, y: 4 } }).catch(() => {});
    await frame(page, '.atendimento-modes');
    await page.waitForTimeout(2600);
    await shot(page, 'pdv');
    console.log('sem dados:', [...page.unknown].join(', '));
    await page.close();
  }
  if (want('cozinha')) {
    for (const stage of [-1, 0, 1]) {
      kitchenStage = stage;
      const page = await newPanelPage(browser, tablet);
      await page.goto(`${BASE}/app/cozinha`); await settle(page, 1600);
      await frame(page, '.kanban-board', 8, '.kitchen-filters-sticky');
      await shot(page, `kds-${stage + 1}`);
      await page.close();
    }
  }
  if (want('estoque')) {
    const page = await newPanelPage(browser, laptop);
    await page.goto(`${BASE}/app/estoque`); await settle(page);
    await frame(page, '.inventory-summary');
    await shot(page, 'estoque');
    await page.close();
  }
  await browser.close();
})();
