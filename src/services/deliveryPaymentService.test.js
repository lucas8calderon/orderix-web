import { isInfinitePayCheckoutUrl, readInfinitePayReturn } from './deliveryPaymentService';

describe('checkout InfinitePay', () => {
  it('só aceita o host do checkout InfinitePay', () => {
    expect(isInfinitePayCheckoutUrl('https://checkout.infinitepay.io/loja/abc')).toBe(true);
    expect(isInfinitePayCheckoutUrl('https://evil.example/checkout.infinitepay.io')).toBe(false);
    expect(isInfinitePayCheckoutUrl('javascript:alert(1)')).toBe(false);
  });

  it('lê o retorno sem tratar a volta como pagamento aprovado', () => {
    const parsed = readInfinitePayReturn('?order_nsu=W1O2P3&slug=abc&transaction_nsu=tx&capture_method=pix');
    expect(parsed).toEqual({
      orderNsu: 'W1O2P3',
      slug: 'abc',
      transactionNsu: 'tx',
      captureMethod: 'pix',
    });
    expect(parsed.paid).toBeUndefined();
    expect(readInfinitePayReturn('')).toBeNull();
  });
});