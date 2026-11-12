// Captura o delivery real (/delivery/:slug) em tamanho de celular, com a API pública
// interceptada e o catálogo fictício da Weper Burger. Nenhum pedido é criado.
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '../../../orderix-visual/node_modules/playwright');
const fs = require('fs');
const OUT = path.join(__dirname, '.shots');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.WEPER_WEB_BASE_URL || 'http://localhost:3000';
const img = f => `${BASE}/images/demo/burger/${f}`;
const p = (id, name, value, file, description, extra = {}) => ({ id, name, value, image: img(file), description, isAvailable: true, extras: [], ...extra });
const day = weekday => ({ weekday, enabled: true, intervals: [{ open: '11:00', close: '23:30' }] });
const CATALOG = {
  storeName: 'Weper Burger', storeAddress: 'Rua das Grelhas, 120 - Vila Weper', phone: '11900000000',
  logoUrl: img('logo.jpg'), coverUrl: img('cover.jpg'),
  open: true, acceptingOrders: true, estimatedMinutes: 45, estimatedMinMinutes: 30, estimatedMaxMinutes: 45,
  schedule: [1, 2, 3, 4, 5, 6, 7].map(day), deliveryFee: 6, minOrder: 0,
  categories: [
    { id: 1, name: 'Smash', products: [
      p(1, 'Smash Cheddar', 22.9, 'smash-cheddar.jpg', 'Pão brioche, carne smash, cheddar e molho da casa.'),
      p(2, 'Smash Bacon', 34.9, 'smash-bacon.jpg', 'Pão brioche, carne smash, cheddar, bacon crocante e molho da casa.', { mostOrdered: true, extras: [{ id: 1, name: 'Cheddar extra', price: 3.5 }, { id: 2, name: 'Bacon extra', price: 4.5 }] }),
      p(3, 'Smash Original', 36.9, 'smash-original.jpg', 'Duas carnes smash, queijo, alface, tomate e molho da casa.'),
    ] },
    { id: 2, name: 'Clássicos', products: [
      p(4, 'Clássico Cheddar', 24.9, 'classico-cheddar.jpg', 'Blend 150 g, cheddar e cebola caramelizada.'),
      p(6, 'Clássico Weper', 27.9, 'classico-weper.jpg', 'Blend 150 g, queijo, alface, tomate e molho Weper.'),
    ] },
    { id: 3, name: 'Acompanhamentos', products: [
      p(9, 'Batata Frita', 14.9, 'batatas.jpg', 'Porção individual, sequinha e crocante.'),
      p(10, 'Onion Rings', 16.9, 'onion-rings.jpg', 'Anéis de cebola empanados.'),
    ] },
    { id: 4, name: 'Bebidas', products: [
      p(12, 'Refrigerante Lata', 6.9, 'refrigerante-lata.jpg', '350 ml, bem gelado.'),
      p(14, 'Milkshake', 17.9, 'milkshake.jpg', 'Chocolate, morango ou baunilha.'),
    ] },
  ],
};
const today = new Date().toISOString().slice(0, 10);
const at = hhmm => `${today}T${hhmm}:00`;
const ORDER = {
  id: 152, storeName: 'Weper Burger', storeAddress: 'Rua das Grelhas, 120 - Vila Weper', storePhone: '11900000000',
  fulfillment: 'DELIVERY', paymentMethod: 'PIX', total: 62.7, deliveryFee: 6, trackingStatus: 'IN_PREPARATION',
  estimatedReadyFrom: at('20:10'), estimatedReadyTo: at('20:25'),
  statusHistory: [{ status: 'RECEIVED', at: at('19:42') }, { status: 'IN_PREPARATION', at: at('19:45') }],
  items: [{ productId: 2, name: 'Smash Bacon', quantity: 1, unitPrice: 34.9 }, { productId: 9, name: 'Batata Frita', quantity: 1, unitPrice: 14.9 }, { productId: 12, name: 'Refrigerante Lata', quantity: 1, unitPrice: 6.9 }],
};
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', isMobile: true, hasTouch: true });
  await context.addInitScript(() => localStorage.setItem('weper-cookie-consent', 'rejected'));
  const page = await context.newPage();
  const unknown = new Set();
  await page.route(url => url.port === '8081' || url.port === '8080', route => {
    const { pathname } = new URL(route.request().url());
    let body = [];
    if (pathname === '/api/public/delivery/weper-burger') body = CATALOG;
    else if (pathname.startsWith('/api/public/delivery/orders/')) body = pathname.endsWith('/payment') ? {} : ORDER;
    else unknown.add(route.request().method() + ' ' + pathname);
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  page.on('pageerror', e => console.log('PAGEERROR', e.message.slice(0, 160)));
  const shot = async name => { await page.waitForTimeout(900); await page.screenshot({ path: path.join(OUT, `${name}.png`) }); console.log('ok', name); };
  const step = async (label, fn) => { try { await fn(); } catch (e) { console.log('FALHOU', label, e.message.split('\n')[0]); } };
  await page.goto(`${BASE}/delivery/weper-burger`);
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(2500);
  await shot('phone-menu');
  await step('abrir produto', () => page.getByRole('button', { name: /adicionar smash bacon/i }).first().click({ timeout: 6000 }));
  await shot('phone-produto');
  await step('adicionar', () => page.getByRole('button', { name: /adicionar ao carrinho/i }).click({ timeout: 6000 }));
  await step('batata', async () => { await page.getByRole('button', { name: /adicionar batata frita/i }).first().click({ timeout: 6000 }); await page.getByRole('button', { name: /adicionar ao carrinho/i }).click({ timeout: 3000 }).catch(() => {}); });
  await step('refri', async () => { await page.getByRole('button', { name: /adicionar refrigerante lata/i }).first().click({ timeout: 6000 }); await page.getByRole('button', { name: /adicionar ao carrinho/i }).click({ timeout: 3000 }).catch(() => {}); });
  await page.waitForTimeout(4500);
  await step('abrir carrinho', () => page.getByRole('button', { name: /ver meu pedido/i }).click({ timeout: 6000 }));
  await shot('phone-carrinho');
  await page.goto(`${BASE}/delivery/pedido/demo-weper-burger`);
  await page.waitForTimeout(2500);
  await shot('phone-pedido');
  ORDER.trackingStatus = 'RECEIVED'; ORDER.statusHistory = ORDER.statusHistory.slice(0, 1);
  await page.goto(`${BASE}/delivery/pedido/demo-weper-burger`);
  await page.waitForTimeout(2500);
  await shot('phone-pedido-recebido');
  console.log('sem dados:', [...unknown].join(', '));
  await browser.close();
})();
