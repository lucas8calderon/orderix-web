import {
  COVERAGE_LAYOUT,
  coverageHint,
  customerZone,
  formatRadiusKmLabel,
  illustrativeCustomerPoint,
} from './radiusCoverageIllustration';

function visualDistance(point) {
  return Math.hypot(point.x - COVERAGE_LAYOUT.cx, point.y - COVERAGE_LAYOUT.cy);
}

describe('ilustração do raio', () => {
  it('formata a distância no padrão brasileiro', () => {
    expect(formatRadiusKmLabel('6.5')).toBe('6,5 km');
    expect(formatRadiusKmLabel('6,5')).toBe('6,5 km');
    expect(formatRadiusKmLabel('2')).toBe('2 km');
    expect(formatRadiusKmLabel('')).toBe('');
  });

  it('posiciona o cliente em proporção ao raio máximo', () => {
    const inside = illustrativeCustomerPoint('3.25', 6.5);
    expect(inside.zone).toBe('inside');
    expect(visualDistance(inside)).toBeCloseTo(COVERAGE_LAYOUT.radius / 2, 5);

    const edge = illustrativeCustomerPoint(6.5, 6.5);
    expect(customerZone(edge.ratio)).toBe('edge');
    expect(visualDistance(edge)).toBeCloseTo(COVERAGE_LAYOUT.radius, 5);
  });

  it('deixa o cliente fora do círculo quando a distância passa do máximo', () => {
    const outside = illustrativeCustomerPoint('8', 6.5);
    expect(outside.zone).toBe('outside');
    expect(visualDistance(outside)).toBeGreaterThan(COVERAGE_LAYOUT.radius);
    expect(visualDistance(outside)).toBeLessThanOrEqual(
      COVERAGE_LAYOUT.radius * COVERAGE_LAYOUT.maxVisualRatio + 0.01
    );
    expect(coverageHint('8', 6.5)).toMatch(/fora do círculo/);
  });

  it('não inventa posição sem distância ou sem máximo', () => {
    expect(illustrativeCustomerPoint('', 6.5)).toBeNull();
    expect(illustrativeCustomerPoint('4', null)).toBeNull();
    expect(illustrativeCustomerPoint('abc', 6)).toBeNull();
    expect(customerZone(null)).toBe('hidden');
  });
});
