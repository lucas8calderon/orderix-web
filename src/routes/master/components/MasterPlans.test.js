import { render, screen } from '@testing-library/react';
import { MasterPlans } from './MasterPlans';

test('mostra os planos 1 a 5 e agrupa os estabelecimentos do plano 5', () => {
  render(
    <MasterPlans
      stores={[
        { id: 1, plan: 'PLAN_01', price: 39.9 },
        { id: 2, plan: 'PLAN_05', price: 149.9 },
        { id: 3, plan: 'PLAN_05', price: 149.9 },
      ]}
    />
  );

  expect(screen.getByText('Plano 1')).toBeInTheDocument();
  expect(screen.getByText('Plano 2')).toBeInTheDocument();
  expect(screen.getByText('Plano 3')).toBeInTheDocument();
  expect(screen.getByText('Plano 4')).toBeInTheDocument();
  expect(screen.getByText('Plano 5')).toBeInTheDocument();
  expect(screen.getByText('Até R$ 1.000')).toBeInTheDocument();
  expect(screen.getByText('Acima de R$ 7.000')).toBeInTheDocument();
  expect(screen.queryByText('Básico')).not.toBeInTheDocument();
  expect(screen.queryByText('Profissional')).not.toBeInTheDocument();
  expect(screen.queryByText('Premium')).not.toBeInTheDocument();
  expect(screen.queryByText('Planos anteriores')).not.toBeInTheDocument();
});
