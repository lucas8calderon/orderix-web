import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Shield,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import { WEPER_FEATURES } from '../../../config/weperFeatures';
import {
  PRICING_TIERS,
  calculateMonthlyPrice,
  formatPrice,
  formatPriceNumber,
  getMinimumPrice,
  getMaximumPrice,
  getMaxRevenueBeforeCap,
} from '../../../config/pricingTiers';
import '../styles/NewPlansSection.css';

const FAQ_ITEMS = [
  {
    id: 'plan-choice',
    question: 'Preciso escolher um plano?',
    answer: 'Não. A Weper possui uma assinatura completa. O valor da mensalidade acompanha o volume mensal processado pela plataforma.',
  },
  {
    id: 'all-features',
    question: 'Tenho acesso a todas as funcionalidades pagando R$ 39,90?',
    answer: 'Sim. O estabelecimento tem acesso às funcionalidades disponibilizadas pela Weper independentemente da faixa de faturamento.',
  },
  {
    id: 'increase-sales',
    question: 'O que acontece se minhas vendas aumentarem?',
    answer: 'A mensalidade se ajusta automaticamente à faixa correspondente.',
  },
  {
    id: 'max-price',
    question: 'Existe mensalidade máxima?',
    answer: `Sim. No modelo atual, acima de ${formatPrice(getMaxRevenueBeforeCap())} processados no mês, a mensalidade permanece em ${formatPrice(getMaximumPrice())}.`,
  },
  {
    id: 'change-plan',
    question: 'Vou precisar trocar de plano?',
    answer: 'Não. A plataforma continua a mesma. Apenas o valor da mensalidade acompanha o crescimento da operação.',
  },
  {
    id: 'calculation',
    question: 'Como o volume mensal é calculado?',
    answer: 'Consideramos as vendas elegíveis registradas/processadas através da Weper.',
  },
];

function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="faq-item">
      <button
        type="button"
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp size={20} aria-hidden="true" />
        ) : (
          <ChevronDown size={20} aria-hidden="true" />
        )}
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

