import { statusChartRows } from './crmStatusChart';

describe('statusChartRows', () => {
  it('monta uma barra por status, inclusive sem WhatsApp', () => {
    const rows = statusChartRows({
      noWhatsApp: 2,
      newLeads: 4,
      contacted: 0,
      won: 1,
      lost: 1,
    });
    expect(rows.map((row) => row.id)).toEqual([
      'NO_WHATSAPP', 'NEW', 'CONTACTED', 'WAITING_RESPONSE', 'INTERESTED', 'DEMO', 'PROPOSAL', 'WON', 'LOST',
    ]);
    expect(rows.find((row) => row.id === 'NO_WHATSAPP')).toMatchObject({ name: 'Sem WhatsApp', value: 2, share: 25 });
    expect(rows.find((row) => row.id === 'NEW').share).toBe(50);
    expect(rows.find((row) => row.id === 'CONTACTED').value).toBe(0);
  });

  it('fica zerado quando não há prospecção', () => {
    const rows = statusChartRows(null);
    expect(rows.every((row) => row.value === 0 && row.share === 0)).toBe(true);
  });
});
