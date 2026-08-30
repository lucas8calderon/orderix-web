import React, { useId, useState } from 'react';
import {
  ChevronDown,
  CreditCard,
  Headphones,
  HelpCircle,
  Laptop,
  ListChecks,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  RefreshCw,
  Scale,
  ShieldCheck,
  Smartphone,
  Store,
} from 'lucide-react';
import { openWhatsApp } from '../landingAssets';
import '../styles/FaqSection.css';

const FAQS = [
  {
    q: 'Como começo a usar a Weper?',
    a: 'Pelo WhatsApp desta página. A equipe ativa o acesso do estabelecimento. Não há cadastro automático nem trial de 14 dias no site.',
    Icon: HelpCircle,
  },
  {
    q: 'Preciso cadastrar cartão de crédito?',
    a: 'Não. Não há checkout online neste momento. A assinatura é combinada e ativada manualmente pela equipe Weper.',
    Icon: CreditCard,
  },
  {
    q: 'Em quais dispositivos a Weper funciona?',
    a: 'No celular, no tablet (landscape) e no desktop. A operação acompanha o ritmo do seu negócio em qualquer dispositivo.',
    Icon: Smartphone,
  },
  {
    q: 'A Weper serve só para restaurantes?',
    a: 'Não. A Weper atende restaurantes, bares, lanchonetes, cafeterias, food trucks, mercados, pastelarias e outros tipos de negócio de alimentação e varejo.',
    Icon: Store,
  },
  {
    q: 'O que está incluído nos planos?',
    a: 'Todos os planos incluem a operação Weper: app de atendimento, frente de caixa e comandas, cozinha (KDS), painel administrativo, catálogo, colaboradores, 1 loja e suporte por WhatsApp. O que muda entre Básico, Profissional e Premium é a capacidade (colaboradores, dispositivos, mesas, comandas, telas KDS e impressoras) e o nível de suporte.',
    Icon: ListChecks,
  },
  {
    q: 'Qual a diferença entre os planos?',
    a: 'Básico (R$ 49,90) cabe em ponto pequeno: até 3 colaboradores, 2 dispositivos, 20 mesas, 20 comandas, 1 KDS e 1 impressora, com relatórios do dia e do turno. Profissional (R$ 79,90) escala o dia a dia: até 10 colaboradores, 6 dispositivos, 50 mesas, 50 comandas, 3 telas KDS, várias impressoras, dashboard com histórico e suporte com prioridade. Premium (R$ 119,90) oferece teto alto, mesas e comandas ilimitadas, painel gerencial completo, suporte prioritário e ajuda na configuração inicial.',
    Icon: Scale,
  },
  {
    q: 'Como falo com o suporte?',
    a: 'Pelo WhatsApp disponível na página. No Básico o atendimento é em horário comercial. No Profissional e no Premium o suporte tem prioridade; o Premium inclui onboarding dedicado.',
    Icon: Headphones,
  },
  {
    q: 'Preciso instalar algum programa no computador?',
    a: 'Para o painel web, não: basta um navegador atualizado. Em dispositivos móveis, o uso é via app Android ou o fluxo já suportado pela operação.',
    Icon: Laptop,
  },
  {
    q: 'Posso mudar de plano depois?',
    a: 'Sim. Você pode evoluir do Básico para Profissional ou Premium. Fale com o suporte no WhatsApp para ajustar a assinatura.',
    Icon: RefreshCw,
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
  const handleWhatsApp = () => {
    openWhatsApp('Olá! Ainda tenho dúvidas sobre a Weper e gostaria de falar no WhatsApp.');
  };

  const handleMessage = () => {
    openWhatsApp('Olá! Gostaria de enviar uma mensagem e tirar algumas dúvidas sobre a Weper.');
  };

  return (
    <div className="faq-support">
      <div className="faq-support__copy">
        <span className="faq-support__icon" aria-hidden="true">
          <ShieldCheck size={22} strokeWidth={2} />
        </span>
        <div>
          <p className="faq-support__title">Ainda tem dúvidas?</p>
          <p className="faq-support__text">
            Nosso time está pronto para ajudar você a encontrar a melhor solução.
          </p>
        </div>
      </div>
      <div className="faq-support__actions">
        <button
          type="button"
          className="faq-support__btn faq-support__btn--outline"
          onClick={handleWhatsApp}
        >
          <MessageCircle size={16} aria-hidden="true" />
          Falar no WhatsApp
        </button>
        <button
          type="button"
          className="faq-support__btn faq-support__btn--filled"
          onClick={handleMessage}
        >
          <Mail size={16} aria-hidden="true" />
          Enviar mensagem
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
            Respostas rápidas para ajudar você a começar com o Weper.
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
