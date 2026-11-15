import { ArrowRight } from 'lucide-react';
import { trackBeforeNavigation, trackHubLinkClick } from '../hubAnalytics';

/**
 * Card de link do Hub
 */
export default function HubLinkCard({ link, onClick }) {
  const Icon = link.icon;
  const isFeatured = link.featured;
  const isWhatsApp = link.highlight === 'whatsapp';

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
    isFeatured && 'hub-link-card--featured',
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
        <Icon size={24} />
      </div>
      <div className="hub-link-content">
        <div className="hub-link-title">{link.title}</div>
        <div className="hub-link-description">{link.description}</div>
        {link.subtitle && <div className="hub-link-subtitle">{link.subtitle}</div>}
      </div>
      <ArrowRight size={20} className="hub-link-arrow" aria-hidden="true" />
    </Component>
  );
}
