import { canChoosePaymentTestEnvironment } from './paymentTestEnvironment';
import { getCurrentUser } from './authService';

jest.mock('./authService', () => ({ getCurrentUser: jest.fn() }));

describe('canChoosePaymentTestEnvironment', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  function setHost(hostname) {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { hostname },
    });
  }

  it('libera para MASTER', () => {
    getCurrentUser.mockReturnValue({ role: 'MASTER' });
    setHost('www.weper.com.br');
    expect(canChoosePaymentTestEnvironment()).toBe(true);
  });

  it('libera no staging mesmo para loja', () => {
    getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
    setHost('weper-staging-web.onrender.com');
    expect(canChoosePaymentTestEnvironment()).toBe(true);
  });

  it('bloqueia loja em produção', () => {
    getCurrentUser.mockReturnValue({ role: 'STORE_ADMIN' });
    setHost('www.weper.com.br');
    expect(canChoosePaymentTestEnvironment()).toBe(false);
  });
});
