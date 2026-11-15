import { ExternalLink } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import { trackBeforeNavigation, trackHubLinkClick } from '../hubAnalytics';
import desktopImage from '../../../assets/images/landing/features/gestao-dashboard.webp';
import mobileImage from '../../../assets/images/landing/flow-phone-menu.webp';

/**
 * Card Hero Principal do Hub - Conheça a Weper
 */
export default function HubHeroCard() {
  async function handleClick(e) {
    e.preventDefault();
    await trackBeforeNavigation(() =>
      trackHubLinkClick('conhecer-weper', 'Conheça a Weper', PATHS.HOME)
    );
    window.location.href = PATHS.HOME;
  }

  return (
    <div className="hub-hero-card">
      <div className="hub-hero-content">
        <h2 className="hub-hero-title">Conheça a Weper</h2>
        <p className="hub-hero-description">
          Descubra como simplificar a gestão do seu estabelecimento.
        </p>
        <a
          href={PATHS.HOME}
          className="hub-hero-cta"
          onClick={handleClick}
        >
          <span>Acessar o site</span>
          <ExternalLink size={16} />
        </a>
      </div>
      <div className="hub-hero-mockups">
        <img
          src={desktopImage}
          alt="Dashboard Weper"
          className="hub-hero-desktop"
          loading="eager"
        />
        <img
          src={mobileImage}
          alt="App mobile Weper"
          className="hub-hero-mobile"
          loading="eager"
        />
      </div>
    </div>
  );
}
