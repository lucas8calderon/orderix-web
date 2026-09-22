import React from 'react';
import { LandingImage } from './DeviceMockups';
import { scrollToId } from '../landingAssets';

const HeroSection = ({ onStartClick }) => {
  return (
    <section className="hero-lp" id="home" aria-labelledby="hero-title">
      <div className="lp-container hero-lp__grid">
        <div className="hero-lp__content">
          <span className="lp-eyebrow">Plataforma Weper</span>
          <h1 id="hero-title" className="hero-lp__title">
            Gestão e operação de estabelecimentos,
            <span className="hero-lp__title-accent">em um só sistema.</span>
          </h1>
          <p className="hero-lp__desc">
            A Weper conecta atendimento, pedidos, caixa, cozinha e indicadores
            no celular, no tablet ou no computador — para restaurantes, bares,
            comércios e outras operações de venda.
          </p>
          <div className="hero-lp__actions">
            <button type="button" className="lp-btn lp-btn--primary" onClick={onStartClick}>
              Falar com a Weper
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="lp-btn lp-btn--outline"
              onClick={() => scrollToId('plans')}
            >
              Ver planos
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
