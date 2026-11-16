import { ArrowRight } from 'lucide-react';
import { trackBeforeNavigation, trackHubLinkClick } from '../hubAnalytics';

/**
 * Card de link do Hub
 * REDESIGN COMPLETO: suporta variantes featured, list e whatsapp
 */
export default function HubLinkCard({ link, onClick, variant = 'list' }) {
  const Icon = link.icon;
  const isWhatsApp = link.highlight === 'whatsapp' || variant === 'whatsapp';
  const showPriceBadge = link.id === 'planos' && link.subtitle;

  const handleClick = async (e) => {
    // Se for modal, não navega
    if (link.type === 'modal') {
      e.preventDefault();
      if (onClick) onClick(link);
      return;
    }

    // Para links externos, rastreia antes de navegar
    if (link.type === 'external' && link.url) {
      e.preventDefault();
      await trackBeforeNavigation(() =>
        trackHubLinkClick(link.id, link.title, link.url)
      );
      // Navega após rastreamento
      window.location.href = link.url;
    }
  };

  const classNames = [
    'hub-link-card',
    variant && `hub-link-card--${variant}`,
    isWhatsApp && 'hub-link-card--whatsapp',
  ]
    .filter(Boolean)
    .join(' ');

  const Component = link.type === 'modal' ? 'button' : 'a';
  const props = link.type === 'external' && link.url ? { href: link.url } : {};

  return (
    <Component
      className={classNames}
      onClick={handleClick}
      {...props}
      type={link.type === 'modal' ? 'button' : undefined}
    >
      <div className="hub-link-icon">
        <Icon size={variant === 'featured' ? 24 : 20} />
      </div>
      <div className="hub-link-content">
        <div className="hub-link-title">{link.title}</div>
        <div className="hub-link-description">{link.description}</div>
        {showPriceBadge && <span className="hub-link-badge">{link.subtitle}</span>}
      </div>
      <div className="hub-link-arrow-wrapper">
        <ArrowRight size={variant === 'whatsapp' ? 18 : 16} className="hub-link-arrow" aria-hidden="true" />
      </div>
    </Component>
  );
}
