import { Sparkles } from 'lucide-react';
import { DemoStoreCards } from '../../demo/components/DemoStoreCards';
import '../../demo/Demo.css';
import '../styles/DemoSection.css';

const DemoSection = () => {
  return (
    <section className="demo-landing" id="demo" aria-labelledby="demo-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Demonstração
          </span>
          <h2 id="demo-title" className="lp-title">Veja a Weper em ação</h2>
          <p className="lp-subtitle">
            Escolha um estabelecimento e experimente como seus clientes fariam um pedido.
          </p>
        </div>
        <DemoStoreCards source="landing" />
      </div>
    </section>
  );
};

export default DemoSection;
