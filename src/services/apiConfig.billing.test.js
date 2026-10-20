/**
 * Contratação pública: não anexa JWT e 401 na página /contratar não manda para /login.
 */

const assignMock = jest.fn();

describe('apiConfig billing public flow', () => {
  let axios;
  let handlers;

  beforeEach(() => {
    jest.resetModules();
    assignMock.mockClear();
    handlers = { request: null, responseError: null };

    jest.doMock('axios', () => ({
      defaults: { baseURL: '', timeout: 0 },
      interceptors: {
        request: {
          use(fn) {
            handlers.request = fn;
          },
        },
        response: {
          use(_ok, err) {
            handlers.responseError = err;
          },
        },
      },
    }));

    jest.doMock('./session', () => ({
      getToken: () => 'stale-jwt',
      clearSession: jest.fn(),
      getCurrentUser: () => null,
      saveSession: jest.fn(),
    }));

    jest.doMock('./deliveryCustomerSession', () => ({
      getDeliveryCustomerToken: () => null,
      clearDeliveryCustomerSession: jest.fn(),
    }));

    delete window.location;
    window.location = { pathname: '/contratar', assign: assignMock };

    axios = require('axios');
    require('./apiConfig');
  });

  test('public billing request strips Authorization', () => {
    const next = handlers.request({
      url: '/api/public/billing/signup',
      headers: { Authorization: 'Bearer stale-jwt' },
    });
    expect(next.headers.Authorization).toBeUndefined();
  });

  test('401 while on /contratar does not navigate to login', async () => {
    await expect(
      handlers.responseError({
        response: { status: 401 },
        config: { url: '/api/stores/me' },
      }),
    ).rejects.toBeTruthy();
    expect(assignMock).not.toHaveBeenCalled();
  });

  test('401 on public billing API does not navigate to login', async () => {
    await expect(
      handlers.responseError({
        response: { status: 401 },
        config: { url: '/api/public/billing/signup' },
      }),
    ).rejects.toBeTruthy();
    expect(assignMock).not.toHaveBeenCalled();
  });
});
