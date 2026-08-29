import React from 'react';

const STEPS = [
  { title: 'Pedido', description: 'Salão, balcão ou app do garçom' },
  { title: 'Cozinha', description: 'Produção acompanhada no KDS' },
  { title: 'Entrega', description: 'Pronto e entregue na mesa' },
  { title: 'Pagamento', description: 'Fechamento e formas de pagamento' },
  { title: 'Gestão', description: 'Indicadores e controle da operação' },
];

const OperationFlowSection = () => {
  return (
    <section className="lp-section flow-section" aria-labelledby="fluxo-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <h2 id="fluxo-title" className="lp-title lp-title--light">
            Fluxo da operação
          </h2>
          <p className="lp-subtitle lp-subtitle--light">
            Do pedido à gestão, tudo conectado em uma sequência clara.
          </p>
        </div>
        <div className="flow-steps">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flow-step">
              <div className="flow-step__n" aria-hidden="true">
                {index + 1}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OperationFlowSection;
