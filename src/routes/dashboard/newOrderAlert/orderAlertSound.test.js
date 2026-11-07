import { playNewOrderBeep } from './orderAlertSound';

describe('beep de pedido novo', () => {
  it('não toca nem quebra antes do gesto que libera o áudio', () => {
    expect(playNewOrderBeep()).toBe(false);
  });
});
