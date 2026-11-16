import { ExternalLink } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import { trackBeforeNavigation, trackHubLinkClick } from '../hubAnalytics';
import mockupImage from '../../../assets/images/landing/mockup-painel-completo.png';

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
          src={mockupImage}
          alt="Painel completo Weper - Do pedido ao resultado"
          className="hub-hero-mockup"
          loading="eager"
        />
      </div>
    </div>
  );
}
