import React from 'react';
import {
  BarChart3,
  Box,
  QrCode,
  Users,
  ClipboardList,
  Store,
  FileText,
  MessageCircle,
} from 'lucide-react';

const RESOURCES = [
  {
    icon: ClipboardList,
    title: 'Mesas e comandas',
    description: 'Abertura, acompanhamento e fechamento no fluxo do salão.',
  },
  {
    icon: Store,
    title: 'Frente de caixa / balcão',
    description: 'Vendas rápidas para atendimento no balcão.',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e indicadores',
    description: 'Acompanhe vendas, ticket e desempenho da operação.',
  },
  {
    icon: Box,
    title: 'Catálogo de produtos',
    description: 'Cadastre itens, preços e disponibilidade do cardápio.',
  },
  {
    icon: Users,
    title: 'Gestão de equipe',
    description: 'Colaboradores com perfis e acesso por função.',
  },
  {
    icon: QrCode,
    title: 'Pedidos no salão',
    description: 'Lançamento pelo app do garçom, integrado a mesas e comandas.',
  },
  {
    icon: FileText,
    title: 'Histórico de vendas',
    description: 'Consulte pedidos e movimentações do período.',
  },
  {
    icon: MessageCircle,
    title: 'Suporte por WhatsApp',
    description: 'Canal direto para dúvidas e onboarding.',
  },
];

const ResourcesSection = () => {
  return (
    <section className="lp-section lp-section--muted" id="recursos" aria-labelledby="recursos-title">
      <div className="lp-container">
        <div className="lp-section-head">
          <span className="lp-eyebrow">Recursos</span>
          <h2 id="recursos-title" className="lp-title">Ferramentas para o dia a dia</h2>
          <p className="lp-subtitle">
            Recursos operacionais e de gestão para manter o estabelecimento sob controle.
          </p>
        </div>
        <div className="lp-grid-4">
          {RESOURCES.map(({ icon: Icon, title, description }) => (
            <article key={title} className="lp-mini-card">
              <div className="lp-mini-card__icon" aria-hidden="true">
                <Icon size={18} />
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

export default ResourcesSection;
