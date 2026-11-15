/* eslint-disable testing-library/no-node-access -- GTM e Clarity entram no document, fora da árvore do Testing Library. */
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { PRICING_TIERS } from '../config/pricingTiers';
import { acceptAll, rejectOptional } from './analyticsConsent';
import { classifyReferrer, noteArrival, resetCampaignTracking } from './campaignTracking';
import {
  shouldRecordAcquisition,
  trackBeginCheckout,
  trackConfirmedPurchase,
} from './conversionTracking';
import { maybeLoadProviders } from './analyticsProviders';
import {
  handleCommercialClick,
  resetAnalyticsRuntime,
  track,
  trackAnalyticsPageView,
  trackGenerateLead,
  trackPlanSelected,
  trackPlansView,
  trackSubscriptionModalOpened,
  trackWhatsAppClick,
} from './analyticsService';
import { plansVisibilityThreshold, usePlansView } from './usePlansView';
import SignupReturnPage from '../routes/billing/SignupReturnPage';

function names() {
  return (window.dataLayer || []).map((entry) => entry.event).filter((name) => name !== 'gtm.js');
}

function last(name) {
  return [...(window.dataLayer || [])].reverse().find((entry) => entry.event === name);
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetCampaignTracking();
  resetAnalyticsRuntime();
  delete window.dataLayer;
  delete window.clarity;
  document.getElementById('weper-gtm')?.remove();
  document.getElementById('weper-clarity')?.remove();
  document.body.innerHTML = '';
});

test('home visit is one page view for the same visitor and session', () => {
  acceptAll();
  noteArrival('', '', 'www.weper.com.br');
  trackAnalyticsPageView('/', '');
  trackAnalyticsPageView('/', '');
  const views = (window.dataLayer || []).filter((entry) => entry.event === 'page_view');
  expect(views).toHaveLength(1);
  expect(views[0].page_path).toBe('/');
  expect(views[0].channel).toBe('direct');
  expect(views[0].visitor_id).toEqual(expect.any(String));
  expect(views[0].session_id).toEqual(expect.any(String));
  expect(views[0].session_id).not.toBe(views[0].visitor_id);
  trackPlanSelected('PLAN_01', 'homepage_plans');
  trackPlanSelected('PLAN_02', 'homepage_plans');
  const plans = (window.dataLayer || []).filter((entry) => entry.event === 'plan_selected');
  expect(plans).toHaveLength(2);
  expect(plans[0].visitor_id).toBe(views[0].visitor_id);
  expect(plans[1].visitor_id).toBe(views[0].visitor_id);
  expect(plans[0].session_id).toBe(plans[1].session_id);
});

test('plans view is recorded once when the section is actually visible', () => {
  acceptAll();
  expect(trackPlansView('/')).toEqual(expect.objectContaining({ sent: true }));
  expect(trackPlansView('/')).toEqual(expect.objectContaining({ sent: false, reason: 'duplicate' }));
  expect(names().filter((name) => name === 'plans_view')).toHaveLength(1);
});

test('opening #plans does not count as a view until the section is on screen', () => {
  acceptAll();
  window.location.hash = '#plans';
  window.dispatchEvent(new Event('hashchange'));
  expect(names()).not.toContain('plans_view');
  const link = document.createElement('a');
  link.setAttribute('href', '#plans');
  const preventDefault = jest.fn();
  handleCommercialClick({ target: link, preventDefault });
  expect(preventDefault).not.toHaveBeenCalled();
  expect(names()).toContain('plans_cta_click');
  expect(names()).not.toContain('plans_view');
});

