import React from 'react';
import { Play } from 'lucide-react';
import { DashboardMockup, PhoneMockup } from './DeviceMockups';

const HeroSection = ({ onStartClick, onDemoClick }) => {
  return (
    <section className="hero-lp" id="home" aria-labelledby="hero-title">
      <div className="lp-container hero-lp__grid">
        <div className="hero-lp__content">
          <span className="lp-eyebrow">Plataforma para a sua operação</span>
          <h1 id="hero-title" className="hero-lp__title">
            Toda a sua operação.
            <span className="hero-lp__title-accent">Um único sistema.</span>
          </h1>
          <p className="hero-lp__desc">
            A Weper conecta atendimento, pedidos, cozinha e gestão
            para simplificar a operação do seu estabelecimento.
          </p>
          <ul className="lp-check-list" aria-label="Como começar">
            <li>
              <span className="lp-check" aria-hidden="true">✓</span>
              Comece pelo WhatsApp
            </li>
            <li>
              <span className="lp-check" aria-hidden="true">✓</span>
              Assinatura ativada pela equipe
            </li>
            <li>
              <span className="lp-check" aria-hidden="true">✓</span>
              Suporte para colocar no ar
            </li>
          </ul>
          <div className="hero-lp__actions">
            <button type="button" className="lp-btn lp-btn--primary" onClick={onStartClick}>
              Começar agora
              <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="lp-btn lp-btn--outline" onClick={onDemoClick}>
              <Play size={16} aria-hidden="true" />
              Falar no WhatsApp
            </button>
          </div>
        </div>

        <div className="hero-lp__stage" aria-label="Prévia do produto Weper">
          <DashboardMockup className="hero-lp__dash" />
          <PhoneMockup className="hero-lp__phone" lazy={false} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
