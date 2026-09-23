import { render, screen } from '@testing-library/react';
import { MetricCard } from './DashboardGerencial';

it('shows a real comparison for formatted Brazilian currency', () => {
  render(<MetricCard title="Faturamento" value="R$ 1.250,00" previous={1000} changePercent={25} period="DAYS_7" />);
  expect(screen.getByText('+25% vs 7 dias anteriores')).toBeInTheDocument();
});

it('does not invent a comparison when the API has no previous value', () => {
  render(<MetricCard title="Faturamento" value="R$ 1.250,00" period="TODAY" />);
  expect(screen.getByText('Sem comparação disponível')).toBeInTheDocument();
  expect(screen.queryByText(/0%/)).not.toBeInTheDocument();
});