test('mobile uses the price sentinel and desktop can watch the whole section', () => {
  expect(plansVisibilityThreshold(400, 900)).toBe(0.5);
  expect(plansVisibilityThreshold(2200, 700)).toBeLessThan(0.5);

  const observed = [];
  let callback = () => {};
  window.IntersectionObserver = class {
    constructor(cb) { callback = cb; }
    observe(node) { observed.push(node); }
    disconnect() {}
  };
  const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRect() {
    if (this.id === 'plans') {
      return { height: 1800, width: 360, top: 0, left: 0, bottom: 1800, right: 360, x: 0, y: 0, toJSON() { return {}; } };
    }
    return { height: 280, width: 360, top: 0, left: 0, bottom: 280, right: 360, x: 0, y: 0, toJSON() { return {}; } };
  });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 640 });
  acceptAll();

  function Probe() {
    const ref = useRef(null);
    usePlansView(ref);
    return <section id="plans" ref={ref}><div data-plans-sentinel="">oferta</div></section>;
  }

  const view = render(<Probe />);
  expect(observed.at(-1)?.hasAttribute('data-plans-sentinel')).toBe(true);
  callback([{ isIntersecting: true, intersectionRatio: 0.5 }]);
  callback([{ isIntersecting: true, intersectionRatio: 0.5 }]);
  expect(names().filter((name) => name === 'plans_view')).toHaveLength(1);
  view.unmount();

  rect.mockImplementation(function desktopRect() {
    if (this.id === 'plans') {
      return { height: 480, width: 1200, top: 0, left: 0, bottom: 480, right: 1200, x: 0, y: 0, toJSON() { return {}; } };
    }
    return { height: 200, width: 400, top: 0, left: 0, bottom: 200, right: 400, x: 0, y: 0, toJSON() { return {}; } };
  });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
  window.sessionStorage.clear();
  observed.length = 0;
  const { unmount: unmountWide } = render(<Probe />);
  expect(observed.at(-1)?.id).toBe('plans');
  unmountWide();
  rect.mockRestore();
  delete window.IntersectionObserver;
});

test('selecting a plan uses the live catalog and does not block navigation', () => {
  acceptAll();
  const tier = PRICING_TIERS.find((item) => item.code === 'PLAN_03');
  const section = document.createElement('section');
  section.id = 'plans';
  const anchor = document.createElement('a');
  anchor.href = '/contratar?plan=PLAN_03';
  const label = document.createElement('span');
  label.textContent = 'Assinar esta faixa';
  anchor.appendChild(label);
  section.appendChild(anchor);
  document.body.appendChild(section);
  const preventDefault = jest.fn();
  handleCommercialClick({ target: label, preventDefault });
  expect(preventDefault).not.toHaveBeenCalled();
  expect(last('plan_selected')).toEqual(expect.objectContaining({
    plan_id: 'PLAN_03',
    plan_name: tier.label,
    plan_price: tier.monthlyPrice,
    currency: 'BRL',
    source_section: 'homepage_plans',
  }));
  expect(trackPlanSelected('PLAN_TEST', 'signup_form').sent).toBe(false);
});

test('checkout starts only for a real signup attempt and keeps the campaign on that attempt', () => {
  acceptAll();
  noteArrival('?utm_source=instagram&utm_medium=paid_social&utm_campaign=black_friday', '', 'www.weper.com.br');
  expect(trackBeginCheckout({ planCode: 'PLAN_01' }).sent).toBe(false);
  const started = trackBeginCheckout({ signupId: 42, planCode: 'PLAN_01' });
  expect(started.sent).toBe(true);
  expect(started.payload).toEqual(expect.objectContaining({
    plan_id: 'PLAN_01',
    value: 39.9,
    currency: 'BRL',
    signup_id: '42',
    utm_source: 'instagram',
    utm_campaign: 'black_friday',
    channel: 'instagram_ads',
  }));
  expect(trackBeginCheckout({ signupId: 42, planCode: 'PLAN_01' }).reason).toBe('duplicate');
  expect(trackBeginCheckout({ signupId: 7, planCode: 'PLAN_TEST' }).sent).toBe(false);
  expect(names()).not.toContain('purchase');
});

