import { adjacentStatus, followUpDelayLabel, followUpState } from './crmConstants';
import { buildWhatsAppUrl, whatsAppDigits } from './whatsappTemplate';

describe('crm follow-up indicators', () => {
  const now = new Date('2026-09-22T12:00:00');

  it('marca atrasado, hoje e sem próximo contato', () => {
    expect(followUpState({ nextContactAt: '2026-09-20T10:00:00' }, now)).toBe('OVERDUE');
    expect(followUpState({ nextContactAt: '2026-09-22T18:00:00' }, now)).toBe('TODAY');
    expect(followUpState({ nextContactAt: '2026-09-24T10:00:00' }, now)).toBe('UPCOMING');
    expect(followUpState({}, now)).toBe('MISSING');
    expect(followUpState({ status: 'WON', nextContactAt: '2026-09-20T10:00:00' }, now)).toBe('NONE');
  });

  it('formata atraso em dias', () => {
    expect(followUpDelayLabel({ nextContactAt: '2026-09-20T10:00:00' }, now)).toBe('Retorno atrasado há 2 dias');
    expect(followUpDelayLabel({ nextContactAt: '2026-09-21T10:00:00' }, now)).toBe('Retorno atrasado há 1 dia');
    expect(followUpDelayLabel({ nextContactAt: '2026-09-22T10:00:00' }, now)).toBe('Retornar hoje às 10:00');
    expect(followUpDelayLabel({ nextContactAt: '2026-09-25T10:00:00' }, now)).toBe('Retorno 25/09 às 10:00');
  });
});

describe('adjacentStatus', () => {
  it('avança e recua no funil', () => {
    expect(adjacentStatus('NEW', 1)).toBe('CONTACTED');
    expect(adjacentStatus('CONTACTED', -1)).toBe('NEW');
    expect(adjacentStatus('NEW', -1)).toBeNull();
    expect(adjacentStatus('LOST', 1)).toBeNull();
  });
});

describe('whatsapp template', () => {
  it('monta link oficial sem enviar a mensagem', () => {
    expect(whatsAppDigits('(11) 99999-8888')).toBe('5511999998888');
    const url = buildWhatsAppUrl('11999998888');
    expect(url.startsWith('https://wa.me/5511999998888?text=')).toBe(true);
    expect(url).toContain(encodeURIComponent('Sou da Weper'));
    expect(url).toContain(encodeURIComponent('Posso te explicar rapidamente como funciona?'));
  });
});
