import {
  columnOf,
  compareUrgency,
  registerLabel,
  renderProspectMessage,
} from './instagramCrm';

describe('instagram CRM', () => {
  it('agrupa etapas antigas nas colunas novas', () => {
    expect(columnOf('INTERESTED')).toBe('NEGOTIATING');
    expect(columnOf('DEMO')).toBe('NEGOTIATING');
    expect(columnOf('NO_WHATSAPP')).toBe('NEW');
    expect(columnOf('WAITING_RESPONSE')).toBe('WAITING_RESPONSE');
  });

  it('substitui nome e instagram sem alterar o restante', () => {
    expect(renderProspectMessage('Oi {nome} ({instagram})', 'Ana', '@ana')).toBe('Oi Ana (@ana)');
  });

  it('ordena o prazo vencido antes do prazo futuro', () => {
    const overdue = { prospectTone: 'OVERDUE', nextContactAt: '2026-10-29T10:00:00' };
    const soon = { prospectTone: 'DUE_SOON', nextContactAt: '2026-10-28T10:00:00' };
    expect(compareUrgency(overdue, soon)).toBeLessThan(0);
  });

  it('copiar e abrir não têm rótulo de registro de contato', () => {
    expect(registerLabel('NEW')).toBe('Registrar contato realizado');
    expect(registerLabel('WON')).toBe('');
  });
});