test('returning from the invoice without payment is not a purchase', () => {
  acceptAll();
  render(<MemoryRouter><SignupReturnPage /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Pagamento em confirmação' })).toBeInTheDocument();
  expect(shouldRecordAcquisition({ paid: false, signupId: 42 })).toBe(false);
  expect(trackConfirmedPurchase({ paid: false, signupId: 42, planCode: 'PLAN_01' }).sent).toBe(false);
  expect(names()).not.toContain('purchase');
});

test('confirmed first payment is one purchase and a duplicate webhook is not another', () => {
  acceptAll();
  noteArrival('?utm_source=instagram&utm_medium=paid_social&utm_campaign=black_friday', '', 'www.weper.com.br');
  trackBeginCheckout({ signupId: 42, planCode: 'PLAN_01' });
  const first = trackConfirmedPurchase({ paid: true, signupId: 42, planCode: 'PLAN_01', isRenewal: false });
  const duplicate = trackConfirmedPurchase({ paid: true, signupId: 42, planCode: 'PLAN_01', isRenewal: false });
  expect(first.sent).toBe(true);
  expect(first.payload).toEqual(expect.objectContaining({
    transaction_id: '42',
    acquisition: 'first_subscription',
    value: 39.9,
    utm_campaign: 'black_friday',
  }));
  expect(duplicate.sent).toBe(false);
  expect(names().filter((name) => name === 'purchase')).toHaveLength(1);
  expect(JSON.stringify(first.payload)).not.toMatch(/@|cpf|cnpj/i);
});

test('a recurring renewal is not a new acquisition', () => {
  acceptAll();
  expect(shouldRecordAcquisition({ paid: true, signupId: 42, isRenewal: true })).toBe(false);
  expect(trackConfirmedPurchase({
    paid: true, signupId: 99, planCode: 'PLAN_02', isRenewal: true,
  }).sent).toBe(false);
  expect(trackConfirmedPurchase({ paid: true, signupId: 5, planCode: 'PLAN_TEST' }).sent).toBe(false);
  expect(names()).not.toContain('purchase');
});

test('rejecting optional cookies sends nothing and keeps the partner code', () => {
  window.sessionStorage.setItem('weper.partnerRef', 'ABC123');
  acceptAll();
  noteArrival('?utm_source=google&utm_medium=cpc&utm_campaign=search&ref=ABC123', '', 'www.weper.com.br');
  trackAnalyticsPageView('/', '?utm_source=google&utm_medium=cpc&utm_campaign=search&ref=ABC123');
  expect(last('page_view').has_partner_ref).toBe(true);
  expect(JSON.stringify(last('page_view'))).not.toContain('ABC123');
  expect(window.sessionStorage.getItem('weper.partnerRef')).toBe('ABC123');
  rejectOptional();
  delete window.dataLayer;
  expect(trackAnalyticsPageView('/').sent).toBe(false);
  expect(window.dataLayer).toBeUndefined();
  expect(window.localStorage.getItem('weper.analytics.visitor')).toBeNull();
  expect(window.localStorage.getItem('weper.analytics.campaign')).toBeNull();
  expect(window.sessionStorage.getItem('weper.partnerRef')).toBe('ABC123');
});

test('external tools stay unloaded without ids and are not duplicated', () => {
  acceptAll();
  trackAnalyticsPageView('/');
  const empty = maybeLoadProviders({
    hostname: 'www.weper.com.br',
    gtmId: '',
    clarityId: '',
  });
  expect(empty).toEqual({ gtm: false, clarity: false });
  expect(document.querySelector('script[src*="googletagmanager"], script[src*="clarity.ms"], script[src*="gtag/js"]')).toBeNull();

  const measurementId = maybeLoadProviders({
    hostname: 'www.weper.com.br',
    gtmId: 'G-TEST1234',
    clarityId: 'not valid',
  });
  expect(measurementId.gtm).toBe(false);

  const loaded = maybeLoadProviders({
    hostname: 'www.weper.com.br',
    gtmId: 'GTM-TEST123',
    clarityId: 'abcd1234',
  });
  expect(loaded).toEqual({ gtm: true, clarity: true });
  expect(document.querySelectorAll('#weper-gtm')).toHaveLength(1);
  expect(document.querySelector('#weper-gtm').async).toBe(true);
  expect(document.querySelector('script[src*="gtag/js"]')).toBeNull();
  maybeLoadProviders({
    hostname: 'www.weper.com.br',
    gtmId: 'GTM-TEST123',
    clarityId: 'abcd1234',
  });
  expect(document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')).toHaveLength(1);
  expect(document.querySelectorAll('script[src*="clarity.ms/tag/"]')).toHaveLength(1);

  document.getElementById('weper-gtm')?.remove();
  document.getElementById('weper-clarity')?.remove();
  delete window.clarity;
  expect(maybeLoadProviders({
    hostname: 'localhost',
    gtmId: 'GTM-TEST123',
    clarityId: 'abcd1234',
  })).toEqual({ gtm: false, clarity: false });
  expect(maybeLoadProviders({
    hostname: 'weper-staging-web.onrender.com',
    gtmId: 'GTM-TEST123',
    clarityId: 'abcd1234',
  })).toEqual({ gtm: false, clarity: false });
  expect(maybeLoadProviders({
    hostname: 'localhost',
    gtmId: '',
    clarityId: 'abcd1234',
    clarityEnabled: 'true',
  }).clarity).toBe(true);
});

test('campaigns distinguish ads, organic referrers and direct visits', () => {
  expect(classifyReferrer('', 'www.weper.com.br').channel).toBe('direct');
  expect(classifyReferrer('https://l.instagram.com/p/1', 'www.weper.com.br').channel).toBe('instagram_organic');
  expect(classifyReferrer('https://www.google.com/search', 'www.weper.com.br').channel).toBe('google');
  expect(classifyReferrer('https://www.weper.com.br/privacy', 'www.weper.com.br')).toBeNull();
  acceptAll();
  noteArrival('?utm_source=instagram&utm_medium=paid_social&utm_campaign=black_friday', 'https://www.google.com/', 'www.weper.com.br');
  noteArrival('?utm_source=google&utm_medium=cpc&utm_campaign=search', '', 'www.weper.com.br');
  trackWhatsAppClick('/');
  expect(last('whatsapp_click')).toEqual(expect.objectContaining({
    first_channel: 'instagram_ads',
    channel: 'google_ads',
    utm_campaign: 'search',
  }));
  const leaked = track('generate_lead', { form_id: 'comercial', email: 'maria@example.com', phone: '11999999999', name: 'Maria', whatsapp: '11988887777' });
  expect(leaked.sent).toBe(true);
  expect(leaked.payload.form_id).toBe('comercial');
  expect(leaked.payload.email).toBeUndefined();
  expect(leaked.payload.phone).toBeUndefined();
  expect(leaked.payload.name).toBeUndefined();
  expect(leaked.payload.whatsapp).toBeUndefined();
  expect(JSON.stringify(leaked.payload)).not.toContain('maria@example.com');
  const opened = trackSubscriptionModalOpened('PLAN_02');
  expect(opened.payload).toEqual(expect.objectContaining({ plan_id: 'PLAN_02', currency: 'BRL' }));
  expect(JSON.stringify(opened.payload)).not.toMatch(/98888|maria@/);
  const withPlan = trackGenerateLead('subscription_modal', 'PLAN_01');
  expect(withPlan.payload).toEqual(expect.objectContaining({ form_id: 'subscription_modal', plan_id: 'PLAN_01', value: 39.9 }));
  expect(withPlan.payload.whatsapp).toBeUndefined();
});

test('analytics does not run on the store menu or the logged-in panel', () => {
  acceptAll();
  expect(track('page_view', { page_path: '/delivery/minions' }, { pathname: '/delivery/minions' }).reason).toBe('path');
  expect(track('page_view', { page_path: '/app/atendimento' }, { pathname: '/app/atendimento' }).reason).toBe('path');
  expect(window.dataLayer).toBeUndefined();
});
