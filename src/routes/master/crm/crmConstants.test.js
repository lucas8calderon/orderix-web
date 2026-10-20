import {
  adjacentStatus,
  deadlineIndicator,
  deadlineStateFromDue,
  followUpDelayLabel,
  followUpState,
  formatCountdown,
  phoneContactLabel,
} from './crmConstants';
import { buildInstagramUrl, instagramHandle } from './instagram';
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

  it('formata atraso em dias (fallback sem activeAction)', () => {
    expect(followUpDelayLabel({ nextContactAt: '2026-09-20T10:00:00' }, now)).toContain('Atrasado');
    expect(followUpDelayLabel({ nextContactAt: '2026-09-22T10:00:00' }, now)).toContain('Atrasado');
    expect(followUpDelayLabel({ nextContactAt: '2026-09-22T14:00:00' }, now)).toContain('Vence em');
    expect(followUpDelayLabel({ nextContactAt: '2026-09-25T10:00:00' }, now)).toContain('Vence em');
  });
});

describe('crm deadline indicators', () => {
  const now = new Date('2026-10-20T12:00:00');

  it('classifica on-time, due-soon e overdue', () => {
    expect(deadlineStateFromDue('2026-10-20T20:00:00', now)).toBe('ON_TIME');
    expect(deadlineStateFromDue('2026-10-20T14:00:00', now)).toBe('DUE_SOON');
    expect(deadlineStateFromDue('2026-10-20T11:00:00', now)).toBe('OVERDUE');
  });

  it('monta countdown e badge a partir da ação ativa', () => {
    expect(formatCountdown('2026-10-20T15:00:00', now)).toBe('Vence em 3h');
    expect(formatCountdown('2026-10-20T10:00:00', now)).toBe('Atrasado há 2h');
    const badge = deadlineIndicator({
      status: 'NEW',
      deadlineState: 'OVERDUE',
      activeAction: { dueAt: '2026-10-20T10:00:00', actionTypeLabel: 'Primeiro contato' },
    }, now);
    expect(badge.tone).toBe('overdue');
    expect(badge.cardClass).toBe('is-overdue');
    expect(badge.label).toContain('Primeiro contato');
  });
});

describe('adjacentStatus', () => {
  it('avança e recua no funil', () => {
    expect(adjacentStatus('NEW', 1)).toBe('CONTACTED');
    expect(adjacentStatus('CONTACTED', -1)).toBe('NEW');
    expect(adjacentStatus('NEW', -1)).toBe('NO_WHATSAPP');
    expect(adjacentStatus('NO_WHATSAPP', -1)).toBeNull();
    expect(adjacentStatus('LOST', 1)).toBeNull();
  });
});

describe('phoneContactLabel', () => {
  it('não assume WhatsApp só porque o Google devolveu telefone', () => {
    expect(phoneContactLabel({})).toBe('Telefone não disponível');
    expect(phoneContactLabel({ phone: '5512999998888' })).toBe('Telefone disponível');
    expect(phoneContactLabel({ phone: '5512999998888', phoneWhatsAppConfirmed: true })).toBe('WhatsApp confirmado');
  });
});

describe('instagram', () => {
  it('monta o perfil a partir de @, usuário ou URL', () => {
    expect(instagramHandle('@cabanaburger')).toBe('cabanaburger');
    expect(buildInstagramUrl('cabanaburger')).toBe('https://www.instagram.com/cabanaburger/');
    expect(buildInstagramUrl('https://www.instagram.com/cabana.burger/')).toBe('https://www.instagram.com/cabana.burger/');
    expect(buildInstagramUrl('instagram.com/weper.com.br')).toBe('https://www.instagram.com/weper.com.br/');
  });

  it('não abre contato sem perfil válido', () => {
    expect(buildInstagramUrl('')).toBeNull();
    expect(buildInstagramUrl('https://site.com/foo')).toBeNull();
    expect(buildInstagramUrl('não é instagram')).toBeNull();
  });
});

describe('whatsapp template', () => {
  it('monta link oficial só com o número', () => {
    expect(whatsAppDigits('(11) 99999-8888')).toBe('5511999998888');
    expect(buildWhatsAppUrl('11999998888')).toBe('https://wa.me/5511999998888');
  });
});
