import React from 'react';
import {
  Check,
  Cloud,
  Crown,
  Headphones,
  Lock,
  Rocket,
  Shield,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import '../styles/PlansSection.css';

/** Preços alinhados a SubscriptionPlan no backend (49,90 / 79,90 / 119,90). */
const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: '49,90',
    tagline: 'Ideal para quem está começando.',
    description: 'Operação completa para ponto pequeno.',
    highlighted: false,
    Icon: Store,
    features: [
      'Até 3 colaboradores',
      'Até 2 dispositivos',
      'Até 20 mesas',
      'Até 20 comandas',
      '1 tela KDS',
      '1 impressora',
      'Relatórios do dia e do turno',
      'Suporte WhatsApp em horário comercial',
      'Ativação simples',
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: '79,90',
    badge: 'Recomendado',
    tagline: 'Mais capacidade e suporte prioritário.',
    description: 'Escala do dia a dia, com mais capacidade e suporte com prioridade.',
    highlighted: true,
    Icon: TrendingUp,
    features: [
      'Até 10 colaboradores',
      'Até 6 dispositivos',
      'Até 50 mesas',
      'Até 50 comandas',
      'Até 3 telas KDS',
      'Várias impressoras',
      'Dashboard e histórico operacional',
      'Suporte com prioridade',
      'Ativação assistida e treinamento curto',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '119,90',
    tagline: 'Para operações maiores e mais exigentes.',
    description: 'Teto alto e atendimento próximo para operações maiores.',
    highlighted: false,
    Icon: Crown,
    features: [
      'Colaboradores sem limite prático',
      'Dispositivos ilimitados',
      'Mesas ilimitadas',
      'Comandas ilimitadas',
      'KDS multiárea ilimitado',
      'Impressoras ilimitadas',
      'Acesso completo ao painel gerencial',
      'Suporte prioritário e onboarding dedicado',
      'Ajuda na configuração inicial (cardápio, mesas e impressoras)',
    ],
  },
];

const TRUST_ITEMS = [
  {
    id: 'rapido',
    title: 'Comece rápido',
    description: 'Ativação simples e em poucos minutos para sua operação.',
    Icon: Rocket,
  },
  {
    id: 'fidelidade',
    title: 'Sem fidelidade',
    description: 'Cancele quando quiser. Sem pegadinhas.',
    Icon: Shield,
  },
  {
    id: 'suporte',
    title: 'Suporte de verdade',
    description: 'Atendimento rápido por quem entende do seu negócio.',
    Icon: Headphones,
  },
  {
    id: 'offline',
    title: 'Funciona online e offline',
    description: 'Seu negócio não para, mesmo sem internet.',
    Icon: Cloud,
  },
];

const PlansSection = () => {
  const handleSubscribe = (planName) => {
    openWhatsApp(`Olá! Gostaria de assinar o plano ${planName} da Weper.`);
  };

  return (
    <section className="plans-section" id="plans" aria-labelledby="plans-title">
      <div className="plans-section__glow" aria-hidden="true" />
      <div className="plans-container">
        <div className="plans-header">
          <span className="plans-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Planos e preços
          </span>
          <h2 id="plans-title" className="plans-title">
            Escolha o <span className="plans-title__accent">plano certo</span> para a sua operação
          </h2>
          <p className="plans-subtitle">
            Soluções flexíveis para restaurantes, bares e todos os tipos de negócios.
          </p>
        </div>

        <div className="plans-grid">
          {PLANS.map((plan) => {
            const PlanIcon = plan.Icon;
            return (
              <article
                key={plan.id}
                className={`plan-card ${plan.highlighted ? 'plan-card--highlighted' : ''}`}
                data-plan={plan.id}
              >
                {plan.badge && (
                  <div className="plan-badge">
                    <Sparkles size={12} aria-hidden="true" />
                    {plan.badge}
                  </div>
                )}

                <div className="plan-card__top">
                  <div className="plan-card__identity">
                    <h3 className="plan-name">{plan.name}</h3>
                    <p className="plan-tagline">{plan.tagline}</p>
                  </div>
                  <div className="plan-card__icon" aria-hidden="true">
                    <PlanIcon size={20} strokeWidth={1.75} />
                  </div>
                </div>

                <div className="plan-price">
                  <span className="plan-price__currency">R$</span>
                  <span className="plan-price__amount">{plan.price}</span>
                  <span className="plan-price__period">/mês</span>
                </div>

                <p className="plan-description">{plan.description}</p>

                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <span className="plan-check" aria-hidden="true">
                        <Check size={12} strokeWidth={2.75} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`btn-plan ${plan.highlighted ? 'btn-plan--primary' : 'btn-plan--outline'}`}
                  onClick={() => handleSubscribe(plan.name)}
                >
                  Assinar {plan.name}
                </button>
              </article>
            );
          })}
        </div>

        <div className="plans-trust" role="list">
          {TRUST_ITEMS.map(({ id, title, description, Icon }) => (
            <div key={id} className="plans-trust__item" role="listitem">
              <div className="plans-trust__icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <div className="plans-trust__copy">
                <strong>{title}</strong>
                <span>{description}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="plans-security">
          <Lock size={14} aria-hidden="true" />
          Ambiente 100% seguro e seus dados protegidos sempre.
        </p>
      </div>
    </section>
  );
};

export default PlansSection;
