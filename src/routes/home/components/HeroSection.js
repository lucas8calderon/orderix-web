import React from 'react';
import '../styles/HeroSection.css';

const HeroSection = ({ onTestClick }) => {
  return (
    <section className="hero-section" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            A gestão completa que o seu restaurante precisa
          </h1>
          <p className="hero-subtitle">
            Controle mesas, comandas, balcão e autoatendimento com o sistema Orderix
          </p>
          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={onTestClick}>
              Testar gratuitamente
            </button>
            <button className="btn-hero-secondary" onClick={onTestClick}>
              Planos a partir de R$49,99/mês
            </button>
          </div>
          <div className="hero-features">
            <div className="feature-badge">
              <span className="badge-icon">✓</span>
              <span>Sem cartão de crédito</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">✓</span>
              <span>14 dias grátis</span>
            </div>
            <div className="feature-badge">
              <span className="badge-icon">✓</span>
              <span>Suporte incluído</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-mockup">
            <img 
              src={require('../../../assets/images/mesa.png')} 
              alt="Orderix App Interface - Mesa"
              className="app-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="app-fallback" style={{ display: 'none' }}>
              <div className="fallback-content">
                <div className="app-icon">
                  <div className="plate-icon">🍽️</div>
                </div>
                <div className="fallback-title">Orderix App</div>
                <div className="fallback-subtitle">Sistema de Gestão</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
