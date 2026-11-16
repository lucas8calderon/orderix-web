import { PATHS } from '../../../services/accessControl';
import { trackBeforeNavigation, trackHubLinkClick } from '../hubAnalytics';
import bannerImage from '../../../assets/images/landing/hub-banner.jpg';

/**
 * Banner Principal do Hub - Simplificando a gestão
 * REDESIGN COMPLETO: usa o banner fornecido, clicável para o site
 */
export default function HubHeroCard() {
  async function handleClick(e) {
    e.preventDefault();
    await trackBeforeNavigation(() =>
      trackHubLinkClick('banner-principal', 'Banner - Conheça a Weper', PATHS.HOME)
    );
    window.location.href = PATHS.HOME;
  }

  return (
    <a
      href={PATHS.HOME}
      className="hub-banner-link"
      onClick={handleClick}
      aria-label="Simplifique a gestão do seu estabelecimento - Acessar site Weper"
    >
      <img
        src={bannerImage}
        alt="Simplifique a gestão do seu estabelecimento - Mais vendas, controle e organização em um único sistema"
        className="hub-banner-image"
        loading="eager"
      />
    </a>
  );
}
