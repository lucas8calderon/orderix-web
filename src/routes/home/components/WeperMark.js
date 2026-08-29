import React from 'react';

/** Marca W + wordmark Weper (alinhada ao login). */
export function WeperMark({ size = 32, showWordmark = true, className = '' }) {
  return (
    <span className={`weper-mark ${className}`.trim()} aria-label="Weper">
      <svg
        className="weper-mark__icon"
        viewBox="0 0 48 48"
        width={size}
        height={size}
        role="img"
        aria-hidden={showWordmark ? 'true' : undefined}
        focusable="false"
      >
        <path
          d="M24 2.5L42 13v22L24 45.5 6 35V13L24 2.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path
          d="M16 28c0-5.2 3.4-8.5 8-8.5s8 3.3 8 8.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M18.5 20.5c1.2-2.8 3.2-4.2 5.5-4.2s4.3 1.4 5.5 4.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="14.5" r="1.6" fill="currentColor" />
      </svg>
      {showWordmark && <span className="weper-mark__word">Weper</span>}
    </span>
  );
}

export default WeperMark;
