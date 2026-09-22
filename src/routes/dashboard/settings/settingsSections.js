import { PATHS } from '../../../services/accessControl';

/** Abas da página de Configurações (URL: /app/configuracoes/:section). */
export const SETTINGS_SECTIONS = [
  { id: 'geral', label: 'Geral', shortLabel: 'Geral' },
  { id: 'horarios', label: 'Horários', shortLabel: 'Horários' },
  { id: 'pagamentos', label: 'Pedidos e pagamentos', shortLabel: 'Pagamentos' },
  { id: 'delivery', label: 'Delivery', shortLabel: 'Delivery' },
  { id: 'cardapio-digital', label: 'Cardápio Digital (QR)', shortLabel: 'Cardápio' },
  { id: 'taxas', label: 'Taxas e Regras', shortLabel: 'Taxas' },
  { id: 'permissoes', label: 'Equipe e Permissões', shortLabel: 'Equipe' },
  { id: 'empresa', label: 'Empresa', shortLabel: 'Empresa' },
];

export const DEFAULT_SETTINGS_SECTION = 'geral';

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
