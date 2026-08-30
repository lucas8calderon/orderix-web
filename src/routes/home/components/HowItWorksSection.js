import React from 'react';

const STEPS = [
  {
    title: 'Conheça o Weper',
    description: 'Fale no WhatsApp e entenda como a plataforma se encaixa na sua operação.',
  },
  {
    title: 'Monte a operação',
    description: 'Cadastre cardápio, mesas, produtos e equipe com o suporte da Weper.',
  },
  {
    title: 'Opere e acompanhe',
    description: 'Atenda, feche vendas e acompanhe resultados do pedido ao indicador.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="lp-section lp-section--surface" id="comecar" aria-labelledby="como-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <h2 id="como-title" className="lp-title">Como começar</h2>
          <p className="lp-subtitle">Três passos para colocar a Weper em operação no seu negócio.</p>
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
