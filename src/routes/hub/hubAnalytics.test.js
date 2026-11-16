import { track } from '../../analytics/analyticsService';
import {
  HUB_EVENTS,
  trackHubPageView,
  trackHubLinkClick,
  trackHubModalOpen,
  trackHubDemoClick,
  trackHubSegmentClick,
  trackHubSegmentDemoClick,
} from './hubAnalytics';

jest.mock('../../analytics/analyticsService');

describe('hubAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('HUB_EVENTS', () => {
    it('define eventos do Hub', () => {
      expect(HUB_EVENTS.PAGE_VIEW).toBe('hub_page_view');
      expect(HUB_EVENTS.LINK_CLICK).toBe('hub_link_click');
      expect(HUB_EVENTS.MODAL_OPEN).toBe('hub_modal_open');
      expect(HUB_EVENTS.DEMO_CLICK).toBe('hub_demo_click');
      expect(HUB_EVENTS.WHATSAPP_CLICK).toBe('hub_whatsapp_click');
      expect(HUB_EVENTS.PLANS_CLICK).toBe('hub_plans_click');
      expect(HUB_EVENTS.PARTNER_CLICK).toBe('hub_partner_click');
      expect(HUB_EVENTS.SEGMENT_CLICK).toBe('hub_segment_click');
      expect(HUB_EVENTS.SEGMENT_DEMO_CLICK).toBe('hub_segment_demo_click');
    });
  });

  describe('trackHubPageView', () => {
    it('rastreia visualização da página', () => {
      trackHubPageView();
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.PAGE_VIEW,
        expect.objectContaining({
          page_path: '/links',
          page_title: 'Weper | Links Oficiais',
        }),
        expect.objectContaining({
          pathname: '/links',
          dedupKey: 'hub_page_view',
        })
      );
    });
  });

  describe('trackHubLinkClick', () => {
    it('inclui o segmento no clique de Conhecer a Weper', () => {
      trackHubLinkClick('conhecer-weper', 'Conhecer a Weper', '/', { segment_id: 'lanchonetes' });
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.LINK_CLICK,
        expect.objectContaining({
          link_id: 'conhecer-weper',
          link_name: 'Conhecer a Weper',
          destination_url: '/',
          segment_id: 'lanchonetes',
        }),
        expect.objectContaining({ pathname: '/links' })
      );
      expect(track).toHaveBeenCalledTimes(1);
    });

    it('rastreia clique genérico em link', () => {
      trackHubLinkClick('funcionalidades', 'Funcionalidades', '/#funcionalidades');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.LINK_CLICK,
        expect.objectContaining({
          link_id: 'funcionalidades',
          link_name: 'Funcionalidades',
          destination_url: '/#funcionalidades',
        }),
        expect.objectContaining({ pathname: '/links' })
      );
    });

    it('rastreia clique no WhatsApp com evento específico', () => {
      trackHubLinkClick('whatsapp', 'WhatsApp', 'https://wa.me/...');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.WHATSAPP_CLICK,
        expect.objectContaining({
          link_id: 'whatsapp',
          link_name: 'WhatsApp',
        }),
        expect.any(Object)
      );
    });

    it('rastreia clique em planos com evento específico', () => {
      trackHubLinkClick('planos', 'Planos', '/#plans');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.PLANS_CLICK,
        expect.objectContaining({
          link_id: 'planos',
          link_name: 'Planos',
        }),
        expect.any(Object)
      );
    });

    it('rastreia clique em parceiros com evento específico', () => {
      trackHubLinkClick('parceiros', 'Parceiros', '/parceiros');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.PARTNER_CLICK,
        expect.objectContaining({
          link_id: 'parceiros',
          link_name: 'Parceiros',
        }),
        expect.any(Object)
      );
    });
  });

  describe('trackHubModalOpen', () => {
    it('rastreia abertura de modal', () => {
      trackHubModalOpen('demonstrations');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.MODAL_OPEN,
        expect.objectContaining({
          modal_type: 'demonstrations',
          page_path: '/links',
        }),
        expect.objectContaining({ pathname: '/links' })
      );
    });
  });

  describe('trackHubSegmentClick', () => {
    it('rastreia o segmento sem destino de demonstração', () => {
      trackHubSegmentClick('lanchonetes');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.SEGMENT_CLICK,
        expect.objectContaining({
          segment_id: 'lanchonetes',
          page_path: '/links',
        }),
        expect.objectContaining({ pathname: '/links' })
      );
      expect(track).toHaveBeenCalledTimes(1);
    });
  });

  describe('trackHubSegmentDemoClick', () => {
    it('rastreia a abertura da demonstração sem duplicar o clique genérico', () => {
      trackHubSegmentDemoClick('hamburguerias', '/demo/weper-burger');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.SEGMENT_DEMO_CLICK,
        expect.objectContaining({
          segment_id: 'hamburguerias',
          destination_url: '/demo/weper-burger',
          page_path: '/links',
        }),
        expect.objectContaining({ pathname: '/links' })
      );
      expect(track).not.toHaveBeenCalledWith(
        HUB_EVENTS.SEGMENT_CLICK,
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('trackHubDemoClick', () => {
    it('rastreia clique em demonstração', () => {
      trackHubDemoClick('weper-burger', 'Hamburgueria', '/demo/weper-burger');
      expect(track).toHaveBeenCalledWith(
        HUB_EVENTS.DEMO_CLICK,
        expect.objectContaining({
          link_id: 'weper-burger',
          link_name: 'Hamburgueria',
          destination_url: '/demo/weper-burger',
        }),
        expect.objectContaining({ pathname: '/links' })
      );
    });
  });
});
