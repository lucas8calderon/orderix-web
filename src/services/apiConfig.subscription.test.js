const assignMock = jest.fn();
const saveSession = jest.fn();

describe('apiConfig subscription access', () => {
  let handlers;

  beforeEach(() => {
    jest.resetModules();
    assignMock.mockClear();
    saveSession.mockClear();
    handlers = { response: null, responseError: null };

    jest.doMock('axios', () => ({
      defaults: { baseURL: '', timeout: 0 },
      interceptors: {
        request: { use() {} },
        response: {
          use(ok, err) {
            handlers.response = ok;
            handlers.responseError = err;
          },
        },
      },
    }));

    jest.doMock('./session', () => ({
      getToken: () => 'jwt',
      clearSession: jest.fn(),
      getCurrentUser: () => ({ role: 'STORE_ADMIN', subscriptionActive: true, subscriptionStatus: 'OVERDUE' }),
      saveSession,
    }));

    jest.doMock('./deliveryCustomerSession', () => ({
      getDeliveryCustomerToken: () => null,
      clearDeliveryCustomerSession: jest.fn(),
    }));

    delete window.location;
    window.location = { pathname: '/app/atendimento', assign: assignMock };
    require('./apiConfig');
  });

  test('store response publishes the grace header', () => {
    const { publishSubscriptionNotice, getSubscriptionNotice } = require('./subscriptionNotice');
    publishSubscriptionNotice('');
    const response = handlers.response({
      config: { url: '/api/order/all' },
      headers: { 'x-subscription-notice': 'A mensalidade venceu. O acesso segue durante a tolerância.' },
    });
    expect(response.headers['x-subscription-notice']).toMatch(/mensalidade/i);
    expect(getSubscriptionNotice()).toMatch(/acesso segue durante a tolerância/i);
  });

  test('day eight denial opens the subscription screen instead of a generic permission error', async () => {
    await expect(handlers.responseError({
      response: {
        status: 403,
        data: {
          message: 'Operação nova indisponível durante a suspensão da mensalidade. Consulta, regularização e pedidos já iniciados continuam.',
        },
      },
      config: { url: '/api/tables/3/orders' },
    })).rejects.toBeTruthy();

    expect(saveSession).toHaveBeenCalledWith('jwt', expect.objectContaining({
      subscriptionActive: false,
      subscriptionStatus: 'BLOCKED',
    }));
    expect(assignMock).toHaveBeenCalledWith('/subscription-blocked');
  });

  test('a permission denial without subscription wording stays on the page', async () => {
    await expect(handlers.responseError({
      response: { status: 403, data: { message: 'Acesso negado' } },
      config: { url: '/api/employees' },
    })).rejects.toBeTruthy();

    expect(saveSession).not.toHaveBeenCalled();
    expect(assignMock).not.toHaveBeenCalled();
  });
});
