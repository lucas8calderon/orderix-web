/** Espelha CrmInstagramMessageRenderer no backend. */

export const DEFAULT_ESTABLISHMENT_TEMPLATE = `Olá{{#nome}}, {{nome}}{{/nome}}!

Somos a Weper. Ajudamos estabelecimentos{{#segmento}} de {{segmento}}{{/segmento}} com delivery próprio, cardápio digital, mesas, garçom, cozinha e estoque — sem comissão da Weper sobre as vendas.

{{#instagram}}Vi o perfil {{instagram}}. {{/instagram}}{{#empresa}}A {{empresa}} pode vender pelo próprio canal. {{/empresa}}Posso te mostrar como funciona? Sem compromisso.
www.weper.com.br{{#site}}
{{site}}{{/site}}`;

export const DEFAULT_INFLUENCER_TEMPLATE = `Olá{{#nome}}, {{nome}}{{/nome}}!

Somos a Weper, plataforma de gestão para food service: pedidos, delivery próprio e cardápio, sem comissão sobre as vendas do estabelecimento.

Queremos uma parceria de indicação{{#instagram}} com {{instagram}}{{/instagram}}. Você indica restaurantes e, quando a indicação vira cliente, há benefícios comerciais a combinar.

{{#empresa}}A parceria é com {{empresa}}. {{/empresa}}Posso te enviar as condições? Sem compromisso.
www.weper.com.br{{#site}}
{{site}}{{/site}}`;

const SEGMENT_LABELS = {
  HAMBURGER: 'Hamburgueria',
  PIZZA: 'Pizzaria',
  RESTAURANT: 'Restaurante',
  WINE_SHOP: 'Adega',
  BAR: 'Bar',
  SNACK_BAR: 'Lanchonete',
  COFFEE_SHOP: 'Cafeteria',
  BAKERY: 'Padaria',
  FOOD_TRUCK: 'Food Truck',
  MARKET: 'Mercado',
  CONVENIENCE: 'Conveniência',
};

export function selectInstagramTemplate(kind, templates = {}) {
  if (kind === 'INFLUENCER') {
    return blank(templates.influencerMessage) || DEFAULT_INFLUENCER_TEMPLATE;
  }
  return blank(templates.establishmentMessage) || DEFAULT_ESTABLISHMENT_TEMPLATE;
}

export function instagramVariables(lead) {
  const values = {};
  const nome = readable(lead?.contactName, 2);
  const empresa = readable(lead?.businessName, 2);
  const instagram = instagramValue(lead);
  const segmento = lead?.businessType && lead.businessType !== 'OTHER'
    ? (lead.businessTypeLabel || SEGMENT_LABELS[lead.businessType] || '')
    : '';
  const site = siteValue(lead?.website);
  if (nome) values.nome = nome;
  if (instagram) values.instagram = instagram;
  if (segmento) values.segmento = segmento;
  if (empresa) values.empresa = empresa;
  if (site) values.site = site;
  return values;
}

export function renderInstagramTemplate(template, leadOrValues) {
  const values = leadOrValues && (leadOrValues.businessName !== undefined || leadOrValues.leadKind || leadOrValues.instagram || leadOrValues.instagramUsername)
    ? instagramVariables(leadOrValues)
    : { ...(leadOrValues || {}) };
  let text = String(template || '');
  text = text.replace(/\{\{#([A-Za-z]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => (
    values[key.toLowerCase()] ? inner : ''
  ));
  Object.entries(values).forEach(([key, value]) => {
    text = text.split(`{{${key}}}`).join(value);
  });
  text = text.replace(/\{\{[#/]?[A-Za-z]+\}\}/g, '');
  return cleanup(text);
}

export function renderInstagramLead(kind, templates, lead) {
  return renderInstagramTemplate(selectInstagramTemplate(kind, templates), lead);
}

function instagramValue(lead) {
  const username = String(lead?.instagramUsername || '')
    .replace(/^@/, '')
    .trim()
    .toLowerCase();
  if (/^[a-z0-9._]{1,30}$/.test(username)) return `@${username}`;
  return '';
}

function siteValue(website) {
  const value = String(website || '').trim();
  if (value.length < 4 || value.length > 200 || /\s/.test(value) || value.includes('{{')) return '';
  const lower = value.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('file:')) return '';
  if (/^https?:\/\/[\w.-]+\.[a-z]{2,}/i.test(value) || /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)) return value;
  return '';
}

function readable(raw, min) {
  const value = String(raw || '').trim().replace(/\s+/g, ' ');
  if (value.length < min || value.includes('{{')) return '';
  return /[0-9A-Za-zÀ-ÿ]/.test(value) ? value : '';
}

function blank(value) {
  const text = String(value || '').trim();
  return text || '';
}

function cleanup(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ (?=[,.;:!?])/g, '')
    .replace(/,\s*([!?.])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\sde\s+com\b/g, ' com')
    .replace(/^[ \t]+/gm, '')
    .replace(/[ \t]+(?=\n)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*[.,;:!-]+\s*$\n?/gm, '')
    .trim();
}
