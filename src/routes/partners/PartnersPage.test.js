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

function moneyText(value) {
  return formatPrice(value).replace(/\s/g, ' ');
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
    window.sessionStorage.clear();
    // Só os metadados de SEO: o emotion/MUI mantém referências aos <style> do head.
    // eslint-disable-next-line testing-library/no-node-access
    document.head.querySelectorAll('meta, link[rel="canonical"]').forEach((node) => node.remove());
    document.title = 'Weper';
    openWhatsApp.mockClear();
  });

  it('explica o programa, publica o SEO e abre o WhatsApp oficial', () => {
    const view = setup();
    expect(screen.getByRole('heading', { level: 1, name: /Cresça com a Weper/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Simular meus ganhos/ })).toHaveAttribute('href', '#simulador');
    expect(screen.getAllByRole('button', { name: /Seja Parceiro/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Acessar Área de Parceiros' })).toHaveAttribute('href', '/parceiros/login');
    expect(screen.getByText(PARTNER_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(/comissões na Área de Parceiros/)).toBeInTheDocument();
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
    const result = () => screen.getByRole('group', { name: 'Resultado da simulação' });
    expect(screen.getByRole('radio', { name: /99,90/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: '10%' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '12 meses' })).toBeChecked();
    expect(result()).toHaveTextContent(moneyText(initial.monthlyCommission));
    expect(result()).toHaveTextContent('Comissão acumulada em 12 meses');
    expect(result()).toHaveTextContent(moneyText(initial.accumulatedCommission));
    expect(screen.queryByText('Comissão estimada por estabelecimento/mês')).not.toBeInTheDocument();
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
    expect(result()).toHaveTextContent('Comissão acumulada em 24 meses');
    expect(result()).toHaveTextContent(moneyText(next.monthlyCommission));
    expect(result()).toHaveTextContent(moneyText(next.accumulatedCommission));
    expect(within(screen.getByRole('table', { name: 'Comissão acumulada mês a mês' })).getAllByRole('row')).toHaveLength(25);
    expect(within(screen.getByRole('list', { name: 'Ganhos acumulados por período' })).getByText('24 meses')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Ganhos acumulados por período' })).queryByText('36 meses')).not.toBeInTheDocument();
    expect(screen.getByText(/No mês 24, a projeção acumulada ilustrativa/)).toHaveTextContent(moneyText(next.accumulatedCommission));
  });

  it('calcula os exemplos com a taxa ilustrativa de 10% e o plano de referência', () => {
    setup();
    const starter = simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 5, ratePercent: 10, months: 12 });
    const network = simulatePartnerEarnings({ monthlyPrice: 99.9, stores: 50, ratePercent: 10, months: 12 });
    const examples = screen.getByRole('region', { name: /Três jeitos de participar/ });
    expect(within(examples).getByRole('heading', { name: 'Parceiro iniciante' })).toBeInTheDocument();
    expect(within(examples).getByRole('heading', { name: 'Parceiro com rede de contatos' })).toBeInTheDocument();
    expect(examples).toHaveTextContent(moneyText(starter.monthlyCommission));
    expect(examples).toHaveTextContent(moneyText(network.monthlyCommission));
    expect(screen.getByRole('link', { name: /Conhecer as funcionalidades/ })).toHaveAttribute('href', '/#solucoes');
  });

  it('"Seja Parceiro" abre o cadastro e o WhatsApp não é usado', async () => {
    setup();
    fireEvent.click(screen.getAllByRole('button', { name: /Seja Parceiro/ })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Seja parceiro Weper' })).toBeInTheDocument();
    expect(within(dialog).getByText('Em breve')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'Termos de uso' })).toHaveAttribute('href', '/terms');
    expect(within(dialog).getByRole('link', { name: 'Política de privacidade' })).toHaveAttribute('href', '/privacy');
    expect(openWhatsApp).not.toHaveBeenCalled();
  });

  it('guarda ?ref= em sessionStorage sem exigir conversão', () => {
    render(
      <MemoryRouter initialEntries={['/parceiros?ref=abc123']}>
        <PartnersPage />
      </MemoryRouter>,
    );
    expect(window.sessionStorage.getItem('weper.partnerRef')).toBe('ABC123');
  });});
