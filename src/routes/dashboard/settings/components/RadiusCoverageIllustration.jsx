import React, { useEffect, useState } from 'react';
import {
  COVERAGE_LAYOUT,
  coverageHint,
  illustrativeCustomerPoint,
  formatRadiusKmLabel,
} from '../utils/radiusCoverageIllustration';

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(Boolean(media.matches));
    apply();
    media.addEventListener?.('change', apply);
    return () => media.removeEventListener?.('change', apply);
  }, []);

  return reduced;
}

function percent(value, total) {
  return `${(value / total) * 100}%`;
}

export function RadiusCoverageIllustration({ distanceKm, maxKm }) {
  const reduced = usePrefersReducedMotion();
  const point = illustrativeCustomerPoint(distanceKm, maxKm);
  const zone = point?.zone || 'hidden';
  const label = point ? formatRadiusKmLabel(distanceKm) : '';
  const hint = coverageHint(distanceKm, maxKm);
  const { viewWidth, viewHeight, cx, cy, radius } = COVERAGE_LAYOUT;
  const midX = point ? (cx + point.x) / 2 : cx;
  const midY = point ? (cy + point.y) / 2 : cy;
  const dx = point ? point.x - cx : 1;
  const dy = point ? point.y - cy : 0;
  const length = Math.hypot(dx, dy) || 1;
  const labelX = midX + (-dy / length) * 30;
  const labelY = midY + (dx / length) * 30;

  return (
    <div className={`radius-coverage-block${reduced ? ' radius-coverage--still' : ''}`}>
      <p className="radius-coverage__heading">Ilustração do raio</p>
      <figure
        className="radius-coverage"
        data-zone={zone}
        data-motion={reduced ? 'reduced' : 'animated'}
        aria-label="Ilustração do raio de entrega"
      >
        <div className="radius-coverage__stage">
          <svg
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <rect width={viewWidth} height={viewHeight} fill="#f3f5f7" />
            {Array.from({ length: 17 }, (_, index) => (
              <line
                key={`v-${index}`}
                x1={index * 40}
                y1="0"
                x2={index * 40}
                y2={viewHeight}
                stroke="#e6ebf0"
                strokeWidth="1"
              />
            ))}
            {Array.from({ length: 10 }, (_, index) => (
              <line
                key={`h-${index}`}
                x1="0"
                y1={index * 40}
                x2={viewWidth}
                y2={index * 40}
                stroke="#e6ebf0"
                strokeWidth="1"
              />
            ))}
            <path
              d="M36 48 H210 V150 H390"
              fill="none"
              stroke="#dde3ea"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M70 300 H230 V210 H470"
              fill="none"
              stroke="#e3e8ee"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M500 28 V190 H620"
              fill="none"
              stroke="#dde3ea"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              className="radius-coverage__ring"
              cx={cx}
              cy={cy}
              r={radius}
              pathLength="100"
            />
            {point ? (
              <line
                className="radius-coverage__link"
                x1={cx}
                y1={cy}
                x2={point.x}
                y2={point.y}
                pathLength="100"
              />
            ) : null}
            <g className="radius-coverage__store" transform={`translate(${cx} ${cy})`}>
              <circle r="12" fill="#ffffff" />
              <circle r="7" fill="#166534" />
            </g>
            {point ? (
              <g
                className="radius-coverage__pin"
                data-customer-x={point.x}
                data-customer-y={point.y}
                transform={`translate(${point.x} ${point.y})`}
              >
                <circle r="12" fill="#ffffff" />
                <circle r="7" fill="#f97316" />
              </g>
            ) : null}
          </svg>
          <span
            className="radius-coverage__label radius-coverage__label--store"
            style={{ left: percent(cx, viewWidth), top: percent(cy - 34, viewHeight) }}
          >
            Loja
          </span>
          {point && label ? (
            <span
              className="radius-coverage__label radius-coverage__label--km"
              style={{ left: percent(labelX, viewWidth), top: percent(labelY, viewHeight) }}
            >
              {label}
            </span>
          ) : null}
          {point ? (
            <span
              className="radius-coverage__label radius-coverage__label--customer"
              style={{ left: percent(point.x + 16, viewWidth), top: percent(point.y, viewHeight) }}
            >
              Cliente
            </span>
          ) : null}
        </div>
        <figcaption className="radius-coverage__caption">
          Figura ilustrativa. A taxa real só entra quando houver a distância pelas ruas.
          {hint ? ` ${hint}` : ''}
        </figcaption>
      </figure>
    </div>
  );
}
