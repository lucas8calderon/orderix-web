import { addCartItem, cartTotals, itemKey, lineTotal, removeCartItem, updateCartQuantity } from './deliveryCart';

describe('deliveryCart', () => {
  const burger = {
    productId: 1,
    name: 'X-Salada',
    unitPrice: 20,
    quantity: 1,
    extras: [],
    observation: '',
  };

  it('agrupa itens iguais e soma quantidade', () => {
    const cart = addCartItem(addCartItem({ items: [] }, burger), { ...burger, quantity: 2 });
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
  });

  it('não mistura observações diferentes', () => {
    const cart = addCartItem(
      addCartItem({ items: [] }, burger),
      { ...burger, observation: 'Sem cebola' }
    );
    expect(cart.items).toHaveLength(2);
    expect(itemKey(cart.items[0])).not.toBe(itemKey(cart.items[1]));
  });

  it('atualiza quantidade e remove quando chega a zero', () => {
    let cart = addCartItem({ items: [] }, burger);
    cart = updateCartQuantity(cart, itemKey(cart.items[0]), 4);
    expect(cart.items[0].quantity).toBe(4);
    cart = updateCartQuantity(cart, itemKey(cart.items[0]), 0);
    expect(cart.items).toHaveLength(0);
  });

  it('remove item e calcula totais com taxa só na entrega', () => {
    let cart = addCartItem({ items: [] }, { ...burger, quantity: 2, extras: [{ productExtraId: 9, price: 2, quantity: 1 }] });
    expect(lineTotal(cart.items[0])).toBe(44);
    expect(cartTotals(cart, { deliveryFee: 5, fulfillment: 'DELIVERY' })).toEqual({
      itemCount: 2,
      subtotal: 44,
      deliveryFee: 5,
      total: 49,
    });
    expect(cartTotals(cart, { deliveryFee: 5, fulfillment: 'PICKUP' }).deliveryFee).toBe(0);
    cart = removeCartItem(cart, itemKey(cart.items[0]));
    expect(cart.items).toHaveLength(0);
  });
});
