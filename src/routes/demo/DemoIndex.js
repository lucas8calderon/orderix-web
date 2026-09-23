import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import { WeperMark } from '../home/components/WeperMark';
import { scrollToId } from '../home/landingAssets';
import { DEMO_EVENTS, trackDemoEvent } from './demoAnalytics';
import { restoreDemoDocumentMeta, setDemoDocumentMeta } from './demoSeo';
import { DEMO_STORES_SECTION_ID } from './demoStores';
import { DemoStoreCards } from './components/DemoStoreCards';
import './Demo.css';

export default function DemoIndex() {
  const location = useLocation();

  useEffect(() => {
    setDemoDocumentMeta({
      title: 'Veja a Weper em ação | Demonstração',
      description: 'Escolha um estabelecimento e experimente como seus clientes fariam um pedido no cardápio digital Weper.',
    });
    trackDemoEvent(DEMO_EVENTS.VIEW, { surface: 'index' });
    return restoreDemoDocumentMeta;
  }, []);

  useEffect(() => {
    if (location.hash !== `#${DEMO_STORES_SECTION_ID}`) return undefined;
    const timer = window.setTimeout(() => scrollToId(DEMO_STORES_SECTION_ID), 0);
    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <div className="demo-index">
      <header className="demo-index__top">
        <Link to={PATHS.HOME} className="demo-index__brand">
          <WeperMark size={36} />
        </Link>
        <Link to={PATHS.HOME} className="demo-index__back">Voltar ao site</Link>
      </header>
      <main className="demo-index__main">
        <p className="demo-index__eyebrow">Demonstração</p>
        <h1>Veja a Weper em ação</h1>
        <p className="demo-index__subtitle">
          Escolha um estabelecimento e experimente como seus clientes fariam um pedido.
        </p>
        <section id={DEMO_STORES_SECTION_ID} aria-label="Lojas de demonstração">
          <DemoStoreCards source="demo_index" />
        </section>
      </main>
    </div>
  );
}
