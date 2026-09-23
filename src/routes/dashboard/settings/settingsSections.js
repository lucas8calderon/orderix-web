import { PATHS } from '../../../services/accessControl';

/** Grupos do hub. Formulários continuam nas rotas já existentes. */
export const SETTINGS_GROUPS = [
  { id: 'geral', label: 'Visão Geral', shortLabel: 'Geral' },
  { id: 'operacao', label: 'Operação', shortLabel: 'Operação' },
  { id: 'vendas', label: 'Vendas e Pagamentos', shortLabel: 'Pagamentos' },
  { id: 'canais', label: 'Canais e Delivery', shortLabel: 'Canais' },
  { id: 'cardapio', label: 'Cardápio e Estoque', shortLabel: 'Cardápio' },
  { id: 'equipe', label: 'Equipe', shortLabel: 'Equipe' },
  { id: 'empresa', label: 'Empresa', shortLabel: 'Empresa' },
];

/** Rotas editáveis e atalhos. URLs antigas continuam válidas. */
export const SETTINGS_SECTIONS = [
  { id: 'geral', label: 'Visão Geral', shortLabel: 'Geral' },
  { id: 'operacao', label: 'Operação', shortLabel: 'Operação' },
  { id: 'horarios', label: 'Horários', shortLabel: 'Horários' },
  { id: 'taxas', label: 'Taxas e Regras', shortLabel: 'Taxas' },
  { id: 'vendas', label: 'Vendas e Pagamentos', shortLabel: 'Pagamentos' },
  { id: 'pagamentos', label: 'Pedidos e pagamentos', shortLabel: 'Pagamentos' },
  { id: 'canais', label: 'Canais e Delivery', shortLabel: 'Canais' },
  { id: 'delivery', label: 'Delivery', shortLabel: 'Delivery' },
  { id: 'cardapio', label: 'Cardápio e Estoque', shortLabel: 'Cardápio' },
  { id: 'cardapio-digital', label: 'Cardápio Digital (QR)', shortLabel: 'Cardápio' },
  { id: 'equipe', label: 'Equipe', shortLabel: 'Equipe' },
  { id: 'permissoes', label: 'Equipe e Permissões', shortLabel: 'Equipe' },
  { id: 'empresa', label: 'Empresa', shortLabel: 'Empresa' },
  { id: 'integracoes', label: 'Integrações', shortLabel: 'Integrações' },
  { id: 'aparencia', label: 'Aparência', shortLabel: 'Aparência' },
];

/** Atalhos da sidebar. Só aparece com Configurações aberto. */
export const SETTINGS_SIDEBAR = [
  { id: 'geral', label: 'Visão Geral' },
  { id: 'horarios', label: 'Horários' },
  { id: 'pagamentos', label: 'Pagamentos' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'cardapio-digital', label: 'Cardápio Digital' },
  { id: 'taxas', label: 'Taxas e Regras' },
  { id: 'permissoes', label: 'Equipe e Permissões' },
  { id: 'empresa', label: 'Empresa' },
  { id: 'integracoes', label: 'Integrações' },
  { id: 'aparencia', label: 'Aparência' },
];

const GROUP_BY_SECTION = {
  geral: 'geral',
  operacao: 'operacao',
  horarios: 'operacao',
  taxas: 'operacao',
  vendas: 'vendas',
  pagamentos: 'vendas',
  canais: 'canais',
  delivery: 'canais',
  cardapio: 'cardapio',
  'cardapio-digital': 'cardapio',
  equipe: 'equipe',
  permissoes: 'equipe',
  empresa: 'empresa',
  integracoes: 'vendas',
  aparencia: 'empresa',
};

export function sectionGroup(sectionId) {
  return GROUP_BY_SECTION[sectionId] || DEFAULT_SETTINGS_SECTION;
}

export const DEFAULT_SETTINGS_SECTION = 'geral';

