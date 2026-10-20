import {
  PARTNER_REF_STORAGE_KEY,
  capturePartnerRef,
  clearStoredPartnerRef,
  getStoredPartnerRef,
  normalizePartnerRef,
} from './partnerReferral';

describe('partnerReferral', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('usa a chave weper.partnerRef', () => {
    expect(PARTNER_REF_STORAGE_KEY).toBe('weper.partnerRef');
  });

  it('salva o ref válido em maiúsculas', () => {
    expect(capturePartnerRef('?ref=abc_123')).toBe('ABC_123');
    expect(getStoredPartnerRef()).toBe('ABC_123');
  });

  it('ignora ref ausente, curto ou com caracteres inválidos', () => {
    expect(capturePartnerRef('')).toBeNull();
    expect(capturePartnerRef('?ref=ab')).toBeNull();
    expect(capturePartnerRef('?ref=<script>')).toBeNull();
    expect(getStoredPartnerRef()).toBeNull();
  });

  it('normaliza e limpa', () => {
    expect(normalizePartnerRef('  xyz9 ')).toBe('XYZ9');
    expect(normalizePartnerRef(null)).toBeNull();
    capturePartnerRef('?ref=xyz9');
    clearStoredPartnerRef();
    expect(getStoredPartnerRef()).toBeNull();
  });
});
