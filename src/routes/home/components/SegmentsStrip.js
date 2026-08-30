import React from 'react';
import {
  UtensilsCrossed,
  Coffee,
  Sandwich,
  Beer,
  Truck,
  ShoppingBasket,
  LayoutGrid,
} from 'lucide-react';

const SEGMENTS = [
  {
    icon: UtensilsCrossed,
    title: 'Restaurantes',
    subtitle: 'e bistrôs',
    description: 'Gestão completa para salão, cozinha, pedidos e comandas.',
  },
  {
    icon: Coffee,
    title: 'Cafeterias',
    subtitle: 'e padarias',
    description: 'Atendimento rápido e controle de produtos em uma operação mais organizada.',
  },
  {
    icon: Sandwich,
    title: 'Lanchonetes',
    subtitle: 'e fast food',
    description: 'Mais agilidade no balcão e no fluxo de pedidos.',
  },
  {
    icon: Beer,
    title: 'Bares',
    subtitle: 'e pubs',
    description: 'Controle de consumo, comandas e fechamento de caixa.',
  },
  {
    icon: Truck,
    title: 'Food Trucks',
    subtitle: 'e trailers',
    description: 'Mobilidade para atender, vender e acompanhar a operação.',
  },
  {
    icon: ShoppingBasket,
    title: 'Mercados',
    subtitle: 'e conveniências',
    description: 'Produtos, estoque, vendas e indicadores em um só lugar.',
  },
];

const SegmentsStrip = () => {
  return (
    <section className="segments-section" id="solucoes" aria-labelledby="segments-title">
      <div className="lp-container">
        <div className="lp-section-head segments-section__head">
          <span className="lp-eyebrow">Feito para o seu negócio</span>
          <h2 id="segments-title" className="lp-title">
            Uma solução para cada operação
          </h2>
          <p className="lp-subtitle">
            Do pequeno ao grande negócio, o Weper se adapta à sua realidade e
            ajuda você a operar com mais agilidade, controle e eficiência.
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

        <p className="segments-more" aria-label="E muitos outros negócios">
          <LayoutGrid size={14} aria-hidden="true" />
          <span>＋ E muitos outros negócios</span>
        </p>
      </div>
    </section>
  );
};

export default SegmentsStrip;
