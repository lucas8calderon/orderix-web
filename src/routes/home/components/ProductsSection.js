import React from 'react';
import {
  Smartphone,
  ShoppingBag,
  CookingPot,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import '../styles/LandingPremium.css';

const SOLUTIONS = [
  {
    icon: Smartphone,
    title: 'Atendimento',
    product: 'App Garçom',
    description: 'A equipe opera o salão pelo celular.',
    features: ['Mesas e comandas', 'Balcão', 'Pedidos', 'Cobrança no salão'],
  },
  {
    icon: ShoppingBag,
    title: 'Venda',
    product: 'PDV, cardápio e canais próprios',
    description: 'Do caixa ao pedido do cliente, no mesmo sistema.',
    features: ['PDV', 'Cardápio digital', 'Delivery próprio', 'Autoatendimento'],
  },
  {
    icon: CookingPot,
    title: 'Operação',
    product: 'KDS e fechamento',
    description: 'Produção, impressão e pagamento no ritmo do expediente.',
    features: ['KDS / cozinha', 'Status do pedido', 'Impressão térmica', 'Pagamentos'],
  },
  {
    icon: LayoutDashboard,
    title: 'Gestão',
    product: 'Painel Weper',
    description: 'Visão da operação para decidir durante o dia.',
    features: ['Catálogo', 'Estoque', 'Equipe e permissões', 'Dashboard e relatórios'],
  },
];

const ProductsSection = () => {
  return (
    <section className="lp-premium lp-premium--shift" id="solucoes" aria-labelledby="solucoes-title">
      <div className="lp-premium__glow" aria-hidden="true" />
      <div className="lp-premium__container">
        <div className="lp-premium__head">
          <span className="lp-premium__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Soluções
          </span>
          <h2 id="solucoes-title" className="lp-premium__title">
            O que a Weper
            {' '}
            <span className="lp-premium__accent">oferece</span>
          </h2>
          <p className="lp-premium__subtitle">
            Quatro frentes. As funcionalidades ficam dentro de cada uma — não em um catálogo gigante.
          </p>
        </div>
        <div className="lp-premium-grid lp-premium-grid--4">
          {SOLUTIONS.map(({ icon: Icon, title, product, description, features }) => (
            <article key={title} className="lp-premium-card">
              <div className="lp-premium-card__icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <h3>{title}</h3>
              <p className="lp-premium-card__product">{product}</p>
              <p>{description}</p>
              <ul className="lp-premium-card__features">
                {features.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
