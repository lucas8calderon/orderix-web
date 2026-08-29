import React from 'react';

const AboutSection = () => {
  return (
    <section className="lp-section lp-section--surface" id="empresa" aria-labelledby="about-title">
      <div className="lp-container">
        <div className="about-card">
          <span className="lp-eyebrow">Empresa</span>
          <h2 id="about-title" className="lp-title">Sobre a Weper</h2>
          <p className="lp-subtitle" style={{ margin: '0 auto' }}>
            A Weper é uma plataforma de operação para estabelecimentos que precisam
            unificar atendimento, pedidos, cozinha e gestão. Nosso foco é
            simplificar o dia a dia e dar mais controle para quem opera o negócio.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
