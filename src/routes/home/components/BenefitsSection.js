import React from 'react';
import { Zap, Shield, RefreshCw, Headphones } from 'lucide-react';

const BENEFITS = [
  {
    icon: Zap,
    title: 'Agilidade no atendimento',
    description: 'Pedidos rápidos, comunicação eficiente entre salão e cozinha e menos tempo para atender bem.',
  },
  {
    icon: Shield,
    title: 'Segurança nos dados',
    description: 'Suas informações protegidas com acesso controlado e boas práticas de armazenamento.',
  },
  {
    icon: RefreshCw,
    title: 'Atualizações constantes',
    description: 'Novas funcionalidades, melhorias e correções para evoluir junto com a sua operação.',
  },
  {
    icon: Headphones,
    title: 'Suporte especializado',
    description: 'Atendimento humano e preparado para ajudar você a configurar e usar o sistema no dia a dia.',
  },
];

const BenefitsSection = () => {
  return (
    <section className="lp-section lp-section--muted" id="beneficios" aria-labelledby="beneficios-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <h2 id="beneficios-title" className="lp-title">Principais benefícios</h2>
          <p className="lp-subtitle">Tudo o que você precisa para crescer com controle e eficiência.</p>
        </div>
        <div className="benefits-grid">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <article key={title} className="benefit-card">
              <div className="benefit-card__icon" aria-hidden="true">
                <Icon size={22} />
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
