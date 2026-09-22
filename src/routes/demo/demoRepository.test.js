import axios from 'axios';
import {
  addAvailableProductToCart,
  filterDemoCategories,
  isDemoProductAvailable,
  simulateDemoOrder,
} from './demoRepository';
import { clearDemoCart, writeDemoCart } from './demoCart';
import { getDemoStore } from './demoStores';

describe('demoRepository isolation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  it('não permite adicionar produto indisponível', () => {
    const store = getDemoStore('weper-burger');
    const veggie = store.categories
      .flatMap((category) => category.products)
      .find((product) => product.id === 'veggie');

    expect(isDemoProductAvailable(veggie)).toBe(false);

    const result = addAvailableProductToCart(store, { items: [] }, {
      productId: 'veggie',
      name: veggie.name,
      unitPrice: veggie.price,
      quantity: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('unavailable');
    expect(result.cart.items).toHaveLength(0);
  });

  it('permite adicionar produto disponível', () => {
    const store = getDemoStore('weper-burger');
    const result = addAvailableProductToCart(store, { items: [] }, {
      productId: 'smash-original',
      name: 'Smash Original',
      unitPrice: 36.9,
      quantity: 1,
    });
    expect(result.ok).toBe(true);
    expect(result.cart.items).toHaveLength(1);
  });

  it('filtra categorias pela busca de nome e descrição', () => {
    const store = getDemoStore('weper-pizza');
    const calabresa = filterDemoCategories(store, 'calabresa');
    expect(calabresa).toHaveLength(1);
    expect(calabresa[0].products.map((product) => product.id)).toEqual(['calabresa']);

    const empty = filterDemoCategories(store, 'hambúrguer');
    expect(empty).toHaveLength(0);

    const byDescription = filterDemoCategories(store, 'manjericão');
    expect(byDescription[0].products[0].id).toBe('margherita');
  });

  it('simulateDemoOrder não chama axios nem API de pedidos', async () => {
    writeDemoCart('weper-burger', { items: [] });
    const order = await simulateDemoOrder({
      slug: 'weper-burger',
      cart: {
        items: [{
          productId: 'smash-original',
          name: 'Smash Original',
          unitPrice: 36.9,
          quantity: 1,
        }],
      },
      checkout: { fulfillment: 'PICKUP', paymentMethod: 'PIX' },
    }, { delayMs: 0 });

    expect(order.displayId).toBe('#1042');
    expect(order.storeName).toBe('Weper Burger');
    expect(axios.post).not.toHaveBeenCalled();
    expect(axios.get).not.toHaveBeenCalled();
    expect(axios.post.mock.calls.find((call) => String(call[0]).includes('/api/orders'))).toBeUndefined();
    expect(window.localStorage.getItem('weper_demo_cart_weper-burger')).toBeNull();
  });

  it('limpa o carrinho de demo após simular', async () => {
    writeDemoCart('weper-pizza', {
      items: [{ productId: 'margherita', name: 'Margherita', unitPrice: 42.9, quantity: 1 }],
    });
    await simulateDemoOrder({
      slug: 'weper-pizza',
      cart: {
        items: [{ productId: 'margherita', name: 'Margherita', unitPrice: 42.9, quantity: 1 }],
      },
      checkout: { fulfillment: 'DELIVERY', paymentMethod: 'CREDIT' },
    }, { delayMs: 0 });
    expect(window.localStorage.getItem('weper_demo_cart_weper-pizza')).toBeNull();
    clearDemoCart('weper-pizza');
  });
});
