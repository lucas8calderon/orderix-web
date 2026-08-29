import React from 'react';

const STEPS = [
  {
    title: 'Fale no WhatsApp',
    description: 'Combinamos o acesso do estabelecimento. Não há trial automático no site.',
  },
  {
    title: 'Monte a operação',
    description: 'Cadastre cardápio, mesas e colaboradores com o suporte da equipe.',
  },
  {
    title: 'Opere no dia a dia',
    description: 'Receba pedidos, acompanhe a cozinha, feche vendas e acompanhe os resultados.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="como-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <h2 id="como-title" className="lp-title">Como funciona</h2>
          <p className="lp-subtitle">Três passos para colocar a Weper em operação.</p>
        </div>
        <div className="how-steps">
          {STEPS.map((step, index) => (
            <article key={step.title} className="how-step">
              <div className="how-step__n" aria-hidden="true">
                {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
