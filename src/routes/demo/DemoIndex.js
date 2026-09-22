import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../../services/accessControl';
import { WeperMark } from '../home/components/WeperMark';
import { DEMO_EVENTS, trackDemoEvent } from './demoAnalytics';
import { restoreDemoDocumentMeta, setDemoDocumentMeta } from './demoSeo';
import { DemoStoreCards } from './components/DemoStoreCards';
import './Demo.css';

export default function DemoIndex() {
  useEffect(() => {
    setDemoDocumentMeta({
      title: 'Veja a Weper em ação | Demonstração',
      description: 'Escolha um estabelecimento e experimente como seus clientes fariam um pedido no cardápio digital Weper.',
    });
    trackDemoEvent(DEMO_EVENTS.VIEW, { surface: 'index' });
    return restoreDemoDocumentMeta;
  }, []);

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
        <DemoStoreCards source="demo_index" />
      </main>
    </div>
  );
}
