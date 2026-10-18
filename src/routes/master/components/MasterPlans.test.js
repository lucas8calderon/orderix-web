import { render, screen } from '@testing-library/react';
import { MasterPlans } from './MasterPlans';

test('mostra as cinco faixas e só os planos anteriores que ainda têm estabelecimentos', () => {
  render(
    <MasterPlans
      stores={[
        { id: 1, plan: 'I', price: 39.9 },
        { id: 2, plan: 'PRO', price: 79.9 },
        { id: 3, plan: 'PRO', price: 79.9 },
      ]}
    />
  );

  expect(screen.getByText('Plano I')).toBeInTheDocument();
  expect(screen.getByText('Plano II')).toBeInTheDocument();
  expect(screen.getByText('Plano III')).toBeInTheDocument();
  expect(screen.getByText('Plano IV')).toBeInTheDocument();
  expect(screen.getByText('Plano V')).toBeInTheDocument();
  expect(screen.getByText('Até R$ 1.000')).toBeInTheDocument();
  expect(screen.getByText('Acima de R$ 7.000')).toBeInTheDocument();
  expect(screen.getByText('Profissional')).toBeInTheDocument();
  expect(screen.queryByText('Básico')).not.toBeInTheDocument();
  expect(screen.queryByText('Premium')).not.toBeInTheDocument();
});
