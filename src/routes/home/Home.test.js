import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import { openWhatsApp } from './landingAssets';
import { PRICING_TIERS, formatPrice } from '../../config/pricingTiers';

jest.mock('./landingAssets', () => ({ openWhatsApp: jest.fn(), WHATSAPP_DISPLAY: '+55 11 92457-0853' }));
const setup = () => render(<MemoryRouter><Home /></MemoryRouter>);

test('selected price and contact context follow the central pricing configuration', () => {
  setup();
  const tier = PRICING_TIERS[4];
  fireEvent.change(screen.getByLabelText('Quanto sua loja processa por mês?'), { target: { value: tier.id } });
  expect(document.querySelector('.wp-price-value')).toHaveTextContent(formatPrice(tier.monthlyPrice).replace(/\s/g, ' '));
  fireEvent.click(screen.getByRole('button', { name: 'Quero assinar a Weper' }));
  expect(openWhatsApp).toHaveBeenCalledWith(expect.stringContaining(tier.label));
});

test('solution tabs support keyboard navigation and update their accessible panel', () => {
  setup();
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Atendimento' }), { key: 'End' });
  expect(screen.getByRole('tab', { name: 'Gestão' })).toHaveFocus();
  expect(screen.getByRole('tabpanel', { name: 'Gestão' })).toHaveTextContent('Decida com uma visão clara');
  fireEvent.keyDown(screen.getByRole('tab', { name: 'Gestão' }), { key: 'ArrowRight' });
  expect(screen.getByRole('tab', { name: 'Atendimento' })).toHaveAttribute('aria-selected', 'true');
});

test('Escape closes the navigation and restores focus', () => {
  setup();
  fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveFocus();
});
