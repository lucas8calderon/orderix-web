import {
  PARTNER_REF_COOKIE,
  PARTNER_REF_STORAGE_KEY,
  buildPublicReferralLink,
  capturePartnerRef,
  clearStoredPartnerRef,
  getStoredPartnerRef,
  normalizePartnerRef,
  withPartnerRef,
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

  it('monta link de indicação no origin do ambiente (staging ou prod)', () => {
    expect(buildPublicReferralLink('WPR-BK9ASD', 'https://weper-staging-web.onrender.com')).toBe(
      'https://weper-staging-web.onrender.com/?ref=WPR-BK9ASD',
    );
    expect(buildPublicReferralLink('wpr-bk9asd', 'https://www.weper.com.br/')).toBe(
      'https://www.weper.com.br/?ref=WPR-BK9ASD',
    );
    expect(buildPublicReferralLink('ab', 'https://weper-staging-web.onrender.com')).toBe('');
    expect(buildPublicReferralLink('WPR-BK9ASD', '')).toBe('');
    expect(buildPublicReferralLink('K7M4NP', 'https://weper-staging-web.onrender.com')).toBe(
      'https://weper-staging-web.onrender.com/?ref=K7M4NP',
    );
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

  it('ref da URL desta visita substitui código já gravado', () => {
    expect(capturePartnerRef('?ref=3Z2D853K')).toBe('3Z2D853K');
    expect(capturePartnerRef('?ref=E3FUVE')).toBe('E3FUVE');
    expect(getStoredPartnerRef()).toBe('E3FUVE');
    expect(document.cookie).toContain('weper_partner_ref=E3FUVE');
  });

  it('sem ref na URL, mantém o código já gravado', () => {
    expect(capturePartnerRef('?ref=E3FUVE')).toBe('E3FUVE');
    expect(capturePartnerRef('?plan=PLAN_05&lead=06c21c5b-1544-4b93-a78c-9da9cd81e7c3')).toBe('E3FUVE');
    expect(getStoredPartnerRef()).toBe('E3FUVE');
  });

  it('withPartnerRef leva o ref da visita e preserva plan e lead', () => {
    window.sessionStorage.setItem(PARTNER_REF_STORAGE_KEY, '3Z2D853K');
    const params = new URLSearchParams({
      plan: 'PLAN_05',
      lead: '06c21c5b-1544-4b93-a78c-9da9cd81e7c3',
    });
    withPartnerRef(params, '?ref=E3FUVE');
    expect(params.get('plan')).toBe('PLAN_05');
    expect(params.get('lead')).toBe('06c21c5b-1544-4b93-a78c-9da9cd81e7c3');
    expect(params.get('ref')).toBe('E3FUVE');
  });

  it('withPartnerRef sem ref na URL usa o gravado e, sem nenhum, não inventa código', () => {
    const empty = new URLSearchParams({ plan: 'PLAN_05', lead: 'abc' });
    withPartnerRef(empty, '');
    expect(empty.get('ref')).toBeNull();
    expect(empty.get('lead')).toBe('abc');
    capturePartnerRef('?ref=E3FUVE');
    const params = new URLSearchParams({ plan: 'PLAN_05', lead: 'abc' });
    withPartnerRef(params, '?plan=PLAN_05');
    expect(params.get('ref')).toBe('E3FUVE');
    expect(params.get('lead')).toBe('abc');
  });

  it('recupera do cookie quando sessionStorage está vazio', () => {
    capturePartnerRef('?ref=WPR-COOKIE');
    window.sessionStorage.clear();
    expect(getStoredPartnerRef()).toBe('WPR-COOKIE');
    expect(capturePartnerRef('')).toBe('WPR-COOKIE');
  });

  it('normaliza e limpa', () => {
    expect(normalizePartnerRef('  xyz9 ')).toBe('XYZ9');
    expect(normalizePartnerRef('k7m 4np')).toBe('K7M4NP');
    expect(normalizePartnerRef(null)).toBeNull();
    capturePartnerRef('?ref=xyz9');
    clearStoredPartnerRef();
    expect(getStoredPartnerRef()).toBeNull();
  });
});
