import React from 'react';
import {
  UtensilsCrossed,
  Coffee,
  Sandwich,
  Beer,
  Truck,
  ShoppingBasket,
  Pizza,
  Beef,
  Wine,
  LayoutGrid,
} from 'lucide-react';

const SEGMENTS = [
  {
    icon: Beef,
    title: 'Hamburguerias',
    subtitle: 'e smash',
    description: 'Balcão rápido, produção e pedidos no mesmo fluxo.',
  },
  {
    icon: Pizza,
    title: 'Pizzarias',
    subtitle: 'e esfiharias',
    description: 'Comandas, forno e entrega sem canais separados.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Restaurantes',
    subtitle: 'e bistrôs',
    description: 'Salão, cozinha, pedidos e comandas em um só sistema.',
  },
  {
    icon: Beer,
    title: 'Bares',
    subtitle: 'e pubs',
    description: 'Consumo, comandas e fechamento de caixa no expediente.',
  },
  {
    icon: Wine,
    title: 'Adegas',
    subtitle: 'e cervejarias',
    description: 'Catálogo, estoque e venda com controle de operação.',
  },
  {
    icon: Coffee,
    title: 'Cafeterias',
    subtitle: 'e padarias',
    description: 'Atendimento rápido e produtos organizados no dia a dia.',
  },
  {
    icon: Sandwich,
    title: 'Lanchonetes',
    subtitle: 'e fast food',
    description: 'Agilidade no balcão e no fluxo de pedidos.',
  },
  {
    icon: Truck,
    title: 'Food trucks',
    subtitle: 'e trailers',
    description: 'Mobilidade para atender, vender e acompanhar a operação.',
  },
  {
    icon: ShoppingBasket,
    title: 'Comércios',
    subtitle: 'e conveniências',
    description: 'Produtos, estoque, vendas e indicadores no painel.',
  },
];

const SegmentsStrip = () => {
  return (
    <section className="segments-section" id="segmentos" aria-labelledby="segments-title">
      <div className="lp-container">
        <div className="lp-section-head segments-section__head">
          <span className="lp-eyebrow">Para o seu tipo de operação</span>
          <h2 id="segments-title" className="lp-title">
            Serve para o seu negócio?
          </h2>
          <p className="lp-subtitle">
            A Weper não é um produto só para restaurantes. Ela se adapta a
            diferentes estabelecimentos que atendem, vendem e precisam de controle.
          </p>
        </div>

        <div className="segments-grid" role="list">
          {SEGMENTS.map(({ icon: Icon, title, subtitle, description }) => (
            <article key={title} className="segment-card" role="listitem">
              <span className="segment-card__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <h3 className="segment-card__title">
                {title}
                <span className="segment-card__subtitle">{subtitle}</span>
              </h3>
              <p className="segment-card__desc">{description}</p>
            </article>
          ))}
        </div>

        <p className="segments-more" aria-label="E muitos outros estabelecimentos">
          <LayoutGrid size={14} aria-hidden="true" />
          <span>E muitos outros estabelecimentos</span>
        </p>
      </div>
    </section>
  );
};

export default SegmentsStrip;
