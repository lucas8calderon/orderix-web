import React from 'react';
import { WeperMark } from './WeperMark';

const FinalCtaSection = ({ onStartClick }) => {
  return (
    <section className="lp-section final-cta" aria-labelledby="cta-title">
      <div className="lp-container final-cta__inner">
        <div>
          <h2 id="cta-title" className="lp-title lp-title--light">
            Pronto para colocar a operação no ar?
          </h2>
          <p className="lp-subtitle lp-subtitle--light">
            Fale com a Weper no WhatsApp. A assinatura é ativada pela equipe —
            sem checkout automático e sem trial de 14 dias.
          </p>
          <ul className="lp-check-list final-cta__checks">
            <li>
              <span className="lp-check" aria-hidden="true">✓</span>
              Atendimento, pedidos e cozinha
            </li>
            <li>
              <span className="lp-check" aria-hidden="true">✓</span>
              Ativação combinada com você
            </li>
            <li>
              <span className="lp-check" aria-hidden="true">✓</span>
              Suporte para começar
            </li>
          </ul>
          <button type="button" className="lp-btn lp-btn--white" onClick={onStartClick}>
            Falar no WhatsApp
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="final-cta__visual" aria-hidden="true">
          <div style={{ color: '#fff' }}>
            <WeperMark size={48} showWordmark={false} />
            <p>Toda a sua operação. Um único sistema.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCtaSection;
