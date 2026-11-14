/** Geometria da ilustração do raio. Não calcula taxa nem distância de rua. */

export const COVERAGE_LAYOUT = Object.freeze({
  viewWidth: 640,
  viewHeight: 360,
  cx: 250,
  cy: 176,
  radius: 108,
  angle: Math.PI / 4.15,
  maxVisualRatio: 1.34,
});

export function formatRadiusKmLabel(raw) {
  if (raw == null) return '';
  const text = String(raw).trim();
  if (!text) return '';
  const value = Number(text.replace(',', '.'));
  if (!Number.isFinite(value) || value < 0) return '';
  const rounded = Math.round(value * 100) / 100;
  const [whole, frac = ''] = rounded.toFixed(2).split('.');
  const wholeWithDots = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const trimmedFrac = frac.replace(/0+$/, '');
  if (!trimmedFrac) return `${wholeWithDots} km`;
  return `${wholeWithDots},${trimmedFrac} km`;
}

export function illustrativeCustomerRatio(distanceKm, maxKm) {
  if (distanceKm == null || String(distanceKm).trim() === '') return null;
  const distance = Number(String(distanceKm).trim().replace(',', '.'));
  const max = Number(maxKm);
  if (!Number.isFinite(distance) || distance < 0) return null;
  if (!Number.isFinite(max) || max <= 0) return null;
  return distance / max;
}

export function customerZone(ratio) {
  if (ratio == null) return 'hidden';
  if (ratio > 1) return 'outside';
  if (ratio >= 1) return 'edge';
  return 'inside';
}

export function illustrativeCustomerPoint(distanceKm, maxKm) {
  const ratio = illustrativeCustomerRatio(distanceKm, maxKm);
  if (ratio == null) return null;
  const visual = Math.min(ratio, COVERAGE_LAYOUT.maxVisualRatio);
  const { cx, cy, radius, angle } = COVERAGE_LAYOUT;
  return {
    ratio,
    zone: customerZone(ratio),
    x: cx + Math.cos(angle) * radius * visual,
    y: cy + Math.sin(angle) * radius * visual,
  };
}

export function coverageHint(distanceKm, maxKm) {
  const ratio = illustrativeCustomerRatio(distanceKm, maxKm);
  if (ratio == null) {
    const hasDistance = String(distanceKm ?? '').trim() !== '';
    return hasDistance
      ? 'Informe a distância máxima para posicionar o cliente.'
      : 'O cliente aparece na distância digitada no simulador.';
  }
  if (ratio > 1) return 'Nesta distância, o cliente fica fora do círculo.';
  return '';
}
