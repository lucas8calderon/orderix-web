import {
  FINAL_TRACKING_STATUSES,
  formatEstimateWindow,
  formatPaymentLabel,
  getCurrentStatusCard,
  getTrackingSteps,
  isFinalTrackingStatus,
  STEP_STATE,
  TRACKING_STATUS,
} from './orderTrackingConfig';

describe('orderTrackingConfig', () => {
  describe('getTrackingSteps PICKUP', () => {
    const base = {
      fulfillment: 'PICKUP',
      storeName: 'Minions',
      statusHistory: [
        { status: 'RECEIVED', at: '2026-09-20T12:32:00' },
        { status: 'IN_PREPARATION', at: '2026-09-20T12:35:00' },
      ],
    };

    it('RECEIVED: current no primeiro passo', () => {
      const steps = getTrackingSteps({ ...base, trackingStatus: 'RECEIVED' });
      expect(steps.map((s) => s.id)).toEqual(['RECEIVED', 'IN_PREPARATION', 'READY', 'DELIVERED']);
      expect(steps[0].state).toBe(STEP_STATE.CURRENT);
      expect(steps[1].state).toBe(STEP_STATE.PENDING);
      expect(steps[0].timestamp).toMatch(/\d{2}:\d{2}/);
    });

    it('IN_PREPARATION: completed + current', () => {
      const steps = getTrackingSteps({ ...base, trackingStatus: 'IN_PREPARATION' });
      expect(steps[0].state).toBe(STEP_STATE.COMPLETED);
      expect(steps[1].state).toBe(STEP_STATE.CURRENT);
      expect(steps[2].state).toBe(STEP_STATE.PENDING);
    });

    it('READY: destaca pronto para retirada', () => {
      const steps = getTrackingSteps({ ...base, trackingStatus: 'READY' });
      expect(steps[2].state).toBe(STEP_STATE.CURRENT);
      expect(steps[2].label).toBe('Pronto para retirada');
      const card = getCurrentStatusCard({ ...base, trackingStatus: 'READY' });
      expect(card.title).toMatch(/pronto/i);
      expect(card.emphasize).toBe(true);
    });

    it('DELIVERED: todos completed e card de retirado', () => {
      const steps = getTrackingSteps({ ...base, trackingStatus: 'DELIVERED' });
      expect(steps.every((s) => s.state === STEP_STATE.COMPLETED)).toBe(true);
      const card = getCurrentStatusCard({ ...base, trackingStatus: 'DELIVERED' });
      expect(card.title).toBe('Pedido retirado');
      expect(isFinalTrackingStatus('DELIVERED')).toBe(true);
    });
  });

  describe('getTrackingSteps DELIVERY', () => {
    const base = { fulfillment: 'DELIVERY', storeName: 'Loja' };

    it('inclui OUT_FOR_DELIVERY', () => {
      const steps = getTrackingSteps({ ...base, trackingStatus: 'READY' });
      expect(steps.map((s) => s.id)).toEqual([
        'RECEIVED',
        'IN_PREPARATION',
        'READY',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
      ]);
      expect(steps[2].state).toBe(STEP_STATE.CURRENT);
    });

    it('OUT_FOR_DELIVERY enfatiza a caminho', () => {
      const card = getCurrentStatusCard({ ...base, trackingStatus: 'OUT_FOR_DELIVERY' });
      expect(card.title).toMatch(/caminho/i);
      expect(card.emphasize).toBe(true);
      const steps = getTrackingSteps({ ...base, trackingStatus: 'OUT_FOR_DELIVERY' });
      expect(steps[3].state).toBe(STEP_STATE.CURRENT);
    });

    it('DELIVERED final', () => {
      const card = getCurrentStatusCard({ ...base, trackingStatus: 'DELIVERED' });
      expect(card.title).toBe('Pedido entregue');
      expect(FINAL_TRACKING_STATUSES.has(TRACKING_STATUS.DELIVERED)).toBe(true);
    });
  });

  it('CANCELLED não monta timeline e usa card específico', () => {
    const order = { fulfillment: 'PICKUP', trackingStatus: 'CANCELLED' };
    expect(getTrackingSteps(order)).toEqual([]);
    const card = getCurrentStatusCard(order);
    expect(card.title).toBe('Pedido cancelado');
    expect(isFinalTrackingStatus('CANCELLED')).toBe(true);
  });

  it('formatEstimateWindow e fallback de pagamento', () => {
    expect(formatEstimateWindow('2026-09-20T12:50:00', '2026-09-20T13:00:00')).toMatch(/–/);
    expect(formatEstimateWindow(null, null)).toBeNull();
    expect(formatPaymentLabel('PIX', 'PICKUP')).toBe('PIX na retirada');
    expect(formatPaymentLabel('CREDIT', 'DELIVERY')).toBe('Crédito na entrega');
  });
});
