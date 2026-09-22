import React from 'react';
import { Sparkles } from 'lucide-react';
import '../styles/LandingPremium.css';

const STEPS = [
  { number: '1', title: 'Salão', description: 'Mesa, comanda ou balcão' },
  { number: '2', title: 'Pedido', description: 'Enviado no mesmo instante' },
  { number: '3', title: 'Cozinha', description: 'KDS organiza a produção' },
  { number: '4', title: 'Pagamento', description: 'Caixa e formas suportadas' },
  { number: '5', title: 'Painel', description: 'Indicadores do expediente' },
];

const FlowSection = () => {
  return (
    <section className="lp-premium" id="funcionamento" aria-labelledby="funcionamento-title">
      <div className="lp-premium__glow" aria-hidden="true" />
      <div className="lp-premium__container">
        <div className="lp-premium__head">
          <span className="lp-premium__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Funcionamento
          </span>
          <h2 id="funcionamento-title" className="lp-premium__title">
            Como tudo
            {' '}
            <span className="lp-premium__accent">se conecta</span>
          </h2>
          <p className="lp-premium__subtitle">
            App, PDV, cozinha e painel não são módulos isolados. São o mesmo fluxo.
          </p>
        </div>
        <ol className="lp-flow">
          {STEPS.map((step) => (
            <li key={step.number} className="lp-flow__step">
              <span className="lp-flow__number" aria-hidden="true">{step.number}</span>
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default FlowSection;
