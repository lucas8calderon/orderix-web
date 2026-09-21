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
import { SETTINGS_SECTIONS } from '../settingsSections';

const SECTION_ICONS = {
  geral: HomeIcon,
  horarios: ScheduleIcon,
  pagamentos: CreditCardIcon,
  delivery: DeliveryIcon,
  'cardapio-digital': QrCodeIcon,
  taxas: PercentIcon,
  permissoes: PeopleIcon,
  empresa: BusinessIcon,
};

export function SettingsNav({ activeSection, onNavigate }) {
  return (
    <nav className="settings-nav" aria-label="Seções de configurações">
      <div className="settings-nav__track" role="tablist">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = SECTION_ICONS[section.id] || HomeIcon;
          const active = section.id === activeSection;
          return (
            <button
              key={section.id}
              type="button"
              role="tab"
              aria-selected={active}
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
