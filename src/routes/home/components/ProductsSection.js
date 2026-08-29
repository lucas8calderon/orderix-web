import React from 'react';
import {
  Smartphone,
  Monitor,
  Tablet,
  LayoutDashboard,
  CreditCard,
  Utensils,
} from 'lucide-react';

const PRODUCTS = [
  {
    icon: Smartphone,
    title: 'App Garçom',
    description: 'Atendimento e lançamento de pedidos no salão.',
  },
  {
    icon: Monitor,
    title: 'KDS',
    description: 'Central de produção da cozinha em tempo real.',
  },
  {
    icon: Tablet,
    title: 'Autoatendimento',
    description: 'Em breve: pedidos pela mesa com autonomia do cliente.',
  },
  {
    icon: LayoutDashboard,
    title: 'Painel Admin',
    description: 'Gestão da operação, cardápio e indicadores.',
  },
  {
    icon: Utensils,
    title: 'Mesas e comandas',
    description: 'Controle do salão, balcão e status dos pedidos.',
  },
  {
    icon: CreditCard,
    title: 'Pagamentos',
    description: 'Fechamento e registro de formas de pagamento.',
  },
];

const ProductsSection = () => {
  return (
    <section className="lp-section lp-section--surface" aria-labelledby="produtos-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow">Produtos</span>
          <h2 id="produtos-title" className="lp-title">Módulos que formam a Weper</h2>
          <p className="lp-subtitle">
            Cada produto resolve uma parte da operação e todos conversam entre si.
          </p>
        </div>
        <div className="lp-grid-3">
          {PRODUCTS.map(({ icon: Icon, title, description }) => (
            <article key={title} className="lp-mini-card">
              <div className="lp-mini-card__icon" aria-hidden="true">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
