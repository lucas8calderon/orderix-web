import React from 'react';
import weperLogo from '../../../assets/images/weper-logo.png';

/**
 * Logo oficial Weper (W + wordmark em fundo transparente).
 * `size` controla a altura da imagem; o wordmark já vem na arte.
 * `showWordmark` é mantido por compatibilidade (não remove o texto da arte).
 */
export function WeperMark({ size = 40, showWordmark = true, className = '' }) {
  const height = showWordmark ? size : Math.max(size, 28);

  return (
    <span
      className={`weper-mark ${className}`.trim()}
      aria-label="Weper"
      style={{ '--weper-mark-size': `${height}px` }}
    >
      <img
        className="weper-mark__logo"
        src={weperLogo}
        alt=""
        height={height}
        draggable={false}
      />
    </span>
  );
}

export default WeperMark;
