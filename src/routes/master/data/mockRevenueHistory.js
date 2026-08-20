/**
 * Histórico de faturamento mensal (MRR).
 * MOCK TEMPORÁRIO — substituir por endpoint real (ex.: GET /api/stores/dashboard/revenue-history)
 * quando o backend passar a persistir snapshots mensais de assinatura.
 */
export const MOCK_MONTHLY_REVENUE = [
  { month: 'Mar', monthKey: '2026-03', revenue: 350 },
  { month: 'Abr', monthKey: '2026-04', revenue: 420 },
  { month: 'Mai', monthKey: '2026-05', revenue: 480 },
  { month: 'Jun', monthKey: '2026-06', revenue: 550 },
  { month: 'Jul', monthKey: '2026-07', revenue: 650 },
  { month: 'Ago', monthKey: '2026-08', revenue: 790 },
];

/**
 * Monta a série do gráfico: usa o mock e substitui o mês atual pelo MRR real,
 * para o último ponto refletir o faturamento calculado das assinaturas ativas.
 */
export function buildMonthlyRevenueSeries(currentMrr) {
  const series = MOCK_MONTHLY_REVENUE.map((item) => ({ ...item }));
  if (currentMrr == null || Number.isNaN(Number(currentMrr))) {
    return series;
  }
  const last = series[series.length - 1];
  if (last) {
    last.revenue = Number(currentMrr);
  }
  return series;
}
