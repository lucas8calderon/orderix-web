import {
  DEFAULT_SETTINGS_SECTION,
  isValidSettingsSection,
  resolveSettingsSection,
  settingsSectionPath,
  SETTINGS_SECTIONS,
} from './settingsSections';
import { PATHS } from '../../../services/accessControl';

describe('settingsSections', () => {
  it('expõe as abas obrigatórias na ordem esperada', () => {
    expect(SETTINGS_SECTIONS.map((s) => s.id)).toEqual([
      'geral',
      'horarios',
      'pagamentos',
      'delivery',
      'cardapio-digital',
      'taxas',
      'permissoes',
      'empresa',
    ]);
  });

  it('monta path canônico por seção', () => {
    expect(settingsSectionPath('delivery')).toBe(`${PATHS.APP_CONFIGURACOES}/delivery`);
    expect(settingsSectionPath('invalida')).toBe(`${PATHS.APP_CONFIGURACOES}/${DEFAULT_SETTINGS_SECTION}`);
  });

  it('resolve seção pelo splat e pelo query legado', () => {
    expect(resolveSettingsSection({ splat: 'horarios' })).toBe('horarios');
    expect(resolveSettingsSection({ splat: 'foo/bar' })).toBe(DEFAULT_SETTINGS_SECTION);
    expect(
      resolveSettingsSection({
        splat: '',
        searchParams: new URLSearchParams('section=pagamentos'),
      })
    ).toBe('pagamentos');
    expect(isValidSettingsSection('empresa')).toBe(true);
    expect(isValidSettingsSection('integracoes')).toBe(false);
  });
});
