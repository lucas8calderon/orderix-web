import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DeliveryLandingPage, { DELIVERY_PAGE_SEO } from './DeliveryLandingPage';
import { openWhatsApp } from './landingAssets';
import { formatPrice, getTierByRevenue } from '../../config/pricingTiers';

jest.mock('./landingAssets', () => ({
  openWhatsApp: jest.fn(),
  WHATSAPP_DISPLAY: '+55 11 92457-0853',
}));

const setup = () => render(<MemoryRouter><DeliveryLandingPage /></MemoryRouter>);
const money = value => formatPrice(value).replace(/\s/g, ' ');

test('calculator compares the informed commission with the Weper tier for that volume', () => {
  setup();
  fireEvent.change(screen.getByLabelText(/vende por mês no delivery/), { target: { value: '3000' } });
  fireEvent.change(screen.getByLabelText(/Comissão que você paga hoje/), { target: { value: '20' } });
  const tier = getTierByRevenue(3000);
  expect(screen.getByTestId('delivery-commission-cost')).toHaveTextContent(money(600));
  expect(screen.getByTestId('delivery-weper-price')).toHaveTextContent(money(tier.monthlyPrice));
  expect(screen.getByTestId('delivery-difference')).toHaveTextContent(money(600 - tier.monthlyPrice));
  expect(screen.getByRole('link', { name: 'Assinar esta faixa' })).toHaveAttribute('href', `/contratar?plan=${tier.code}`);
});

test('calculator never shows a negative difference', () => {
  setup();
  fireEvent.change(screen.getByLabelText(/Comissão que você paga hoje/), { target: { value: '0' } });
  expect(screen.getByTestId('delivery-difference')).toHaveTextContent(money(0));
  expect(screen.getByText('Diferença por mês')).toBeInTheDocument();
});

test('page sets its own title, description and canonical, and restores them on leave', () => {
  document.title = 'Anterior';
  const { unmount } = setup();
  expect(document.title).toBe(DELIVERY_PAGE_SEO.title);
  expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', DELIVERY_PAGE_SEO.description);
  expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', DELIVERY_PAGE_SEO.canonical);
  unmount();
  expect(document.title).toBe('Anterior');
  expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
});

test('contact points open WhatsApp with the delivery message', () => {
  setup();
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sem comissão por pedido.');
  fireEvent.click(screen.getByRole('button', { name: 'Falar com a Weper pelo WhatsApp' }));
  expect(openWhatsApp).toHaveBeenCalledWith(expect.stringContaining('delivery próprio'));
});
