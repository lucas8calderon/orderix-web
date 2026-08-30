import React from 'react';

const AboutSection = () => {
  return (
    <section className="lp-section lp-section--surface" id="empresa" aria-labelledby="about-title">
      <div className="lp-container">
        <div className="about-card">
          <span className="lp-eyebrow">Empresa</span>
          <h2 id="about-title" className="lp-title">Sobre a Weper</h2>
          <p className="lp-subtitle" style={{ margin: '0 auto' }}>
            A Weper é a solução de gestão inteligente para restaurantes, bares,
            lanchonetes, cafeterias e todos os tipos de negócio. Unificamos
            atendimento, pedidos, pagamentos e indicadores, do pedido ao resultado.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
