import React from 'react';
import weperMarkPng from '../../../assets/images/weper-mark-w.png';
import weperMarkWebp from '../../../assets/images/weper-mark-w.webp';

/**
 * Marca Weper: monograma W (PNG/WebP transparente) + tipografia "Weper".
 * `size` controla a altura do monograma.
 * `showWordmark={false}` exibe só o W (ex.: CTA final).
 */
export function WeperMark({ size = 40, showWordmark = true, className = '' }) {
  const height = Math.max(size, 28);

  return (
    <span
      className={`weper-mark ${showWordmark ? '' : 'weper-mark--icon'} ${className}`.trim()}
      aria-label="Weper"
      style={{ '--weper-mark-size': `${height}px` }}
    >
      <picture>
        <source srcSet={weperMarkWebp} type="image/webp" />
        <img
          className="weper-mark__logo"
          src={weperMarkPng}
          alt=""
          height={height}
          width={Math.round(height * (329 / 201))}
          draggable={false}
        />
      </picture>
      {showWordmark ? (
        <span className="weper-mark__wordmark" aria-hidden="true">
          Weper
        </span>
      ) : null}
    </span>
  );
}

export default WeperMark;
