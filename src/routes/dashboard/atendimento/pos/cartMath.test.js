import {
  addLine,
  cartTotals,
  changeLineQuantity,
  lineSignature,
  lineTotal,
} from './cartMath';

const burger = {
  id: 1,
  name: 'X-Burger',
  value: 10,
  extras: [{ productExtraId: 3, name: 'Bacon', price: 2 }],
  mandatoryGroups: [],
  variations: [],
};

function plain(quantity = 1, observation = '') {
  return {
    product: burger,
    quantity,
    selections: {},
    extraIds: [],
    observation,
  };
}

describe('carrinho do balcão', () => {
  it('soma o item e mantém personalizações diferentes separadas', () => {
    const once = addLine([], plain());
    const twice = addLine(once, plain());
    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(2);

    const noted = addLine(twice, plain(1, 'sem cebola'));
    expect(noted).toHaveLength(2);
    expect(lineSignature(noted[0])).not.toBe(lineSignature(noted[1]));
  });

  it('remove ao zerar a quantidade e calcula o total com adicional', () => {
    const withExtra = addLine([], { ...plain(2), extraIds: [3] });
    expect(lineTotal(withExtra[0])).toBe(24);
    expect(cartTotals(withExtra).itemCount).toBe(2);
    expect(changeLineQuantity(withExtra, withExtra[0].key, -2)).toEqual([]);
  });
});
