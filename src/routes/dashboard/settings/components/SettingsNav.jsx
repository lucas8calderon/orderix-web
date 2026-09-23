import React from 'react';
import {
  HomeOutlined as HomeIcon,
  ScheduleOutlined as ScheduleIcon,
  CreditCardOutlined as CreditCardIcon,
  DeliveryDiningOutlined as DeliveryIcon,
  QrCode2Outlined as QrCodeIcon,
  PercentOutlined as PercentIcon,
  PeopleOutline as PeopleIcon,
  BusinessOutlined as BusinessIcon,
} from '@mui/icons-material';
import { SETTINGS_GROUPS, sectionGroup } from '../settingsSections';

const SECTION_ICONS = {
  geral: HomeIcon,
  operacao: ScheduleIcon,
  vendas: CreditCardIcon,
  canais: DeliveryIcon,
  cardapio: QrCodeIcon,
  equipe: PeopleIcon,
  empresa: BusinessIcon,
  horarios: ScheduleIcon,
  pagamentos: CreditCardIcon,
  delivery: DeliveryIcon,
  'cardapio-digital': QrCodeIcon,
  taxas: PercentIcon,
  permissoes: PeopleIcon,
};

export function SettingsNav({ activeSection, onNavigate }) {
  return (
    <nav className="settings-nav" aria-label="Seções de configurações">
      <div className="settings-nav__track" role="tablist" aria-label="Categorias de configurações">
        {SETTINGS_GROUPS.map((section) => {
          const Icon = SECTION_ICONS[section.id] || HomeIcon;
          const active = section.id === sectionGroup(activeSection);
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onKeyDown={event => {
                const index = SETTINGS_GROUPS.findIndex(item => item.id === section.id);
                const next = event.key === 'ArrowRight' ? (index + 1) % SETTINGS_GROUPS.length : event.key === 'ArrowLeft' ? (index + SETTINGS_GROUPS.length - 1) % SETTINGS_GROUPS.length : event.key === 'Home' ? 0 : event.key === 'End' ? SETTINGS_GROUPS.length - 1 : null;
                if (next == null) return;
                event.preventDefault();
                event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
                onNavigate(SETTINGS_GROUPS[next].id);
              }}
              className={`settings-nav__tab${active ? ' is-active' : ''}`}
              onClick={() => onNavigate(section.id)}
            >
              <Icon className="settings-nav__icon" fontSize="small" />
              <span className="settings-nav__label">{section.label}</span>
              <span className="settings-nav__label-short">{section.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
