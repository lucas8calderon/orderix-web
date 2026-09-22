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

/**
 * Pedido 100% local. Não importa axios e não chama /api/orders.
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

  const totals = demoCartTotals(cart, {
    deliveryFee: store.settings?.deliveryFee,
    fulfillment: checkout?.fulfillment || 'PICKUP',
  });

  clearDemoCart(slug);

  return {
    orderNumber: DEMO_ORDER_NUMBER,
    displayId: `#${DEMO_ORDER_NUMBER}`,
    createdAt: new Date().toISOString(),
    slug,
    storeName: store.name,
    fulfillment: checkout?.fulfillment || 'PICKUP',
    paymentMethod: checkout?.paymentMethod || 'PIX',
    items: cart.items,
    totals,
    steps: [
      { id: 'received', label: 'Pedido recebido', done: true },
      { id: 'preparing', label: 'Em preparo', done: true },
      {
        id: 'ready',
        label: checkout?.fulfillment === 'DELIVERY' ? 'Saiu para entrega' : 'Pronto para retirar',
        done: false,
      },
    ],
  };
}

export function resetDemoExperience(slug) {
  clearDemoCart(slug);
}
