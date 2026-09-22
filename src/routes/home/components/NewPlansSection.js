import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  Check,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { openWhatsApp, scrollToId } from '../landingAssets';
import {
  PRICING_TIERS,
  calculateMonthlyPrice,
  formatPrice,
  formatPriceNumber,
  getMinimumPrice,
  getMaximumPrice,
  getMaxRevenueBeforeCap,
  getTierByRevenue,
} from '../../../config/pricingTiers';
import '../styles/NewPlansSection.css';

const SIMULATOR_MAX = 20000;
const SIMULATOR_TICKS = [
  { value: 0, label: 'R$ 0' },
  { value: 5000, label: 'R$ 5k' },
  { value: 10000, label: 'R$ 10k' },
  { value: 15000, label: 'R$ 15k' },
  { value: 20000, label: 'R$ 20k+' },
];

function formatVolumeCompact(value) {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function getTierHeadline(tier) {
  if (tier.isMaxTier) {
    return `Acima de ${formatVolumeCompact(PRICING_TIERS[PRICING_TIERS.length - 2].maxRevenue)}`;
  }
  return `Até ${formatVolumeCompact(tier.maxRevenue)}`;
}

function PricingSimulator() {
  const [revenue, setRevenue] = useState(PRICING_TIERS[0].maxRevenue);

  const monthlyPrice = useMemo(
    () => calculateMonthlyPrice(revenue),
    [revenue]
  );

  const tier = useMemo(
    () => getTierByRevenue(revenue),
    [revenue]
  );

  const sliderProgress = `${(revenue / SIMULATOR_MAX) * 100}%`;
  const volumeLabel = revenue >= SIMULATOR_MAX
    ? `${formatVolumeCompact(SIMULATOR_MAX)}+`
    : formatVolumeCompact(revenue);

  const handleSliderChange = (e) => {
    setRevenue(Number(e.target.value));
  };

  return (
    <div className="pricing-simulator">
      <div className="simulator-content">
        <p className="simulator-plan-tag">
          <span className="simulator-plan-dot" aria-hidden="true" />
          Assinatura única
        </p>

        <div className="simulator-select">
          <p className="simulator-select-label">Selecione seu volume mensal atual:</p>
          <div className="simulator-volume-pill" aria-live="polite">
            {volumeLabel}
          </div>
          <input
            type="range"
            min="0"
            max={SIMULATOR_MAX}
            step="100"
            value={revenue}
            onChange={handleSliderChange}
            className="simulator-slider"
            style={{ '--slider-progress': sliderProgress }}
            aria-label="Ajustar volume mensal"
            aria-valuetext={volumeLabel}
          />
          <div className="slider-labels">
            {SIMULATOR_TICKS.map((tick) => (
              <span key={tick.value}>{tick.label}</span>
            ))}
          </div>
        </div>

        <div className="simulator-result">
          <div className="result-price">
            <span className="result-currency">R$</span>
            <span className="result-amount">{formatPriceNumber(monthlyPrice)}</span>
            <span className="result-period">/mês</span>
          </div>
        </div>

        <div className="simulator-tier">
          <strong>{getTierHeadline(tier)}</strong>
          <p>
            {tier.description}. Mensalidade de {formatPrice(tier.monthlyPrice)}.
            A plataforma completa está incluída.
          </p>
        </div>

        <button
          type="button"
          className="simulator-cta"
          onClick={() => openWhatsApp()}
        >
          Falar com a Weper
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Comece com a plataforma',
      description: 'Desde o primeiro dia, o estabelecimento usa a Weper completa.',
    },
    {
      number: '2',
      title: 'Venda normalmente',
      description: 'Registre e administre a operação no dia a dia.',
    },
    {
      number: '3',
      title: 'Pague conforme o volume',
      description: 'A mensalidade acompanha as vendas processadas pela plataforma.',
    },
  ];

  return (
    <div className="how-it-works">
      <h3 className="how-it-works__title">Como a mensalidade funciona</h3>
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
        Cresceu? A Weper continua a mesma. Você não troca de plano nem libera módulos.
      </p>
    </div>
  );
}

function PricingTable() {
  return (
    <div className="pricing-table">
      <div className="pricing-table__header">
        <h3 className="pricing-table__title">Quanto você movimenta → Quanto você paga</h3>
        <p className="pricing-table__subtitle">
          Uma assinatura. O valor acompanha o crescimento da operação.
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
          <strong>Esse é o máximo.</strong>
          <p>
            Acima de {formatPrice(getMaxRevenueBeforeCap())} no mês, a mensalidade
            permanece em {formatPrice(getMaximumPrice())} no modelo atual.
          </p>
        </div>
      </div>
    </div>
  );
}

const NewPlansSection = () => {
  return (
    <section className="new-plans-section" id="plans" aria-labelledby="new-plans-title">
      <div className="new-plans-section__glow" aria-hidden="true" />

      <div className="new-plans-container">
        <div className="new-plans-hero">
          <div className="new-plans-eyebrow">
            Planos Weper
          </div>

          <h2 id="new-plans-title" className="new-plans-title">
            Uma assinatura.
            {' '}
            <span className="new-plans-title__accent">O preço acompanha o volume.</span>
          </h2>

          <p className="new-plans-subtitle">
            A plataforma completa está incluída. A mensalidade muda só com o
            movimento do estabelecimento — sem prender recurso a um plano.
          </p>

          <div className="new-plans-hero-highlight">
            <Zap size={18} aria-hidden="true" />
            <span>A partir de {formatPrice(getMinimumPrice())}/mês</span>
          </div>

          <p className="new-plans-hero-caption">
            <Check size={16} aria-hidden="true" />
            Sem checklist de módulos por faixa
          </p>

          <div className="new-plans-hero-actions">
            <button
              type="button"
              className="btn-hero btn-hero--secondary"
              onClick={() => scrollToId('demo')}
            >
              Ver demonstração
            </button>
          </div>
        </div>

        <PricingSimulator />

        <HowItWorks />

        <PricingTable />

        <div className="new-plans-trust">
          <div className="trust-item">
            <Zap size={20} strokeWidth={1.75} aria-hidden="true" />
            <div>
              <strong>Ativação pela equipe</strong>
              <span>Sem cadastro automático no site</span>
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