function PricingSimulator() {
  const [revenue, setRevenue] = useState(3500);
  
  const monthlyPrice = useMemo(
    () => calculateMonthlyPrice(revenue),
    [revenue]
  );

  const handleSliderChange = (e) => {
    setRevenue(Number(e.target.value));
  };

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setRevenue(Number(raw) || 0);
  };

  const formattedRevenue = useMemo(
    () => formatPrice(revenue),
    [revenue]
  );

  return (
    <div className="pricing-simulator">
      <div className="simulator-content">
        <h3 className="simulator-title">Quanto sua operação movimenta por mês?</h3>
        
        <div className="simulator-controls">
          <label htmlFor="revenue-input" className="simulator-label">
            Volume mensal
          </label>
          <input
            id="revenue-input"
            type="text"
            className="simulator-input"
            value={formattedRevenue}
            onChange={handleInputChange}
            aria-label="Volume mensal processado"
          />
          
          <input
            type="range"
            min="0"
            max="15000"
            step="100"
            value={revenue}
            onChange={handleSliderChange}
            className="simulator-slider"
            aria-label="Ajustar volume mensal"
          />
          
          <div className="slider-labels">
            <span>R$ 0</span>
            <span>R$ 15.000</span>
          </div>
        </div>

        <div className="simulator-result">
          <p className="result-label">Sua mensalidade seria</p>
          <div className="result-price">
            <span className="result-currency">R$</span>
            <span className="result-amount">{formatPriceNumber(monthlyPrice)}</span>
            <span className="result-period">/mês</span>
          </div>
          <p className="result-caption">
            <Check size={16} aria-hidden="true" />
            Todas as funcionalidades da Weper incluídas
          </p>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Comece com tudo',
      description: 'Desde o primeiro dia, sua empresa tem acesso às funcionalidades da Weper.',
    },
    {
      number: '2',
      title: 'Venda normalmente',
      description: 'Use a Weper para registrar e administrar sua operação.',
    },
    {
      number: '3',
      title: 'Pague conforme crescer',
      description: 'A mensalidade acompanha o volume de vendas processadas pela plataforma.',
    },
  ];

  return (
    <div className="how-it-works">
      <h3 className="how-it-works__title">Como funciona</h3>
      <div className="steps-grid">
        {steps.map((step) => (
          <div key={step.number} className="step-card">
            <div className="step-number">{step.number}</div>
            <h4 className="step-title">{step.title}</h4>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
      <p className="how-it-works__note">
        Cresceu? Sua Weper continua a mesma. Você não precisa trocar de plano ou liberar novos módulos.
      </p>
    </div>
  );
}

function AllFeaturesIncluded() {
  return (
    <div className="all-features">
      <div className="all-features__header">
        <Sparkles size={24} className="all-features__icon" aria-hidden="true" />
        <h3 className="all-features__title">Todas as funcionalidades incluídas</h3>
        <p className="all-features__subtitle">
          Não apresentamos recursos como adicionais pagos. Todo o ecossistema Weper faz parte da plataforma.
        </p>
      </div>
      
      <div className="features-grid">
        {WEPER_FEATURES.map((feature) => {
          const Icon = feature.Icon;
          return (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PricingTable() {
  return (
    <div className="pricing-table">
      <div className="pricing-table__header">
        <h3 className="pricing-table__title">Quanto você movimenta → Quanto você paga</h3>
        <p className="pricing-table__subtitle">
          Uma única assinatura. O valor da mensalidade acompanha o seu crescimento.
        </p>
      </div>
      
      <div className="tiers-list">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`tier-item ${tier.isMaxTier ? 'tier-item--max' : ''}`}
          >
            <div className="tier-range">
              <span className="tier-label">{tier.label}</span>
              <span className="tier-desc">{tier.description}</span>
            </div>
            <div className="tier-price">
              <span className="tier-price-value">{formatPrice(tier.monthlyPrice)}</span>
              <span className="tier-price-period">/mês</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-table__cap">
        <Shield size={20} aria-hidden="true" />
        <div>
          <strong>E esse é o máximo.</strong>
          <p>Mesmo crescendo, sua mensalidade não ultrapassa {formatPrice(getMaximumPrice())}/mês no modelo atual.</p>
        </div>
      </div>
    </div>
  );
}

function DifferentialSection() {
  return (
    <div className="differential-section">
      <div className="differential-content">
        <h3 className="differential-title">
          Não escolha funcionalidades. <span className="differential-accent">Escolha crescer.</span>
        </h3>
        <p className="differential-text">
          Todos os clientes podem utilizar o ecossistema completo da Weper. O que muda é somente o volume mensal processado.
        </p>
      </div>

      <div className="differential-columns">
        <div className="differential-column differential-column--no">
          <h4 className="differential-column-title">✗ Não queremos isso</h4>
          <ul className="differential-list">
            <li>Estoque apenas no plano Premium</li>
            <li>App Garçom apenas no plano Pro</li>
            <li>Delivery vendido separadamente</li>
            <li>KDS como adicional</li>
          </ul>
        </div>

        <div className="differential-column differential-column--yes">
          <h4 className="differential-column-title">✓ Queremos isso</h4>
          <ul className="differential-list">
            <li><Check size={16} aria-hidden="true" /> App Garçom</li>
            <li><Check size={16} aria-hidden="true" /> Cardápio Digital</li>
            <li><Check size={16} aria-hidden="true" /> Delivery Próprio</li>
            <li><Check size={16} aria-hidden="true" /> PDV</li>
            <li><Check size={16} aria-hidden="true" /> KDS</li>
            <li><Check size={16} aria-hidden="true" /> Estoque</li>
            <li><Check size={16} aria-hidden="true" /> Autoatendimento</li>
            <li><Check size={16} aria-hidden="true" /> Dashboard</li>
            <li><Check size={16} aria-hidden="true" /> Relatórios</li>
            <li className="differential-all-included">Tudo incluído.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  const [openId, setOpenId] = useState(null);

  const handleToggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="faq-section">
      <h3 className="faq-title">Perguntas frequentes</h3>
      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <FaqItem
            key={item.id}
            question={item.question}
            answer={item.answer}
            isOpen={openId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function CtaFinal() {
  const handleStartClick = () => {
    openWhatsApp('Olá! Quero começar a usar a Weper no meu negócio.');
  };

  const handleContactClick = () => {
    openWhatsApp('Olá! Gostaria de falar sobre a Weper.');
  };

  return (
    <div className="cta-final">
      <div className="cta-final__content">
        <h3 className="cta-final__title">
          Comece pequeno. <span className="cta-final__accent">Cresça sem limites.</span>
        </h3>
        <p className="cta-final__text">
          Tenha a Weper completa desde o primeiro dia e pague uma mensalidade que acompanha o tamanho da sua operação.
        </p>
        <p className="cta-final__price">
          A partir de {formatPrice(getMinimumPrice())}/mês
        </p>
      </div>
      
      <div className="cta-final__actions">
        <button
          type="button"
          className="btn-cta btn-cta--primary"
          onClick={handleStartClick}
        >
          Começar agora
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn-cta btn-cta--secondary"
          onClick={handleContactClick}
        >
          Falar com a Weper
        </button>
      </div>
    </div>
  );
}

const NewPlansSection = () => {
  const handleStartClick = () => {
    openWhatsApp('Olá! Quero começar a usar a Weper no meu negócio.');
  };

  const handleLearnMoreClick = () => {
    const productsSection = document.querySelector('#products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="new-plans-section" id="plans" aria-labelledby="new-plans-title">
      <div className="new-plans-section__glow" aria-hidden="true" />
      
      <div className="new-plans-container">
        <div className="new-plans-hero">
          <div className="new-plans-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Planos Weper
          </div>
          
          <h2 id="new-plans-title" className="new-plans-title">
            Uma Weper. <span className="new-plans-title__accent">Todas as funcionalidades.</span>
          </h2>
          
          <p className="new-plans-subtitle">
            Sua mensalidade acompanha o tamanho da sua operação. Comece pequeno, tenha acesso à plataforma completa e cresça sem trocar de plano.
          </p>

          <div className="new-plans-hero-highlight">
            <Zap size={18} aria-hidden="true" />
            <span>A partir de {formatPrice(getMinimumPrice())}/mês</span>
          </div>

          <div className="new-plans-hero-actions">
            <button
              type="button"
              className="btn-hero btn-hero--primary"
              onClick={handleStartClick}
            >
              Começar agora
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="btn-hero btn-hero--secondary"
              onClick={handleLearnMoreClick}
            >
              Conhecer a Weper
            </button>
          </div>

          <p className="new-plans-hero-caption">
            <Check size={16} aria-hidden="true" />
            Todas as funcionalidades incluídas
          </p>
        </div>

        <PricingSimulator />
        
        <HowItWorks />
        
        <AllFeaturesIncluded />
        
        <PricingTable />
        
        <DifferentialSection />
        
        <FaqSection />
        
        <CtaFinal />

        <div className="new-plans-trust">
          <div className="trust-item">
            <Zap size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <strong>Ativação rápida</strong>
              <span>Comece em minutos</span>
            </div>
          </div>
          <div className="trust-item">
            <Shield size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <strong>Sem fidelidade</strong>
              <span>Cancele quando quiser</span>
            </div>
          </div>
          <div className="trust-item">
            <TrendingUp size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <strong>Escala com você</strong>
              <span>Mensalidade que cresce junto</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewPlansSection;
