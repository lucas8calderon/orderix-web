import { PARTNER_PAGE_SEO } from './partnerProgram';
import { applyPartnerDocumentMeta } from './partnerSeo';

describe('SEO da página de parceiros', () => {
  it('aplica e restaura título, descrição, Open Graph e canonical', () => {
    document.head.innerHTML = '<meta name="description" content="Descrição original">';
    document.title = 'Weper';

    const restore = applyPartnerDocumentMeta();

    expect(document.title).toBe(PARTNER_PAGE_SEO.title);
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe(PARTNER_PAGE_SEO.description);
    expect(document.querySelector('meta[property="og:title"]').getAttribute('content')).toBe(PARTNER_PAGE_SEO.title);
    expect(document.querySelector('meta[property="og:description"]').getAttribute('content')).toBe(PARTNER_PAGE_SEO.description);
    expect(document.querySelector('meta[property="og:url"]').getAttribute('content')).toBe(PARTNER_PAGE_SEO.canonical);
    expect(document.querySelector('link[rel="canonical"]').getAttribute('href')).toBe('https://www.weper.com.br/parceiros');

    restore();

    expect(document.title).toBe('Weper');
    expect(document.querySelector('meta[name="description"]').getAttribute('content')).toBe('Descrição original');
    expect(document.querySelector('meta[property="og:title"]')).toBeNull();
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });
});
