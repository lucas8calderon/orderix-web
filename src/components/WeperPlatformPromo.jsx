import { useId } from 'react';
import { WEPER_COMMERCIAL_URL } from '../config/weperSite';
import './WeperPlatformPromo.css';

export const WEPER_PLATFORM_NOTE_ORDER = 'Este pedido é atendido pelo estabelecimento. Plataforma desenvolvida pela weper.';
export const WEPER_PLATFORM_NOTE_DELIVERY = 'Os pedidos são atendidos pelo estabelecimento. Plataforma desenvolvida pela weper.';
export const WEPER_PLATFORM_NOTE_MENU = 'Este cardápio é do estabelecimento. Plataforma desenvolvida pela weper.';

export default function WeperPlatformPromo({
  note = WEPER_PLATFORM_NOTE_ORDER,
  spaced = false,
}) {
  const titleId = useId();

  return (
    <div className={`dt-weper-promo${spaced ? ' is-storefront' : ''}`}>
      <section className="dt-weper-card" aria-labelledby={titleId}>
        <p className="dt-weper-brand">
          <span className="dt-weper-logo">weper</span>
          <span className="dt-weper-tagline">Tecnologia para seu estabelecimento</span>
        </p>
        <h2 className="dt-weper-title" id={titleId}>
          Seu estabelecimento também pode ter pedidos online.
        </h2>
        <p className="dt-weper-desc">
          Delivery próprio, cardápio digital e gestão em um só lugar.
        </p>
        <a
          className="dt-weper-cta"
          href={WEPER_COMMERCIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Conhecer a Weper
          <span className="dt-weper-cta-arrow" aria-hidden="true">↗</span>
        </a>
      </section>
      <p className="dt-weper-note">{note}</p>
    </div>
  );
}
