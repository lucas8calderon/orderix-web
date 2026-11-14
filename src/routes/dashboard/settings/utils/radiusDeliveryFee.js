/** Conta local da entrega por raio. Não consulta mapa nem roteador. */

function roundHalfUpCents(amount) {
  return Math.round((Number(amount) + Number.EPSILON) * 100);
}

export function simulateRadiusFee({ distanceKm, maxKm, pricePerKm, minimumFee } = {}) {
  if (distanceKm == null || String(distanceKm).trim() === '') {
    return { status: 'empty' };
  }
  const distance = Number(String(distanceKm).replace(',', '.'));
  const max = Number(maxKm);
  const price = Number(pricePerKm);
  const hasMinimum = minimumFee != null && minimumFee !== '';
  const minimum = hasMinimum ? Number(minimumFee) : null;
  if (!Number.isFinite(distance) || distance < 0
    || !Number.isFinite(max) || max <= 0
    || !Number.isFinite(price) || price < 0
    || (hasMinimum && (!Number.isFinite(minimum) || minimum < 0))) {
    return { status: 'invalid' };
  }
  if (distance > max) {
    return { status: 'out' };
  }
  const calculated = roundHalfUpCents(distance * price);
  const feeCents = hasMinimum ? Math.max(calculated, roundHalfUpCents(minimum)) : calculated;
  return { status: 'ok', fee: feeCents / 100 };
}
