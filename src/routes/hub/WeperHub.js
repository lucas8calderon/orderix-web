import { useEffect, useState } from 'react';
import HubHeader from './components/HubHeader';
import HubHeroCard from './components/HubHeroCard';
import HubLinkCard from './components/HubLinkCard';
import HubSegmentsSection from './components/HubSegmentsSection';
import HubDemoModal from './components/HubDemoModal';
import HubFooter from './components/HubFooter';
import { SECONDARY_LINKS } from './hubConfig';
import { trackHubPageView, trackHubModalOpen } from './hubAnalytics';
import './HubRedesign.css';

/**
 * Weper Hub — Link-in-bio oficial REDESIGNADO
 * URL: https://www.weper.com.br/links
 * 
 * REDESIGN: Layout premium, mobile-first, com hero card e seção de segmentos
 */
export default function WeperHub() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  
  // Usar apenas links secundários (o principal virou hero card)
  const links = SECONDARY_LINKS.filter(link => link.active).sort((a, b) => a.order - b.order);

  // Configura metadados da página
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.content;

    document.title = 'Weper | Links Oficiais';

    const metaDescription =
      document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content =
      'Conheça a Weper, explore nossas demonstrações, funcionalidades, planos e entre em contato com nossa equipe.';
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

          <section className="hub-links" aria-label="Links oficiais da Weper">
            {links.map((link) => (
              <HubLinkCard key={link.id} link={link} onClick={handleLinkClick} />
            ))}
          </section>

          <HubSegmentsSection />

          <HubFooter />
        </div>
      </div>

      <HubDemoModal isOpen={demoModalOpen} onClose={closeDemoModal} />
    </>
  );
}
