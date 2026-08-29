import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Como começo a usar a Weper?',
    a: 'Pelo WhatsApp desta página. A equipe ativa o acesso do estabelecimento — não há cadastro automático nem trial de 14 dias no site.',
  },
  {
    q: 'Preciso cadastrar cartão de crédito?',
    a: 'Não. Não há checkout online neste momento. A assinatura é combinada e ativada manualmente pela equipe Weper.',
  },
  {
    q: 'Em quais dispositivos a Weper funciona?',
    a: 'O painel administrativo roda no navegador (computador ou tablet). O app do garçom é pensado para celular e tablet. O KDS funciona em tela de cozinha ou monitor.',
  },
  {
    q: 'A Weper serve só para restaurantes?',
    a: 'Não. A Weper é pensada para estabelecimentos de alimentação e bebidas em geral — restaurantes, bares, cafeterias, lanchonetes, sorveterias, adegas, pastelarias, hamburguerias e operações semelhantes.',
  },
  {
    q: 'O que está incluído nos planos?',
    a: 'Os três planos incluem a operação atual: garçom, mesas/comandas, caixa, cozinha (KDS), catálogo, colaboradores e painel. A diferença hoje é o valor mensal. Módulos como estoque completo, ERP, nota fiscal e autoatendimento ainda não fazem parte da oferta.',
  },
  {
    q: 'Como falo com o suporte?',
    a: 'Pelo WhatsApp disponível na página. O time ajuda com dúvidas de uso, onboarding e escolha de plano.',
  },
  {
    q: 'Preciso instalar algum programa no computador?',
    a: 'Para o painel web, não — basta um navegador atualizado. Em dispositivos móveis, o uso é via app Android ou o fluxo já suportado pela operação.',
  },
  {
    q: 'Posso mudar de plano depois?',
    a: 'Sim. Você pode evoluir do Básico para Profissional ou Premium. Fale com o suporte no WhatsApp para ajustar a assinatura.',
  },
];

const FaqSection = () => {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="lp-section lp-section--muted" id="faq" aria-labelledby="faq-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <h2 id="faq-title" className="lp-title">Perguntas frequentes</h2>
          <p className="lp-subtitle">Respostas diretas sobre acesso, planos e uso da Weper.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-btn-${index}`;
            return (
              <div key={item.q} className="faq-item" data-open={isOpen}>
                <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
                  <button
                    type="button"
                    id={buttonId}
                    className="faq-item__btn"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    {item.q}
                    <ChevronDown className="faq-item__icon" size={18} aria-hidden="true" />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="faq-item__panel"
                  hidden={!isOpen}
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
