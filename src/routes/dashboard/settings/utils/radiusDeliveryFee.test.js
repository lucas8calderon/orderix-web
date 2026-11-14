import { simulateRadiusFee } from './radiusDeliveryFee';

describe('simulador de entrega por raio', () => {
  const base = { maxKm: 10, pricePerKm: 2, minimumFee: 5 };

  it('cobra 13 em 6,5 km', () => {
    expect(simulateRadiusFee({ ...base, distanceKm: '6,5' }).fee).toBe(13);
    expect(simulateRadiusFee({ ...base, distanceKm: 6.5 }).fee).toBe(13);
  });

  it('aplica a taxa mínima de 5 em 2 km', () => {
    expect(simulateRadiusFee({ ...base, distanceKm: 2 })).toEqual({ status: 'ok', fee: 5 });
  });

  it('marca fora da área acima do máximo', () => {
    expect(simulateRadiusFee({ ...base, maxKm: 6.5, distanceKm: 6.6 }).status).toBe('out');
  });

  it('aceita a distância exatamente no limite', () => {
    expect(simulateRadiusFee({ ...base, maxKm: 6.5, distanceKm: 6.5 })).toEqual({ status: 'ok', fee: 13 });
  });
});
