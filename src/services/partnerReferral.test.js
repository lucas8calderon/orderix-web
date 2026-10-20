import {
  PARTNER_REF_COOKIE,
  PARTNER_REF_STORAGE_KEY,
  capturePartnerRef,
  clearStoredPartnerRef,
  getStoredPartnerRef,
  normalizePartnerRef,
} from './partnerReferral';

function clearCookies() {
  document.cookie.split(';').forEach((part) => {
    const name = part.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  });
}

describe('partnerReferral', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    clearCookies();
  });

  it('usa a chave weper.partnerRef', () => {
    expect(PARTNER_REF_STORAGE_KEY).toBe('weper.partnerRef');
    expect(PARTNER_REF_COOKIE).toBe('weper_partner_ref');
  });

  it('salva o ref válido em maiúsculas (session + cookie)', () => {
    expect(capturePartnerRef('?ref=abc_123')).toBe('ABC_123');
    expect(getStoredPartnerRef()).toBe('ABC_123');
    expect(document.cookie).toContain('weper_partner_ref=ABC_123');
  });

  it('ignora ref ausente, curto ou com caracteres inválidos', () => {
    expect(capturePartnerRef('')).toBeNull();
    expect(capturePartnerRef('?ref=ab')).toBeNull();
    expect(capturePartnerRef('?ref=<script>')).toBeNull();
    expect(getStoredPartnerRef()).toBeNull();
  });

  it('first-touch: não sobrescreve ref já capturado', () => {
    expect(capturePartnerRef('?ref=WPR-FIRST')).toBe('WPR-FIRST');
    expect(capturePartnerRef('?ref=WPR-SECOND')).toBe('WPR-FIRST');
    expect(getStoredPartnerRef()).toBe('WPR-FIRST');
  });

  it('recupera do cookie quando sessionStorage está vazio', () => {
    capturePartnerRef('?ref=WPR-COOKIE');
    window.sessionStorage.clear();
    expect(getStoredPartnerRef()).toBe('WPR-COOKIE');
    expect(capturePartnerRef('')).toBe('WPR-COOKIE');
  });

  it('normaliza e limpa', () => {
    expect(normalizePartnerRef('  xyz9 ')).toBe('XYZ9');
    expect(normalizePartnerRef(null)).toBeNull();
    capturePartnerRef('?ref=xyz9');
    clearStoredPartnerRef();
    expect(getStoredPartnerRef()).toBeNull();
  });
});
