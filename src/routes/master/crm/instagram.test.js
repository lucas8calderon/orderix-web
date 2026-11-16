import { buildInstagramDirectUrl, buildInstagramUrl, instagramHandle, parseInstagram } from './instagram';

describe('instagram', () => {
  it('normaliza @, URL e www', () => {
    expect(instagramHandle('@Minions.Burger')).toBe('minions.burger');
    expect(buildInstagramUrl('https://www.instagram.com/CabanaBurger/?hl=pt'))
      .toBe('https://www.instagram.com/cabanaburger/');
    expect(parseInstagram('instagram.com/loja').username).toBe('loja');
  });

  it('rejeita domínio parecido e link externo', () => {
    expect(instagramHandle('https://instagr.am/loja')).toBe('');
    expect(instagramHandle('https://instagram.com.evil.com/loja')).toBe('');
    expect(instagramHandle('https://notinstagram.com/loja')).toBe('');
    expect(instagramHandle('https://instagram.com/p/ABC123')).toBe('');
    expect(buildInstagramUrl('https://evil.com/loja')).toBeNull();
  });

  it('monta o Direct sem texto', () => {
    const direct = buildInstagramDirectUrl('cabanaburger');
    expect(direct).toBe('https://ig.me/m/cabanaburger');
    expect(direct).not.toContain('?');
    expect(direct).not.toContain('text');
  });
});
