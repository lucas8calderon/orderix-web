import React from 'react';
import '../styles/PlansSection.css';

function upgradePlanFeatures(features, replacements, extras = []) {
  return [...features.map((feature) => replacements[feature] || feature), ...extras];
}

const PlansSection = () => {
  const openWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de assinar o sistema Orderix.');
    window.open(`https://wa.me/5511977844172?text=${message}`, '_blank');
  };

  const basicFeatures = [
    'Aplicativo Garçom',
    'Frente de caixa, comandas e pagamentos integrados',
    'Até 10 mesas',
    'Até 10 comandas',
    'Até 5 colaboradores',
    'Dashboard financeiro',
    'Histórico de vendas',
    'Suporte por WhatsApp 24/7',
  ];

  const professionalFeatures = upgradePlanFeatures(
    basicFeatures,
    { 'Até 5 colaboradores': 'Até 20 colaboradores' },
    [
      'PDV frente de caixa',
      'Atendimento autônomo com tablet na mesa',
      'Relatórios e dashboard',
      'KDS e central de pedidos',
      'Produtos mais vendidos',
      'Controle de estoque',
      'Desempenho dos funcionários',
    ]
  );

  const premiumFeatures = upgradePlanFeatures(
    professionalFeatures,
    {
      'Até 10 mesas': 'Mesas ilimitadas',
      'Até 10 comandas': 'Comandas ilimitadas',
      'Até 20 colaboradores': 'Colaboradores ilimitados',
      'Relatórios e dashboard': 'Relatórios avançados',
      'Suporte por WhatsApp 24/7': 'Suporte 24/7',
    },
    [
      'Cardápio digital',
      'Visão Multiempresa',
      'Programas de fidelidade',
      'Integração com ERP',
      'Emissão fiscal',
      'Customização on demand',
      'Onboarding personalizado',
    ]
  );

  const plans = [
    {
      name: 'Básico',
      price: '49,99',
      period: 'mês',
      description: 'Ideal para pequenos estabelecimentos',
      features: basicFeatures,
      highlighted: false
    },
    {
      name: 'Profissional',
      price: '99,99',
      period: 'mês',
      badge: 'Recomendado',
      description: 'Para restaurantes em crescimento',
      features: professionalFeatures,
      highlighted: true
    },
    {
      name: 'Premium',
      price: '199,99',
      period: 'mês',
      description: 'Solução completa sem limites',
      features: premiumFeatures,
      highlighted: false
    }
  ];

  return (
    <section className="plans-section" id="plans">
      <div className="plans-container">
        <div className="section-header">
          <h2 className="section-title">Planos e Preços</h2>
          <p className="section-subtitle">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>
        <div className="plans-grid">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`plan-card ${plan.highlighted ? 'highlighted' : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="currency">R$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <span className="check-icon">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`btn-plan ${plan.highlighted ? 'primary' : ''}`}
                onClick={openWhatsApp}
              >
                Assinar agora
              </button>
            </div>
          ))}
        </div>
        <p className="plans-note">
          Todos os planos incluem suporte técnico e atualizações constantes
        </p>
      </div>
    </section>
  );
};

export default PlansSection;
