import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { openWhatsApp } from './landingAssets';
import { PRICING_TIERS, formatPrice } from '../../config/pricingTiers';

jest.mock('./landingAssets', () => ({
  openWhatsApp: jest.fn(),
  WHATSAPP_DISPLAY: '+55 11 92457-0853',
  LANDING_IMAGES: {
    desktop: {
      src: 'desktop-pdv.webp',
      alt: 'Estação desktop Weper com monitor, teclado, mouse e impressora térmica',
      width: 1600,
      height: 1066,
    },
  },
}));
const setup = () => render(<MemoryRouter><Home /></MemoryRouter>);

test('selected price and contact context follow the central pricing configuration', () => {
  setup();
  const tier = PRICING_TIERS[4];
  fireEvent.change(screen.getByLabelText('Quanto sua loja processa por mês?'), { target: { value: tier.id } });
  expect(document.querySelector('.wp-price-value')).toHaveTextContent(formatPrice(tier.monthlyPrice).replace(/\s/g, ' '));
  expect(screen.getByRole('link', { name: 'Assinar esta faixa' })).toHaveAttribute('href', `/contratar?plan=${tier.code}`);
  expect(openWhatsApp).not.toHaveBeenCalled();
});

test('hero explains the system and sends pricing and demo in place', () => {
  setup();
  expect(screen.getByRole('heading', { level: 1, name: 'Pedidos do salão e do delivery no mesmo sistema.' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Ver a mensalidade' })).toHaveAttribute('href', '#plans');
  expect(screen.getByRole('link', { name: 'Ver o cardápio que o cliente usa' })).toHaveAttribute('href', '#demo');
  expect(screen.getByText(/Não cobra comissão por pedido/)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /Estação desktop Weper/ })).toBeInTheDocument();
  expect(document.title).toBe('Weper | Sistema para salão, delivery e cozinha');
});

test('other contact points stay on WhatsApp', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Falar com a Weper pelo WhatsApp' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fale com a equipe' }));
  fireEvent.click(screen.getByRole('button', { name: 'Falar com a equipe' }));
  expect(openWhatsApp).toHaveBeenCalled();
  expect(screen.getByRole('link', { name: 'Contratar' })).toHaveAttribute('href', '#plans');
  expect(screen.queryByRole('link', { name: 'Quero começar' })).not.toBeInTheDocument();
  expect(screen.queryByText('Começar é uma conversa.')).not.toBeInTheDocument();
});

test('solution tabs support keyboard navigation and update their accessible panel', () => {
  setup();
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Atendimento' }), { key: 'End' });
  expect(screen.getByRole('tab', { name: 'Gestão' })).toHaveFocus();
  expect(screen.getByRole('tabpanel', { name: 'Gestão' })).toHaveTextContent('Faturamento, pedidos e ticket médio');
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Gestão' }), { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Atendimento' })).toHaveAttribute('aria-selected', 'true');
});

test('public pricing table shows the amount without the internal plan code', () => {
  setup();
  fireEvent.click(screen.getByText(/Ver todas as faixas de preço/i));
  const table = screen.getByRole('table', { name: 'Mensalidade por volume processado' });
  expect(table).toHaveTextContent('Até R$ 1.000');
  expect(table).toHaveTextContent('R$ 39,90');
  expect(table).toHaveTextContent('Acima de R$ 7.000');
  expect(table).toHaveTextContent('R$ 149,90');
  expect(table).not.toHaveTextContent('Plano I');
  expect(table).not.toHaveTextContent('Plano V');
});

test('institutional navigation links to the partners page', () => {
  setup();
  const links = screen.getAllByRole('link', { name: 'Parceiros' });
  expect(links.length).toBeGreaterThan(0);
  links.forEach((link) => expect(link).toHaveAttribute('href', '/parceiros'));
});

test('Escape closes the navigation and restores focus', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
});

test('captura ?ref= do link de parceiro em sessionStorage no mount', () => {
  window.sessionStorage.clear();
  render(<MemoryRouter initialEntries={['/?ref=Parc-01']}><Home /></MemoryRouter>);
  expect(window.sessionStorage.getItem('weper.partnerRef')).toBe('PARC-01');
  window.sessionStorage.clear();
});
