import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WaiterLandingPage, { WAITER_PAGE_SEO } from './WaiterLandingPage';
import KitchenLandingPage, { KITCHEN_PAGE_SEO } from './KitchenLandingPage';
import InventoryLandingPage, { INVENTORY_PAGE_SEO } from './InventoryLandingPage';
import SelfServiceLandingPage, { SELF_SERVICE_PAGE_SEO } from './SelfServiceLandingPage';
import { FEATURE_PAGES } from './featurePages';
import { openWhatsApp } from '../landingAssets';

jest.mock('../landingAssets', () => ({
  openWhatsApp: jest.fn(),
  WHATSAPP_DISPLAY: '+55 11 92457-0853',
}));

const PAGES = [
  ['app do garçom', WaiterLandingPage, WAITER_PAGE_SEO, 'O garçom lança o pedido no celular.', 'app do garçom'],
  ['painel da cozinha', KitchenLandingPage, KITCHEN_PAGE_SEO, 'A cozinha vê o que chegou', 'painel da cozinha'],
  ['controle de estoque', InventoryLandingPage, INVENTORY_PAGE_SEO, 'O estoque baixa sozinho', 'controle de estoque'],
  ['autoatendimento', SelfServiceLandingPage, SELF_SERVICE_PAGE_SEO, 'O cliente faz o próprio pedido', 'autoatendimento'],
];

test.each(PAGES)('%s sets its own meta, marks itself in the footer and restores the head on leave', (_name, Page, seo, heading) => {
  document.title = 'Anterior';
  const { unmount } = render(<MemoryRouter><Page /></MemoryRouter>);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(heading);
  expect(document.title).toBe(seo.title);
  expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute('content', seo.description);
  expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute('href', seo.canonical);
  const current = FEATURE_PAGES.find(page => seo.canonical.endsWith(page.path));
  expect(screen.getByRole('link', { name: current.label })).toHaveAttribute('aria-current', 'page');
  unmount();
  expect(document.title).toBe('Anterior');
  expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
});

test.each(PAGES)('%s sends its own WhatsApp message', (_name, Page, _seo, _heading, topic) => {
  openWhatsApp.mockClear();
  render(<MemoryRouter><Page /></MemoryRouter>);
  fireEvent.click(screen.getByRole('button', { name: 'Falar com a Weper pelo WhatsApp' }));
  expect(openWhatsApp).toHaveBeenCalledWith(expect.stringContaining(topic));
});

test('every feature page has a canonical inside the public site', () => {
  PAGES.forEach(([, , seo]) => expect(seo.canonical).toMatch(/^https:\/\/www\.weper\.com\.br\/[a-z-]+$/));
  expect(new Set(FEATURE_PAGES.map(page => page.path)).size).toBe(FEATURE_PAGES.length);
});
