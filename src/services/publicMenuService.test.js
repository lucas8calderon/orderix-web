import { buildPublicMenuUrl } from './publicMenuService';

describe('buildPublicMenuUrl', () => {
  it('monta URL /cardapio/:slug', () => {
    expect(buildPublicMenuUrl('padaria', 'https://app.weper.com.br')).toBe(
      'https://app.weper.com.br/cardapio/padaria'
    );
  });

  it('retorna vazio sem slug', () => {
    expect(buildPublicMenuUrl('', 'https://app.weper.com.br')).toBe('');
  });
});
