import {
  renderInstagramLead,
  renderInstagramTemplate,
  selectInstagramTemplate,
} from './instagramTemplate';

describe('instagramTemplate', () => {
  const lead = {
    businessName: 'Minions Burger',
    contactName: 'Maria',
    businessType: 'HAMBURGER',
    instagramUsername: 'minions.burger',
    website: 'https://minions.example',
  };

  it('escolhe o modelo pelo tipo de lead', () => {
    expect(selectInstagramTemplate('ESTABLISHMENT')).toContain('sem comissão da Weper');
    expect(selectInstagramTemplate(null)).toContain('sem comissão da Weper');
    expect(selectInstagramTemplate('INFLUENCER')).toContain('parceria de indicação');
    expect(selectInstagramTemplate('ESTABLISHMENT', { establishmentMessage: 'texto salvo' })).toBe('texto salvo');
  });

  it('substitui variáveis e não deixa placeholder vazio', () => {
    const message = renderInstagramLead('ESTABLISHMENT', {}, lead);
    expect(message).toContain('Olá, Maria!');
    expect(message).toContain('de Hamburgueria');
    expect(message).toContain('@minions.burger');
    expect(message).toContain('A Minions Burger pode vender pelo próprio canal.');
    expect(message).toContain('https://minions.example');
    expect(message).not.toContain('{{');
  });

  it('remove trechos sem valor de forma legível', () => {
    const message = renderInstagramLead('INFLUENCER', {}, {
      businessName: 'Ana Souza',
      instagramUsername: 'ana.indica',
      businessType: 'OTHER',
    });
    expect(message.startsWith('Olá!')).toBe(true);
    expect(message).not.toContain('Olá,');
    expect(message).toContain('com @ana.indica');
    expect(message).not.toContain('{{');
    expect(message).not.toContain('Outros');
    expect(renderInstagramTemplate('Olá, {{nome}}!', {})).toBe('Olá!');
  });
});
