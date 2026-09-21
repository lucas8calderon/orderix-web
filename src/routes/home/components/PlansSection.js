import React from 'react';
import {
  Check,
  ClipboardList,
  Cloud,
  CookingPot,
  Crown,
  Headphones,
  LayoutDashboard,
  Lock,
  Monitor,
  Printer,
  QrCode,
  RefreshCw,
  Rocket,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import '../styles/PlansSection.css';

const SHARED_FEATURES = [
  { id: 'gestao', title: 'Gestão centralizada', Icon: LayoutDashboard },
  { id: 'pdv', title: 'PDV', Icon: Monitor },
  { id: 'garcom', title: 'App Garçom', Icon: Smartphone },
  { id: 'mesas', title: 'Mesas e Comandas', Icon: ClipboardList },
  { id: 'cardapio', title: 'Cardápio Digital', Icon: QrCode },
  { id: 'cozinha', title: 'Integração com cozinha', Icon: CookingPot },
  { id: 'impressao', title: 'Impressão', Icon: Printer },
  { id: 'updates', title: 'Atualizações da plataforma', Icon: RefreshCw },
  { id: 'security', title: 'Segurança e sincronização', Icon: ShieldCheck },
];

/** Preços alinhados a SubscriptionPlan no backend (49,90 / 79,90 / 119,90). */
const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: '49,90',
    tagline: 'Para quem está começando.',
    description: 'Para pequenas operações que querem começar com tudo organizado.',
    cta: 'Começar com o Básico',
    highlighted: false,
    Icon: Store,
    groups: [
      {
        id: 'recursos',
        title: 'Recursos',
        items: [
          '1 tela KDS / Cozinha',
          'Controle de estoque básico',
          'Dashboard básico',
          'Relatórios operacionais',
        ],
      },
      {
        id: 'capacidade',
        title: 'Capacidade',
        items: [
          'Até 3 colaboradores',
          'Até 2 dispositivos',
          'Até 15 mesas',
          'Até 20 comandas simultâneas',
          '1 impressora',
          'Histórico de até 30 dias',
        ],
      },
      {
        id: 'suporte',
        title: 'Suporte',
        items: ['Suporte em horário comercial'],
      },
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    price: '79,90',
    badge: 'Recomendado',
    tagline: 'O plano principal da operação.',
    description: 'Uma operação completa para quem quer vender, atender e gerenciar em um só lugar.',
    cta: 'Assinar Profissional',
    highlighted: true,
    Icon: TrendingUp,
    groups: [
      {
        id: 'recursos',
        title: 'Recursos',
        items: [
          'Delivery próprio',
          'Controle de estoque completo',
          'Até 3 telas KDS / Cozinha',
          '1 dispositivo de Autoatendimento',
          'Dashboard gerencial completo',
          'Relatórios completos',
        ],
      },
      {
        id: 'capacidade',
        title: 'Capacidade',
        items: [
          'Até 10 colaboradores',
          'Até 6 dispositivos',
          'Até 50 mesas',
          'Até 100 comandas simultâneas',
          'Até 3 impressoras',
          'Histórico de até 12 meses',
        ],
      },
      {
        id: 'suporte',
        title: 'Suporte',
        items: ['Suporte prioritário', 'Ativação assistida'],
      },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '119,90',
    tagline: 'Mais escala e liberdade.',
    description: 'Mais capacidade e liberdade para operações de alto volume.',
    cta: 'Assinar Premium',
    highlighted: false,
    Icon: Crown,
    groups: [
      {
        id: 'recursos',
        title: 'Recursos',
        items: [
          'Delivery próprio',
          'Controle de estoque completo',
          'KDS multiárea',
          'Autoatendimento',
          'Dashboard gerencial completo',
          'Relatórios avançados',
          'Histórico completo',
        ],
      },
      {
        id: 'capacidade',
        title: 'Capacidade',
        items: [
          'Colaboradores ilimitados*',
          'Dispositivos ilimitados*',
          'Mesas ilimitadas*',
          'Comandas ilimitadas*',
          'Telas KDS ilimitadas*',
          'Impressoras ilimitadas*',
        ],
      },
      {
        id: 'suporte',
        title: 'Suporte',
        items: [
          'Suporte prioritário',
          'Onboarding personalizado',
          'Ajuda na configuração inicial',
        ],
      },
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
            A base Weper está em todos os planos. O que muda é a capacidade e o quanto da operação você quer no mesmo lugar.
          </p>
        </div>

        <div className="plans-shared">
          <h3 className="plans-shared__title">Todos os planos já contam com a base Weper.</h3>
          <ul className="plans-shared__grid">
            {SHARED_FEATURES.map(({ id, title, Icon }) => (
              <li key={id} className="plans-shared__item">
                <span className="plans-shared__icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={1.85} />
                </span>
                <span>{title}</span>
              </li>
            ))}
          </ul>
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

                {plan.groups.map((group) => (
                  <div key={group.id} className="plan-group">
                    <h4 className="plan-group__title">{group.title}</h4>
                    <ul className="plan-features">
                      {group.items.map((feature) => (
                        <li key={feature}>
                          <span className="plan-check" aria-hidden="true">
                            <Check size={12} strokeWidth={2.75} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                <button
                  type="button"
                  className={`btn-plan ${plan.highlighted ? 'btn-plan--primary' : 'btn-plan--outline'}`}
                  onClick={() => handleSubscribe(plan.name)}
                >
                  {plan.cta}
                </button>
              </article>
            );
          })}
        </div>

        <p className="plans-footnote">
          *Sujeito à política de uso justo e limites técnicos da plataforma.
        </p>

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
