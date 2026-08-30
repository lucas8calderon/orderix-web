import React from 'react';
import { Play } from 'lucide-react';
import { LandingImage } from './DeviceMockups';
import { scrollToId } from '../landingAssets';

const HeroSection = ({ onStartClick }) => {
  return (
    <section className="hero-lp" id="home" aria-labelledby="hero-title">
      <div className="lp-container hero-lp__grid">
        <div className="hero-lp__content">
          <span className="lp-eyebrow">Gestão inteligente</span>
          <h1 id="hero-title" className="hero-lp__title">
            Do pedido ao resultado,
            <span className="hero-lp__title-accent">tudo em um só lugar.</span>
          </h1>
          <p className="hero-lp__desc">
            Gestão inteligente para negócios que atendem, vendem e querem crescer.
            Atendimento, pedidos e indicadores conectados no celular, no tablet
            ou no computador.
          </p>
          <div className="hero-lp__actions">
            <button type="button" className="lp-btn lp-btn--primary" onClick={onStartClick}>
              Conhecer o Weper
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="lp-btn lp-btn--outline"
              onClick={() => scrollToId('funcionalidades')}
            >
              <Play size={16} aria-hidden="true" />
              Ver como funciona
            </button>
          </div>
        </div>

        <div className="hero-lp__stage" aria-label="Weper em mobile, tablet e desktop">
          <LandingImage
            imageKey="ecosystem"
            className="hero-lp__visual"
            priority
            lazy={false}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
