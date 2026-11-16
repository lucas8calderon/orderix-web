import { useEffect, useState } from 'react';
import HubHeader from './components/HubHeader';
import HubHeroCard from './components/HubHeroCard';
import HubLinkCard from './components/HubLinkCard';
import HubDemoModal from './components/HubDemoModal';
import HubStats from './components/HubStats';
import HubFooter from './components/HubFooter';
import HubSegmentsSection from './components/HubSegmentsSection';
import { FEATURED_CARDS, QUICK_ACCESS_LINKS, WHATSAPP_CARD } from './hubConfig';
import { trackHubPageView, trackHubModalOpen } from './hubAnalytics';
import './HubRedesign.css';

/**
 * Weper Hub — Link-in-bio oficial REDESIGNADO
 * URL: https://www.weper.com.br/links
 * 
 * REDESIGN COMPLETO: seguindo layout de referência fornecido
 * - Cabeçalho com logo, slogan e ícones de segmento
 * - Banner principal clicável
 * - Cards de destaque em 2 colunas
 * - Carrossel de segmentos
 * - Seção de acesso rápido
 * - Card WhatsApp especial
 * - Rodapé simplificado
 */
export default function WeperHub() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  
  const featuredCards = FEATURED_CARDS.filter(link => link.active).sort((a, b) => a.order - b.order);
  const quickAccessLinks = QUICK_ACCESS_LINKS.filter(link => link.active).sort((a, b) => a.order - b.order);

  // Configura metadados da página
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.content;

    document.title = 'Weper | Do pedido ao resultado';

    const metaDescription =
      document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content =
      'Simplifique a gestão do seu estabelecimento. Delivery próprio, cardápio digital, mesas, comandas, cozinha, estoque e pagamentos em um único sistema.';
    if (!metaDescription.parentNode) {
      document.head.appendChild(metaDescription);
    }

    return () => {
      if (previousTitle) document.title = previousTitle;
      if (previousDescription && metaDescription) {
        metaDescription.content = previousDescription;
      }
    };
  }, []);

  // Rastreia acesso ao Hub
  useEffect(() => {
    trackHubPageView();
  }, []);

  function handleLinkClick(link) {
    if (link.action === 'open-demos') {
      setDemoModalOpen(true);
      trackHubModalOpen('demonstrations');
    }
  }

  function closeDemoModal() {
    setDemoModalOpen(false);
  }

  return (
    <>
      <div className="hub-page">
        <div className="hub-container">
          <HubHeader />

          <HubHeroCard />

          {/* Cards de Destaque: Demonstrações e Funcionalidades */}
          <section className="hub-featured-cards" aria-label="Destaques">
            {featuredCards.map((card) => (
              <HubLinkCard key={card.id} link={card} onClick={handleLinkClick} variant="featured" />
            ))}
          </section>

          <HubSegmentsSection />

          {/* Seção de Acesso Rápido */}
          <section className="hub-quick-access">
            <h2 className="hub-section-title">Acesso rápido</h2>
            <div className="hub-quick-access-list">
              {quickAccessLinks.map((link) => (
                <HubLinkCard key={link.id} link={link} onClick={handleLinkClick} variant="list" />
              ))}
            </div>
          </section>

          {/* Card WhatsApp Especial */}
          {WHATSAPP_CARD.active && (
            <HubLinkCard link={WHATSAPP_CARD} variant="whatsapp" />
          )}

          {/* Indicadores */}
          <HubStats />

          <HubFooter />
        </div>
      </div>

      <HubDemoModal isOpen={demoModalOpen} onClose={closeDemoModal} />
    </>
  );
}
