import React from 'react';
import { LANDING_IMAGES } from '../landingAssets';
import { WeperMark } from './WeperMark';

export function DashboardMockup({ className = '' }) {
  return (
    <div className={`device-frame device-frame--laptop ${className}`.trim()} aria-hidden="true">
      <div className="dash-mock">
        <div className="dash-mock__top">
          <div className="dash-mock__brand">
            <WeperMark size={18} showWordmark={false} />
            <span>Dashboard</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Hoje</span>
        </div>
        <div className="dash-mock__metrics">
          <div className="dash-mock__metric">
            <strong>R$ 8.240</strong>
            <span>Faturamento</span>
          </div>
          <div className="dash-mock__metric">
            <strong>156</strong>
            <span>Pedidos</span>
          </div>
          <div className="dash-mock__metric">
            <strong>R$ 52</strong>
            <span>Ticket médio</span>
          </div>
          <div className="dash-mock__metric">
            <strong>12</strong>
            <span>Mesas abertas</span>
          </div>
        </div>
        <div className="dash-mock__body">
          <div className="dash-mock__panel">
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Faturamento no período
            </span>
            <div className="dash-mock__chart" />
          </div>
          <div className="dash-mock__panel">
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Formas de pagamento
            </span>
            <div className="dash-mock__pie" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KdsMockup({ className = '' }) {
  const columns = [
    { key: 'novo', label: 'Novo', cards: ['Mesa 03 · X-Burger', 'Balcão · Açaí'] },
    { key: 'preparo', label: 'Em preparo', cards: ['Mesa 07 · Combo', 'Mesa 12 · Pizza'] },
    { key: 'pronto', label: 'Pronto', cards: ['Mesa 05 · Porção'] },
    { key: 'entregue', label: 'Entregue', cards: ['Mesa 02 · Sucos'] },
  ];

  return (
    <div className={`device-frame device-frame--laptop ${className}`.trim()} aria-hidden="true">
      <div className="kds-mock">
        {columns.map((col) => (
          <div key={col.key} className={`kds-col kds-col--${col.key}`}>
            <div className="kds-col__head">{col.label}</div>
            {col.cards.map((card) => (
              <div key={card} className="kds-card">
                <strong>{card.split(' · ')[0]}</strong>
                {card.split(' · ')[1]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhoneMockup({ className = '', lazy = true }) {
  const { src, alt, futurePath } = LANDING_IMAGES.waiter;
  return (
    <div className={`device-frame device-frame--phone ${className}`.trim()}>
      <div className="device-frame__screen">
        <img
          src={src}
          alt={alt}
          data-future-src={futurePath}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      </div>
    </div>
  );
}

export function TabletMockup({ className = '', lazy = true }) {
  const { src, alt, futurePath } = LANDING_IMAGES.selfService;
  return (
    <div className={`device-frame device-frame--tablet ${className}`.trim()}>
      <div className="device-frame__screen">
        <img
          src={src}
          alt={alt}
          data-future-src={futurePath}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      </div>
    </div>
  );
}
