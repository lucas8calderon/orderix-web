import React from 'react';
import { Zap, Shield, RefreshCw, Headphones, Cloud, Smartphone, Sparkles } from 'lucide-react';
import '../styles/LandingPremium.css';

const BENEFITS = [
  { icon: Zap, title: 'Agilidade', description: 'Atendimento e pedidos mais rápidos no dia a dia.' },
  { icon: RefreshCw, title: 'Controle', description: 'Informações em tempo real para decidir melhor.' },
  { icon: Cloud, title: 'Offline', description: 'Continue operando e sincronize depois.' },
  { icon: Smartphone, title: 'Multidispositivos', description: 'Celular, tablet landscape ou computador.' },
  { icon: Shield, title: 'Segurança', description: 'Dados protegidos com acesso controlado.' },
  { icon: Headphones, title: 'Suporte', description: 'Equipe pronta para ajudar você a começar.' },
];

const BenefitsSection = () => {
  return (
    <section className="lp-premium lp-premium--shift" id="beneficios" aria-labelledby="beneficios-title">
      <div className="lp-premium__glow" aria-hidden="true" />
      <div className="lp-premium__dots" aria-hidden="true" />
      <div className="lp-premium__container">
        <div className="lp-premium__head">
          <span className="lp-premium__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Vantagens
          </span>
          <h2 id="beneficios-title" className="lp-premium__title">
            Por que o
            {' '}
            <span className="lp-premium__accent">Weper</span>
          </h2>
          <p className="lp-premium__subtitle">
            O essencial para atender melhor, vender com controle e crescer com clareza.
          </p>
        </div>
        <div className="lp-premium-grid lp-premium-grid--3">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
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

export default BenefitsSection;
