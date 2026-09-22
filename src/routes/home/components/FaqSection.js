import React, { useId, useState } from 'react';
import {
  ChevronDown,
  CreditCard,
  Headphones,
  HelpCircle,
  Laptop,
  MessageCircle,
  MessageCircleQuestion,
  Smartphone,
  Store,
  TrendingUp,
  Scale,
  Wallet,
} from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import {
  formatPrice,
  getMaximumPrice,
  getMaxRevenueBeforeCap,
  getMinimumPrice,
} from '../../../config/pricingTiers';
import '../styles/FaqSection.css';

const FAQS = [
  {
    q: 'Como começo a usar a Weper?',
    a: 'Pelo WhatsApp. A equipe ativa o acesso do estabelecimento. Não há cadastro automático nem trial no site.',
    Icon: HelpCircle,
  },
  {
    q: 'Preciso escolher um plano?',
    a: 'Não. Existe uma assinatura única. O valor da mensalidade acompanha o volume mensal processado pela plataforma. Você não troca de plano para liberar recursos.',
    Icon: Wallet,
  },
  {
    q: 'A menor faixa já inclui a plataforma completa?',
    a: `Sim. A partir de ${formatPrice(getMinimumPrice())}/mês o estabelecimento usa a Weper completa. O que muda entre as faixas é só o volume de vendas, não um catálogo de módulos.`,
    Icon: TrendingUp,
  },
  {
    q: 'O que acontece se as vendas aumentarem?',
    a: `A mensalidade sobe para a faixa correspondente. No modelo atual, acima de ${formatPrice(getMaxRevenueBeforeCap())} processados no mês, o valor permanece em ${formatPrice(getMaximumPrice())}.`,
    Icon: Scale,
  },
  {
    q: 'Preciso cadastrar cartão de crédito?',
    a: 'Não. Não há checkout online neste momento. A assinatura é combinada e ativada pela equipe Weper.',
    Icon: CreditCard,
  },
  {
    q: 'Em quais dispositivos a Weper funciona?',
    a: 'No celular, no tablet (landscape) e no computador. A operação acompanha o ritmo do estabelecimento em qualquer dispositivo.',
    Icon: Smartphone,
  },
  {
    q: 'A Weper serve só para restaurantes?',
    a: 'Não. Atende hamburguerias, pizzarias, restaurantes, bares, adegas, cafeterias, food trucks, pequenos comércios e outros estabelecimentos compatíveis.',
    Icon: Store,
  },
  {
    q: 'Preciso instalar algum programa no computador?',
    a: 'Para o painel web, não: basta um navegador atualizado. Em dispositivos móveis, o uso é via app Android ou o fluxo já suportado pela operação.',
    Icon: Laptop,
  },
  {
    q: 'Como falo com o suporte?',
    a: 'Pelo WhatsApp. A mesma conversa inicia o acesso e tira dúvidas sobre a operação.',
    Icon: Headphones,
  },
];

function FaqItem({ item, index, isOpen, onToggle, baseId }) {
  const { q, a, Icon } = item;
  const panelId = `${baseId}-panel-${index}`;
  const buttonId = `${baseId}-btn-${index}`;

  return (
    <div className="faq-item" data-open={isOpen}>
      <h3 className="faq-item__heading">
        <button
          type="button"
          id={buttonId}
          className="faq-item__btn"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="faq-item__icon-wrap" aria-hidden="true">
            <Icon size={18} strokeWidth={2} />
          </span>
          <span className="faq-item__question">{q}</span>
          <span className="faq-item__chevron" aria-hidden="true">
            <ChevronDown size={16} strokeWidth={2.25} />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-item__panel"
        hidden={!isOpen}
      >
        <p className="faq-item__answer">{a}</p>
      </div>
    </div>
  );
}

function FaqSupportCard() {
  return (
    <div className="faq-support">
      <div className="faq-support__copy">
        <span className="faq-support__icon" aria-hidden="true">
          <MessageCircle size={22} strokeWidth={2} />
        </span>
        <div>
          <p className="faq-support__title">Ainda tem dúvidas?</p>
          <p className="faq-support__text">
            Fale com a equipe no WhatsApp. É o mesmo canal para ativar o acesso.
          </p>
        </div>
      </div>
      <div className="faq-support__actions">
        <button
          type="button"
          className="faq-support__btn faq-support__btn--filled"
          onClick={() => openWhatsApp()}
        >
          <MessageCircle size={16} aria-hidden="true" />
          Falar com a Weper
        </button>
      </div>
    </div>
  );
}

const FaqSection = () => {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <div className="faq-section__glow" aria-hidden="true" />
      <div className="faq-section__dots" aria-hidden="true" />
      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-eyebrow">
            <MessageCircleQuestion size={14} aria-hidden="true" />
            Dúvidas frequentes
          </span>
          <h2 id="faq-title" className="faq-title">
            Perguntas <span className="faq-title__accent">frequentes</span>
          </h2>
          <p className="faq-subtitle">
            Preço, dispositivos e como começar — sem modelos de plano antigos.
          </p>
        </div>

        <div className="faq-list">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <FaqItem
                key={item.q}
                item={item}
                index={index}
                isOpen={isOpen}
                baseId={baseId}
                onToggle={() => setOpenIndex(isOpen ? -1 : index)}
              />
            );
          })}
        </div>

        <FaqSupportCard />
      </div>
    </section>
  );
};

export default FaqSection;
