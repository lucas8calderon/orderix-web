import axios from 'axios';
import { getCurrentUser, getToken } from './session';
import {
  buildPartnerSessionUser,
  createPartnerReferral,
  formatWhatsappDisplay,
  getApiErrorMessage,
  isValidPartnerPassword,
  loginPartner,
  toWhatsappPayload,
} from './partnerService';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    defaults: {},
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
  },
}));

const SESSION = {
  token: 'jwt-token',
  tokenType: 'Bearer',
  expiresIn: 3600,
  partnerId: 7,
  userId: 70,
  firstName: 'Ana',
  lastName: 'Silva',
  whatsapp: '+5511999998888',
  referralCode: 'ANA123',
  status: 'ACTIVE',
  phoneVerified: false,
  role: 'PARTNER',
};

describe('partnerService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('valida a senha com a regra do backend', () => {
    expect(isValidPartnerPassword('abc12345')).toBe(true);
    expect(isValidPartnerPassword('abcdefgh')).toBe(false);
    expect(isValidPartnerPassword('12345678')).toBe(false);
    expect(isValidPartnerPassword('a1')).toBe(false);
    expect(isValidPartnerPassword(`a1${'x'.repeat(80)}`)).toBe(false);
  });

  it('formata e normaliza WhatsApp', () => {
    expect(formatWhatsappDisplay('+5511999998888')).toBe('(11) 99999-8888');
    expect(formatWhatsappDisplay('1133334444')).toBe('(11) 3333-4444');
    expect(toWhatsappPayload('(11) 99999-8888')).toBe('11999998888');
  });

  it('prefere a mensagem da API nos erros', () => {
    expect(getApiErrorMessage({ response: { data: { message: ' Ops ' } } }, 'x')).toBe('Ops');
    expect(getApiErrorMessage({}, 'padrão')).toBe('padrão');
  });

  it('monta o usuário de sessão com role PARTNER', () => {
    const user = buildPartnerSessionUser(SESSION);
    expect(user).toMatchObject({
      role: 'PARTNER',
      partnerId: 7,
      name: 'Ana Silva',
      referralCode: 'ANA123',
      whatsapp: '+5511999998888',
    });
  });

  it('login grava weper.token e weper.user', async () => {
    axios.post.mockResolvedValue({ data: SESSION });
    const user = await loginPartner('(11) 99999-8888', 'abc12345');
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/public/partner/auth/login'),
      { whatsapp: '11999998888', password: 'abc12345' },
    );
    expect(user.role).toBe('PARTNER');
    expect(getToken()).toBe('jwt-token');
    expect(getCurrentUser()).toMatchObject({ role: 'PARTNER', partnerId: 7 });
  });

  it('recusa sessão que não seja de parceiro', async () => {
    axios.post.mockResolvedValue({ data: { ...SESSION, role: 'ADMIN' } });
    await expect(loginPartner('11999998888', 'abc12345')).rejects.toThrow();
    expect(getToken()).toBeNull();
  });

  it('envia a indicação com dígitos e consentimento', async () => {
    axios.post.mockResolvedValue({ data: { id: 1 } });
    await createPartnerReferral({
      establishmentName: ' Bar do Zé ',
      contactName: '',
      commercialWhatsapp: '(11) 98888-7777',
      segment: 'Bar / Café',
      notes: '',
      consentToProcessData: true,
    });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/partner/referrals'),
      expect.objectContaining({
        establishmentName: 'Bar do Zé',
        commercialWhatsapp: '11988887777',
        consentToProcessData: true,
        contactName: undefined,
      }),
    );
  });
});
