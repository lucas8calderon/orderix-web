import {
  columnOf,
  compareUrgency,
  formatWhen,
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

  it('formata a data de cadastro mesmo com fração longa de segundos', () => {
    expect(formatWhen('2026-10-29T01:29:12.123456789')).toMatch(/29\/10\/2026/);
    expect(formatWhen([2026, 10, 29, 1, 29, 12])).toMatch(/29\/10\/2026/);
    expect(formatWhen(null)).toBe('—');
  });

  it('copiar e abrir não têm rótulo de registro de contato', () => {
    expect(registerLabel('NEW')).toBe('Registrar contato realizado');
    expect(registerLabel('WON')).toBe('');
  });
});
