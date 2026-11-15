import { useEffect, useState } from 'react';
import HubHeader from './components/HubHeader';
import HubLinkCard from './components/HubLinkCard';
import HubDemoModal from './components/HubDemoModal';
import HubFooter from './components/HubFooter';
import { getActiveLinks } from './hubConfig';
import { trackHubPageView, trackHubModalOpen } from './hubAnalytics';
import './Hub.css';

/**
 * Weper Hub — Link-in-bio oficial
 * URL: https://www.weper.com.br/links
 */
export default function WeperHub() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const links = getActiveLinks();

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

          <section className="hub-links" aria-label="Links oficiais da Weper">
            {links.map((link) => (
              <HubLinkCard key={link.id} link={link} onClick={handleLinkClick} />
            ))}
          </section>

          <HubFooter />
        </div>
      </div>

      <HubDemoModal isOpen={demoModalOpen} onClose={closeDemoModal} />
    </>
  );
}
