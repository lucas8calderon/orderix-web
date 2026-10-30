import { useEffect, useState } from 'react';

export const HERO_LEAD = 'Seu estabelecimento precisa';
export const HERO_BRAND_PHRASE = 'da Weper.';

/** Uma frase por funcionalidade publicada na home. O ciclo sempre volta para a marca. */
export const HERO_FEATURE_PHRASES = [
  'de um app de pedidos?',
  'de um app do garçom?',
  'de um cardápio digital?',
  'de comandas e mesas?',
  'de um autoatendimento?',
  'de um painel da cozinha?',
  'de um delivery sem comissão?',
  'de um controle de estoque?',
];

export const HERO_TYPE = {
  holdBrand: 1400,
  holdFeature: 1800,
  delete: 26,
  type: 48,
  gap: 180,
};

export function shufflePhrases(phrases, random) {
  const copy = [...phrases];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

/** Funcionalidade, marca, funcionalidade, marca. A primeira não repete a frase anterior. */
export function buildHeroCycle(random = Math.random, previousFeature = '') {
  const features = shufflePhrases(HERO_FEATURE_PHRASES, random);
  if (features.length > 1 && features[0] === previousFeature) {
    features.push(features.shift());
  }
  return features.flatMap((phrase) => [phrase, HERO_BRAND_PHRASE]);
}

function prefersReducedMotion() {
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function HeroTypewriter() {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [text, setText] = useState(HERO_BRAND_PHRASE);
  const [tone, setTone] = useState('brand');
  const [announced, setAnnounced] = useState(HERO_BRAND_PHRASE);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (reduced) {
      setText(HERO_BRAND_PHRASE);
      setTone('brand');
      setAnnounced(HERO_BRAND_PHRASE);
      return undefined;
    }

    let cancelled = false;
    let timer = 0;
    let queue = buildHeroCycle();
    let cursor = 0;
    let full = HERO_BRAND_PHRASE;
    let index = full.length;
    let mode = 'delete';

    const wait = (ms, fn) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const step = () => {
      if (mode === 'delete') {
        if (index > 0) {
          index -= 1;
          setText(full.slice(0, index));
          wait(HERO_TYPE.delete, step);
          return;
        }
        full = queue[cursor];
        cursor += 1;
        if (cursor >= queue.length) {
          const previousFeature = queue[queue.length - 2];
          queue = buildHeroCycle(Math.random, previousFeature);
          cursor = 0;
        }
        setTone(full === HERO_BRAND_PHRASE ? 'brand' : 'feature');
        mode = 'type';
        wait(HERO_TYPE.gap, step);
        return;
      }

      if (index < full.length) {
        index += 1;
        setText(full.slice(0, index));
        wait(HERO_TYPE.type, step);
        return;
      }

      setAnnounced(full);
      mode = 'delete';
      wait(full === HERO_BRAND_PHRASE ? HERO_TYPE.holdBrand : HERO_TYPE.holdFeature, step);
    };

    wait(HERO_TYPE.holdBrand, step);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reduced]);

  const shown = reduced ? HERO_BRAND_PHRASE : text;

  return (
    <h1 className="wp-hero-title">
      <span className="wp-hero-line wp-hero-line--lead">
        {HERO_LEAD}
        <span className="wp-hero-sr" aria-live="polite">{` ${announced}`}</span>
      </span>
      <span className={`wp-hero-line wp-hero-line--typed is-${tone}`} aria-hidden="true" data-testid="hero-typed">
        {shown}
        {!reduced && <span className="wp-hero-caret" />}
      </span>
    </h1>
  );
}
