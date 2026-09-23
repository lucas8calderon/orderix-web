import {
  addDemoCartItem,
  clearDemoCart,
  demoCartTotals,
} from './demoCart';
import { findDemoProduct, getDemoStore, listDemoStores } from './demoStores';

export const DEMO_ORDER_NUMBER = 1042;

export const DEMO_PAYMENT_OPTIONS = [
  { id: 'PIX', label: 'PIX' },
  { id: 'CREDIT', label: 'Cartão de crédito' },
  { id: 'DEBIT', label: 'Cartão de débito' },
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'ON_DELIVERY', label: 'Na entrega' },
];

export function listDemoCatalogs() {
  return listDemoStores();
}

export function getDemoCatalog(slug) {
  return getDemoStore(slug);
}

export function isDemoProductAvailable(product) {
  return Boolean(product && product.available !== false);
}

export function filterDemoCategories(store, query) {
  const term = String(query || '').trim().toLowerCase();
  return (store?.categories || [])
    .map((category) => ({
      ...category,
      products: (category.products || []).filter((product) => {
        if (!term) return true;
        return `${product.name} ${product.description || ''}`.toLowerCase().includes(term);
      }),
    }))
    .filter((category) => category.products.length > 0);
}

export function addAvailableProductToCart(store, cart, draft) {
  const product = findDemoProduct(store, draft?.productId);
  if (!isDemoProductAvailable(product)) {
    return { ok: false, reason: 'unavailable', cart };
  }
  return { ok: true, cart: addDemoCartItem(cart, draft) };
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildDemoEstimateWindow(minutes) {
  const from = new Date();
  const to = new Date(from.getTime() + Math.max(Number(minutes) || 25, 5) * 60 * 1000);
  return {
    estimatedReadyFrom: from.toISOString(),
    estimatedReadyTo: to.toISOString(),
  };
}

/**
 * Pedido 100% local. Não importa axios e não chama /api/orders.
 * Retorna shape compatível com o layout de DeliveryTracking.
 */
export async function simulateDemoOrder({ slug, cart, checkout }, { delayMs = 800 } = {}) {
  const store = getDemoStore(slug);
  if (!store) {
    throw new Error('Estabelecimento de demonstração não encontrado.');
  }
  if (!cart?.items?.length) {
    throw new Error('Carrinho vazio.');
  }

  if (delayMs > 0) {
    await wait(delayMs);
  }

  const fulfillment = checkout?.fulfillment || 'PICKUP';
  const totals = demoCartTotals(cart, {
    deliveryFee: store.settings?.deliveryFee,
    fulfillment,
  });

  clearDemoCart(slug);

  const createdAt = new Date();
  const preparingAt = new Date(createdAt.getTime() + 2 * 60 * 1000);
  const estimate = buildDemoEstimateWindow(store.settings?.estimatedMinutes);

  return {
    id: DEMO_ORDER_NUMBER,
    orderNumber: DEMO_ORDER_NUMBER,
    displayId: `#${DEMO_ORDER_NUMBER}`,
    createdAt: createdAt.toISOString(),
    slug,
    storeSlug: slug,
    storeName: store.name,
    storeAddress: store.address || '',
    fulfillment,
    paymentMethod: checkout?.paymentMethod || 'PIX',
    onlinePayment: false,
    trackingStatus: 'IN_PREPARATION',
    statusHistory: [
      { status: 'RECEIVED', at: createdAt.toISOString() },
      { status: 'IN_PREPARATION', at: preparingAt.toISOString() },
    ],
    ...estimate,
    items: (cart.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      observation: item.observation || '',
    })),
    total: totals.total,
    totals,
    // Endereço fictício de entrega (checkout demo não coleta rua do cliente).
    street: fulfillment === 'DELIVERY' ? 'Av. Demonstração' : undefined,
    number: fulfillment === 'DELIVERY' ? '42' : undefined,
    neighborhood: fulfillment === 'DELIVERY' ? 'Centro' : undefined,
  };
}

export function resetDemoExperience(slug) {
  clearDemoCart(slug);
}
