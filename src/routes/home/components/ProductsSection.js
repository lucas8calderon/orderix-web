import React from 'react';
import {
  Smartphone,
  Monitor,
  LayoutDashboard,
  CreditCard,
  Utensils,
  Package,
  BarChart3,
  Users,
  Sparkles,
} from 'lucide-react';
import '../styles/LandingPremium.css';

const PRODUCTS = [
  { icon: Smartphone, title: 'Atendimento', description: 'Mesas, comandas, balcão e pedidos.' },
  { icon: Utensils, title: 'Cardápio', description: 'Produtos, categorias, opcionais e variações.' },
  { icon: CreditCard, title: 'Pagamentos', description: 'Fechamento rápido com várias formas.' },
  { icon: Package, title: 'Estoque', description: 'Controle de estoque e insumos.' },
  { icon: BarChart3, title: 'Relatórios', description: 'Indicadores para acompanhar resultados.' },
  { icon: Users, title: 'Equipe', description: 'Acesso e permissões por função.' },
  { icon: LayoutDashboard, title: 'PDV', description: 'Estação completa para caixa e gestão.' },
  { icon: Monitor, title: 'KDS', description: 'Produção da cozinha em tempo real.' },
];

const ProductsSection = () => {
  return (
    <section className="lp-premium" id="funcionalidades" aria-labelledby="produtos-title">
      <div className="lp-premium__glow" aria-hidden="true" />
      <div className="lp-premium__container">
        <div className="lp-premium__head">
          <span className="lp-premium__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Funcionalidades
          </span>
          <h2 id="produtos-title" className="lp-premium__title">
            Tudo para
            {' '}
            <span className="lp-premium__accent">sua operação</span>
          </h2>
          <p className="lp-premium__subtitle">
            Do atendimento ao resultado, o essencial para operar com clareza.
          </p>
        </div>
        <div className="lp-premium-grid lp-premium-grid--4">
          {PRODUCTS.map(({ icon: Icon, title, description }) => (
            <article key={title} className="lp-premium-card">
              <div className="lp-premium-card__icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.75} />
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
