/**
 * A página do motoboy não carrega o JWT da loja nem manda o celular para o login.
 */

const assignMock = jest.fn();

describe('apiConfig rota pública', () => {
  let handlers;

  beforeEach(() => {
    jest.resetModules();
    assignMock.mockClear();
    handlers = { request: null, responseError: null };

    jest.doMock('axios', () => ({
      defaults: { baseURL: '', timeout: 0 },
      interceptors: {
        request: { use(fn) { handlers.request = fn; } },
        response: { use(_ok, err) { handlers.responseError = err; } },
      },
    }));

    jest.doMock('./session', () => ({
      getToken: () => 'jwt-da-loja',
      clearSession: jest.fn(),
      getCurrentUser: () => null,
      saveSession: jest.fn(),
    }));

    jest.doMock('./deliveryCustomerSession', () => ({
      getDeliveryCustomerToken: () => 'jwt-do-cliente',
      clearDeliveryCustomerSession: jest.fn(),
    }));

    delete window.location;
    window.location = { pathname: '/rotas/abc', assign: assignMock };
    require('./apiConfig');
  });

  test('não anexa o JWT da loja na API pública da rota', () => {
    const next = handlers.request({
      url: '/api/public/routes/abc',
      headers: { Authorization: 'Bearer jwt-da-loja' },
    });
    expect(next.headers.Authorization).toBeUndefined();
  });

  test('401 na página do motoboy não navega para o login', async () => {
    await expect(handlers.responseError({
      response: { status: 401 },
      config: { url: '/api/public/routes/abc' },
    })).rejects.toBeTruthy();
    expect(assignMock).not.toHaveBeenCalled();
  });
});