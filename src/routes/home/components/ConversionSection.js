import React from 'react';
import { Sparkles } from 'lucide-react';
import { scrollToId } from '../landingAssets';
import '../styles/LandingPremium.css';

const ConversionSection = ({ onContactClick }) => {
  return (
    <section className="lp-premium lp-premium--shift" id="contato" aria-labelledby="contato-title">
      <div className="lp-premium__glow" aria-hidden="true" />
      <div className="lp-premium__container lp-convert">
        <span className="lp-premium__eyebrow">
          <Sparkles size={14} aria-hidden="true" />
          Começar
        </span>
        <h2 id="contato-title" className="lp-premium__title">
          Pronto para operar
          {' '}
          <span className="lp-premium__accent">com a Weper?</span>
        </h2>
        <p className="lp-premium__subtitle">
          A equipe ativa o acesso do estabelecimento. Não há cadastro automático nem trial no site.
        </p>
        <div className="lp-convert__actions">
          <button type="button" className="lp-btn lp-btn--primary" onClick={onContactClick}>
            Falar com a Weper
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            className="lp-btn lp-btn--outline lp-btn--on-premium"
            onClick={() => scrollToId('demo')}
          >
            Ver demonstração
          </button>
        </div>
      </div>
    </section>
  );
};

export default ConversionSection;