export const SETTINGS_SEARCH = [
  { id: 'pix', title: 'Formas de pagamento', hint: 'Pix, débito, crédito e dinheiro', section: 'vendas', terms: ['pix', 'pagamento', 'dinheiro', 'cartao', 'cartão', 'debito', 'débito', 'credito', 'crédito', 'vale'] },
  { id: 'mp', title: 'Mercado Pago', hint: 'Pix e cartão online do Delivery', section: 'vendas', terms: ['mercado pago', 'mercadopago', 'webhook', 'access token'] },
  { id: 'infinite', title: 'InfinitePay', hint: 'Pagamento integrado no salão', section: 'vendas', terms: ['infinitepay', 'infinite', 'maquininha'] },
  { id: 'horarios', title: 'Horários de funcionamento', hint: 'Dias e turnos da loja', section: 'horarios', terms: ['horario', 'horário', 'aberto', 'fechado', 'turno'] },
  { id: 'cobranca', title: 'Regras de cobrança', hint: 'Balcão, mesa e comanda', section: 'vendas', terms: ['balcao', 'balcão', 'mesa', 'comanda', 'cozinha', 'cobranca', 'cobrança'] },
  { id: 'taxa-servico', title: 'Taxa de serviço', hint: 'Percentual do salão', section: 'operacao', terms: ['taxa de servico', 'taxa de serviço', 'serviço', 'servico', '10%'] },
  { id: 'delivery', title: 'Delivery', hint: 'Entrega, retirada, taxa e pedido mínimo', section: 'delivery', terms: ['delivery', 'entrega', 'retirada', 'taxa entrega', 'pedido minimo', 'pedido mínimo'] },
  { id: 'cardapio', title: 'Cardápio digital', hint: 'Publicação, link e QR Code', section: 'cardapio-digital', terms: ['cardapio', 'cardápio', 'qr', 'qr code', 'publicado'] },
  { id: 'estoque', title: 'Estoque', hint: 'Abre o módulo de estoque', section: 'cardapio', terms: ['estoque', 'indisponivel', 'indisponível'] },
  { id: 'equipe', title: 'Equipe e permissões', hint: 'Perfis Admin, garçom, cozinha e caixa', section: 'permissoes', terms: ['garcom', 'garçom', 'permiss', 'equipe', 'caixa', 'cozinha', 'admin'] },
  { id: 'empresa', title: 'Dados da empresa', hint: 'Nome, CNPJ, telefone e logo', section: 'empresa', terms: ['cnpj', 'empresa', 'telefone', 'logo', 'logotipo'] },
  { id: 'aparencia', title: 'Aparência', hint: 'Logo na empresa e banner no Delivery', section: 'aparencia', terms: ['banner', 'aparencia', 'aparência', 'capa', 'logo'] },
];

export function searchSettings(query) {
  const normalized = String(query || '').trim().toLowerCase();
  if (normalized.length < 2) return [];
  return SETTINGS_SEARCH.filter((entry) => (
    entry.title.toLowerCase().includes(normalized)
    || entry.terms.some((term) => term.includes(normalized) || normalized.includes(term))
  ));
}

const SECTION_IDS = new Set(SETTINGS_SECTIONS.map((s) => s.id));

export function isValidSettingsSection(id) {
  return SECTION_IDS.has(id);
}

export function settingsSectionPath(sectionId = DEFAULT_SETTINGS_SECTION) {
  const id = isValidSettingsSection(sectionId) ? sectionId : DEFAULT_SETTINGS_SECTION;
  return `${PATHS.APP_CONFIGURACOES}/${id}`;
}

/**
 * Resolve a seção ativa a partir do splat da rota (`:section/*`)
 * ou do query param legado `?section=`.
 */
export function resolveSettingsSection({ splat = '', searchParams } = {}) {
  const fromPath = String(splat || '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)[0];
  if (isValidSettingsSection(fromPath)) {
    return fromPath;
  }
  const fromQuery = searchParams?.get?.('section');
  if (isValidSettingsSection(fromQuery)) {
    return fromQuery;
  }
  return DEFAULT_SETTINGS_SECTION;
}
