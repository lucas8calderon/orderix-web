import React from 'react';
import '../styles/PlansSection.css';

const PlansSection = () => {
  const scrollToClients = () => {
    const clientsSection = document.getElementById('clients');
    if (clientsSection) {
      clientsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const plans = [
    {
      name: 'Básico',
      price: '49,99',
      period: 'mês',
      description: 'Ideal para pequenos estabelecimentos',
      features: [
        'Até 5 mesas',
        'Módulo do garçom',
        'Gestão de pedidos',
        'Relatórios básicos',
        'Suporte por e-mail'
      ],
      highlighted: false
    },
    {
      name: 'Profissional',
      price: '99,99',
      period: 'mês',
      badge: 'Recomendado',
      description: 'Para restaurantes em crescimento',
      features: [
        'Até 20 mesas',
        'Módulo do garçom',
        'Mesas e comandas',
        'Balcão e autoatendimento',
        'Relatórios completos',
        'Integração com pagamentos',
        'Suporte prioritário'
      ],
      highlighted: true
    },
    {
      name: 'Premium',
      price: '199,99',
      period: 'mês',
      description: 'Solução completa sem limites',
      features: [
        'Mesas ilimitadas',
        'Todos os módulos',
        'Multi-estabelecimento',
        'API completa',
        'Relatórios avançados',
        'Integração completa',
        'Suporte 24/7',
        'Gerente de conta dedicado'
      ],
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
                onClick={scrollToClients}
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
