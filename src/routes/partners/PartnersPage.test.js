import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { formatPrice } from '../../config/pricingTiers';
import PartnersPage from './PartnersPage';
import { openWhatsApp } from '../home/landingAssets';
import {
  PARTNER_DISCLAIMER,
  PARTNER_PAGE_SEO,
  PARTNER_WHATSAPP_MESSAGE,
  simulatePartnerEarnings,
} from './partnerProgram';

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="partner-chart">{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  Cell: () => null,
}));

jest.mock('../home/landingAssets', () => ({
  openWhatsApp: jest.fn(),
  WHATSAPP_DISPLAY: '+55 11 92457-0853',
}));

function expectMoney(label, value) {
  const expected = typeof value === 'number'
    ? formatPrice(value).replace(/\s/g, ' ')
    : String(value);
  expect(screen.getByLabelText(label)).toHaveTextContent(expected);
}

function setup() {
  return render(
    <MemoryRouter>
      <PartnersPage />
    </MemoryRouter>,
  );
}

describe('landing do programa de parceiros', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.title = 'Weper';
    openWhatsApp.mockClear();
  });

  it('explica o programa, publica o SEO e abre o WhatsApp oficial', () => {
    const view = setup();
    expect(screen.getByRole('heading', { level: 1, name: /Indique a Weper/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Simular meus ganhos/ })).toHaveAttribute('href', '#simulador');
    expect(screen.getAllByRole('link', { name: 'Quero ser parceiro' })[0]).toHaveAttribute('href', '#quero-ser-parceiro');
    expect(screen.getByText(PARTNER_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(/futura área exclusiva/)).toBeInTheDocument();
    expect(screen.getByText(/formalização da parceria/)).toBeInTheDocument();
    expect(document.title).toBe(PARTNER_PAGE_SEO.title);

    fireEvent.click(screen.getByRole('button', { name: 'Quero fazer parte' }));
    expect(openWhatsApp).toHaveBeenCalledWith(PARTNER_WHATSAPP_MESSAGE);

    view.unmount();
    expect(document.title).toBe('Weper');
  });

  it('atualiza planos, quantidade, percentual, período, gráfico e barras', () => {
    setup();
    const initial = simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 10, ratePercent: 10, months: 12 });
    expect(screen.getByRole('radio', { name: /99,90/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: '10%' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '12 meses' })).toBeChecked();
    expectMoney('Comissão mensal estimada', initial.monthlyCommission);
    expectMoney('Comissão acumulada no período', initial.accumulatedCommission);
    expect(within(screen.getByRole('table', { name: 'Comissão acumulada mês a mês' })).getAllByRole('row')).toHaveLength(13);

    const progress = screen.getByRole('list', { name: 'Ganhos acumulados por período' });
    expect(within(progress).getByText('12 meses')).toBeInTheDocument();
    expect(within(progress).queryByText('24 meses')).not.toBeInTheDocument();
    expect(within(progress).queryByText('36 meses')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: /39,90/ }));
    fireEvent.change(screen.getByRole('slider', { name: 'Quantidade de estabelecimentos' }), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('radio', { name: '15%' }));
    fireEvent.click(screen.getByRole('radio', { name: '24 meses' }));

    const next = simulatePartnerEarnings({ monthlyPrice: 39.9, stores: 5, ratePercent: 15, months: 24 });
    expectMoney('Comissão estimada por estabelecimento/mês', next.commissionPerStore);
    expectMoney('Total de estabelecimentos', '5');
    expectMoney('Receita mensal total das assinaturas simuladas', next.subscriptionRevenue);
    expectMoney('Comissão mensal estimada', next.monthlyCommission);
    expectMoney('Comissão acumulada no período', next.accumulatedCommission);
    expectMoney('Projeção anual equivalente', next.annualEquivalent);
    expect(within(screen.getByRole('table', { name: 'Comissão acumulada mês a mês' })).getAllByRole('row')).toHaveLength(25);
    expect(within(screen.getByRole('list', { name: 'Ganhos acumulados por período' })).getByText('24 meses')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Ganhos acumulados por período' })).queryByText('36 meses')).not.toBeInTheDocument();
    expect(screen.getByText(/No mês 24, a projeção acumulada ilustrativa/)).toHaveTextContent(formatPrice(next.accumulatedCommission).replace(/\s/g, ' '));
  });

  it('calcula os exemplos com a taxa ilustrativa de 10% e o plano de referência', () => {
    setup();
    const starter = simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 5, ratePercent: 10, months: 12 });
    const network = simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 50, ratePercent: 10, months: 12 });
    const examples = screen.getByRole('region', { name: /Três jeitos de participar/ });
    expect(within(examples).getByRole('heading', { name: 'Parceiro iniciante' })).toBeInTheDocument();
    expect(within(examples).getByRole('heading', { name: 'Parceiro com rede de contatos' })).toBeInTheDocument();
    expect(examples).toHaveTextContent(formatPrice(starter.monthlyCommission).replace(/\s/g, ' '));
    expect(examples).toHaveTextContent(formatPrice(network.monthlyCommission).replace(/\s/g, ' '));
    expect(screen.getByRole('link', { name: /Conhecer as funcionalidades/ })).toHaveAttribute('href', '/#solucoes');
  });
});
