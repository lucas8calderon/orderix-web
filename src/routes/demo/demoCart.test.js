import {
  addDemoCartItem,
  clearDemoCart,
  DEMO_CART_KEY_PREFIX,
  demoCartKey,
  demoItemKey,
  readDemoCart,
  writeDemoCart,
} from './demoCart';

const DELIVERY_KEY = 'weper.delivery.cart.weper-burger';

describe('demoCart isolation', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('grava em weper_demo_cart_<slug> e não toca no carrinho de delivery', () => {
    const cart = addDemoCartItem({ items: [] }, {
      productId: 'smash-original',
      name: 'Smash Original',
      unitPrice: 36.9,
      quantity: 1,
    });

    writeDemoCart('weper-burger', cart);

    expect(demoCartKey('weper-burger')).toBe(`${DEMO_CART_KEY_PREFIX}weper-burger`);
    expect(window.localStorage.getItem('weper_demo_cart_weper-burger')).toBeTruthy();
    expect(window.localStorage.getItem(DELIVERY_KEY)).toBeNull();
    expect(readDemoCart('weper-burger').items).toHaveLength(1);
  });

  it('não lê o carrinho real de delivery', () => {
    window.localStorage.setItem(DELIVERY_KEY, JSON.stringify({
      items: [{ productId: 99, name: 'Pedido real', unitPrice: 10, quantity: 1 }],
    }));

    expect(readDemoCart('weper-burger').items).toHaveLength(0);
  });

  it('limpa só a chave de demo', () => {
    writeDemoCart('weper-burger', { items: [{ productId: 'x', name: 'X', unitPrice: 1, quantity: 1 }] });
    window.localStorage.setItem(DELIVERY_KEY, '{"items":[]}');

    clearDemoCart('weper-burger');

    expect(window.localStorage.getItem('weper_demo_cart_weper-burger')).toBeNull();
    expect(window.localStorage.getItem(DELIVERY_KEY)).toBe('{"items":[]}');
  });

  it('separa itens com extras diferentes', () => {
    const base = { productId: 'calabresa', name: 'Calabresa', unitPrice: 46.9, quantity: 1 };
    const withExtra = {
      ...base,
      extras: [{ id: 'borda-catupiry', name: 'Borda', price: 9.9, quantity: 1 }],
    };
    const cart = addDemoCartItem(addDemoCartItem({ items: [] }, base), withExtra);
    expect(cart.items).toHaveLength(2);
    expect(demoItemKey(cart.items[0])).not.toBe(demoItemKey(cart.items[1]));
  });
});
