import React, { useState } from 'react';
import { openWhatsApp } from '../landingAssets';
import '../styles/PlansSection.css';

/** Preços iguais a SubscriptionPlan no backend (49,90 / 79,90 / 119,90). */
const PLANS = [
  {
    name: 'Básico',
    price: '49,90',
    description: 'Operação do salão, caixa, cozinha e painel',
    highlights: [
      'App Garçom',
      'Frente de caixa e comandas',
      'Cozinha (KDS)',
      'Painel administrativo',
      'Catálogo e colaboradores',
      'Suporte por WhatsApp',
    ],
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: '79,90',
    badge: 'Mais escolhido',
    description: 'Mesma operação, com valor intermediário',
    highlights: [
      'App Garçom',
      'Frente de caixa e comandas',
      'Cozinha (KDS)',
      'Painel administrativo',
      'Catálogo e colaboradores',
      'Suporte por WhatsApp',
    ],
    highlighted: true,
  },
  {
    name: 'Premium',
    price: '119,90',
    description: 'Mesma operação, com valor do plano superior',
    highlights: [
      'App Garçom',
      'Frente de caixa e comandas',
      'Cozinha (KDS)',
      'Painel administrativo',
      'Catálogo e colaboradores',
      'Suporte por WhatsApp',
    ],
    highlighted: false,
  },
];

const COMPARISON = [
  { feature: 'Aplicativo Garçom', basic: true, pro: true, premium: true },
  { feature: 'Frente de caixa / comandas', basic: true, pro: true, premium: true },
  { feature: 'Cozinha (KDS)', basic: true, pro: true, premium: true },
  { feature: 'Painel administrativo', basic: true, pro: true, premium: true },
  { feature: 'Catálogo e colaboradores', basic: true, pro: true, premium: true },
  { feature: 'Suporte por WhatsApp', basic: true, pro: true, premium: true },
];

const PlansSection = () => {
  const [showComparison, setShowComparison] = useState(false);

  const handleSubscribe = (planName) => {
    openWhatsApp(`Olá! Gostaria de assinar o plano ${planName} da Weper.`);
  };

  return (
    <section className="plans-section" id="plans" aria-labelledby="plans-title">
      <div className="plans-container">
        <div className="plans-header">
          <h2 id="plans-title" className="plans-title">
            Planos que cabem no seu negócio
          </h2>
          <p className="plans-subtitle">Assinatura mensal ativada pela equipe Weper, sem checkout automático</p>
          <p className="plans-trial">Fale no WhatsApp para começar</p>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`plan-card ${plan.highlighted ? 'highlighted' : ''}`}
            >
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">R$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/mês</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>
              <ul className="plan-features">
                {plan.highlights.map((feature) => (
                  <li key={feature}>
                    <span className="check-icon" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn-plan ${plan.highlighted ? 'primary' : ''}`}
                onClick={() => handleSubscribe(plan.name)}
              >
                Falar no WhatsApp
              </button>
            </article>
          ))}
        </div>

        <div className="plans-compare">
          <button
            type="button"
            className="plans-compare-btn"
            onClick={() => setShowComparison((v) => !v)}
            aria-expanded={showComparison}
            aria-controls="plans-comparison"
          >
            {showComparison ? 'Ocultar comparação' : 'Ver o que está incluído'}
          </button>

          {showComparison && (
            <div id="plans-comparison" className="plans-comparison" role="region" aria-label="Comparação de planos">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Recurso</th>
                    <th scope="col">Básico</th>
                    <th scope="col">Profissional</th>
                    <th scope="col">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row">{row.feature}</th>
                      <td>{row.basic ? '✓' : '—'}</td>
                      <td>{row.pro ? '✓' : '—'}</td>
                      <td>{row.premium ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlansSection;
