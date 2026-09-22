import React from 'react';
import { Layers, Receipt, BarChart3, Sparkles } from 'lucide-react';
import '../styles/LandingPremium.css';

const PAINS = [
  {
    icon: Layers,
    title: 'Pedidos espalhados',
    description: 'Salão, balcão e delivery em canais diferentes, sem um fluxo único.',
  },
  {
    icon: Receipt,
    title: 'Caixa longe da cozinha',
    description: 'O pedido chega no papel ou com atraso. Produção e atendimento não se falam.',
  },
  {
    icon: BarChart3,
    title: 'Resultado só no fim do dia',
    description: 'Sem um painel claro, fica difícil saber o que vendeu e o que travou a operação.',
  },
];

const ProblemSection = () => {
  return (
    <section className="lp-premium" id="problema" aria-labelledby="problema-title">
      <div className="lp-premium__glow" aria-hidden="true" />
      <div className="lp-premium__container">
        <div className="lp-premium__head">
          <span className="lp-premium__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            O problema
          </span>
          <h2 id="problema-title" className="lp-premium__title">
            Operar com ferramentas
            {' '}
            <span className="lp-premium__accent">soltas custa tempo</span>
          </h2>
          <p className="lp-premium__subtitle">
            A Weper centraliza o que hoje fica dividido entre caderno, outro app e uma planilha.
          </p>
        </div>
        <div className="lp-premium-grid lp-premium-grid--3">
          {PAINS.map(({ icon: Icon, title, description }) => (
            <article key={title} className="lp-premium-card">
              <div className="lp-premium-card__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.75} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
