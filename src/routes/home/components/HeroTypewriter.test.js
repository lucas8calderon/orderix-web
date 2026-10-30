import { act, render, screen } from '@testing-library/react';
import HeroTypewriter, {
  HERO_BRAND_PHRASE,
  HERO_FEATURE_PHRASES,
  HERO_TYPE,
  buildHeroCycle,
} from './HeroTypewriter';

test('a rotação inclui garçom, cardápio e comandas', () => {
  expect(HERO_FEATURE_PHRASES).toEqual(expect.arrayContaining([
    'de um app do garçom?',
    'de um cardápio digital?',
    'de comandas e mesas?',
  ]));
});

test('cada ciclo passa por todas as funcionalidades e volta para a Weper', () => {
  const cycle = buildHeroCycle(() => 0.5);
  expect(cycle).toHaveLength(HERO_FEATURE_PHRASES.length * 2);
  HERO_FEATURE_PHRASES.forEach((phrase) => {
    const index = cycle.indexOf(phrase);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(cycle[index + 1]).toBe(HERO_BRAND_PHRASE);
  });
});

test('o ciclo seguinte não começa repetindo a última funcionalidade', () => {
  const cycle = buildHeroCycle(() => 0.999, HERO_FEATURE_PHRASES[0]);
  expect(cycle[0]).toBe(HERO_FEATURE_PHRASES[1]);
  expect(cycle[cycle.length - 2]).toBe(HERO_FEATURE_PHRASES[0]);
});

test('a home abre na marca e depois digita uma funcionalidade', () => {
  jest.useFakeTimers();
  try {
    render(<HeroTypewriter />);
    expect(screen.getByRole('heading', { level: 1, name: 'Seu estabelecimento precisa da Weper.' })).toBeInTheDocument();

    const longest = Math.max(...HERO_FEATURE_PHRASES.map((phrase) => phrase.length));
    act(() => {
      jest.advanceTimersByTime(
        HERO_TYPE.holdBrand
        + (HERO_TYPE.delete * HERO_BRAND_PHRASE.length)
        + HERO_TYPE.gap
        + (HERO_TYPE.type * longest)
        + HERO_TYPE.gap,
      );
    });

    expect(HERO_FEATURE_PHRASES).toContain(screen.getByTestId('hero-typed').textContent);
  } finally {
    jest.useRealTimers();
  }
});

test('com movimento reduzido o título fica parado na Weper', () => {
  const original = window.matchMedia;
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  jest.useFakeTimers();
  try {
    render(<HeroTypewriter />);
    act(() => { jest.advanceTimersByTime(8000); });
    expect(screen.getByTestId('hero-typed')).toHaveTextContent(HERO_BRAND_PHRASE);
    expect(document.querySelector('.wp-hero-caret')).not.toBeInTheDocument();
  } finally {
    jest.useRealTimers();
    window.matchMedia = original;
  }
});
