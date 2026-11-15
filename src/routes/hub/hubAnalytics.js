/**
 * Analytics centralizado do Weper Hub.
 * Integra-se ao sistema existente de analytics da Weper.
 */
import { track } from '../../analytics/analyticsService';

/**
 * Eventos do Hub
 */
export const HUB_EVENTS = {
  PAGE_VIEW: 'hub_page_view',
  LINK_CLICK: 'hub_link_click',
  MODAL_OPEN: 'hub_modal_open',
  DEMO_CLICK: 'hub_demo_click',
  WHATSAPP_CLICK: 'hub_whatsapp_click',
  PLANS_CLICK: 'hub_plans_click',
  PARTNER_CLICK: 'hub_partner_click',
};

/**
 * Rastreia acesso ao Hub
 */
export function trackHubPageView() {
  return track(HUB_EVENTS.PAGE_VIEW, {
    page_path: '/links',
    page_title: 'Weper | Links Oficiais',
  }, { pathname: '/links', dedupKey: 'hub_page_view' });
}

/**
 * Rastreia clique em card de link
 */
export function trackHubLinkClick(linkId, linkName, destinationUrl) {
  const params = {
    link_id: linkId,
    link_name: linkName,
    page_path: '/links',
  };

  if (destinationUrl) {
    params.destination_url = destinationUrl;
  }

  // Eventos específicos para links estratégicos
  let eventName = HUB_EVENTS.LINK_CLICK;

  if (linkId === 'whatsapp') {
    eventName = HUB_EVENTS.WHATSAPP_CLICK;
  } else if (linkId === 'planos') {
    eventName = HUB_EVENTS.PLANS_CLICK;
  } else if (linkId === 'parceiros') {
    eventName = HUB_EVENTS.PARTNER_CLICK;
  }

  return track(eventName, params, { pathname: '/links' });
}

/**
 * Rastreia abertura de modal
 */
export function trackHubModalOpen(modalType) {
  return track(HUB_EVENTS.MODAL_OPEN, {
    modal_type: modalType,
    page_path: '/links',
  }, { pathname: '/links' });
}

/**
 * Rastreia clique em demonstração
 */
export function trackHubDemoClick(demoId, demoName, destinationUrl) {
  return track(HUB_EVENTS.DEMO_CLICK, {
    link_id: demoId,
    link_name: demoName,
    destination_url: destinationUrl,
    page_path: '/links',
  }, { pathname: '/links' });
}

/**
 * Registra evento antes da navegação externa
 * Usa sendBeacon quando disponível para garantir envio
 */
export function trackBeforeNavigation(eventFn) {
  try {
    eventFn();
    // Pequeno atraso para garantir que o evento seja enviado
    return new Promise((resolve) => setTimeout(resolve, 50));
  } catch {
    return Promise.resolve();
  }
}
