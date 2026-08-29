import React from 'react';
import { Smartphone, Monitor, Tablet, LayoutDashboard } from 'lucide-react';
import { DashboardMockup, KdsMockup, PhoneMockup, TabletMockup } from './DeviceMockups';

const ITEMS = [
  {
    icon: Smartphone,
    title: 'App Garçom',
    description: 'Lançamento de pedidos rápido no celular ou tablet, direto do salão.',
  },
  {
    icon: Monitor,
    title: 'Sistema KDS',
    description: 'Organize a cozinha com status Novo, Em preparo, Pronto e Entregue.',
  },
  {
    icon: Tablet,
    title: 'Autoatendimento',
    description: 'Em breve: o cliente escolhe e envia o pedido pela mesa.',
  },
  {
    icon: LayoutDashboard,
    title: 'Painel Administrativo',
    description: 'Visão da operação, vendas, cardápio e equipe em um só lugar.',
  },
];

const EcosystemSection = () => {
  return (
    <section className="lp-section lp-section--surface" id="produto" aria-labelledby="eco-title">
      <div className="lp-container eco-layout">
        <div>
          <span className="lp-eyebrow">Ecossistema Weper</span>
          <h2 id="eco-title" className="lp-title">
            Um sistema completo para toda a operação
          </h2>
          <p className="lp-subtitle">
            Do salão à cozinha, do caixa à gestão: a Weper conecta os pontos críticos
            do seu estabelecimento para reduzir retrabalho e ganhar velocidade.
          </p>
          <ul className="eco-list">
            {ITEMS.map(({ icon: Icon, title, description }) => (
              <li key={title}>
                <span className="eco-list__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="eco-stage" aria-label="Composição dos produtos Weper">
          <div className="eco-stage__laptop">
            <KdsMockup />
          </div>
          <TabletMockup className="eco-stage__tablet" />
          <PhoneMockup className="eco-stage__phone" />
        </div>
      </div>
    </section>
  );
};

export function ProductSpotlightSections() {
  return (
    <>
      <section className="lp-section lp-section--muted" id="app-garcom" aria-labelledby="garcom-title">
        <div className="lp-container lp-spotlight">
          <div>
            <span className="lp-eyebrow">App Garçom</span>
            <h2 id="garcom-title" className="lp-title">Pedidos rápidos no salão</h2>
            <p className="lp-subtitle">
              Interface pensada para o ritmo do atendimento: lançar itens, acompanhar
              mesas e reduzir idas e vindas ao caixa.
            </p>
            <ul className="lp-spotlight__list">
              <li>
                <Smartphone size={18} aria-hidden="true" />
                Funciona no smartphone ou tablet do colaborador
              </li>
              <li>
                <Smartphone size={18} aria-hidden="true" />
                Integração com mesas, comandas e cozinha
              </li>
              <li>
                <Smartphone size={18} aria-hidden="true" />
                Menos erros de anotação e mais agilidade no pedido
              </li>
            </ul>
          </div>
          <div className="lp-spotlight__media">
            <PhoneMockup />
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--surface" id="kds" aria-labelledby="kds-title">
        <div className="lp-container lp-spotlight lp-spotlight--reverse">
          <div>
            <span className="lp-eyebrow">Sistema KDS</span>
            <h2 id="kds-title" className="lp-title">Cozinha organizada em tempo real</h2>
            <p className="lp-subtitle">
              Acompanhe o fluxo de produção com colunas claras de status e priorize
              o que precisa sair primeiro.
            </p>
            <ul className="lp-spotlight__list">
              <li>
                <Monitor size={18} aria-hidden="true" />
                Status: Novo → Em preparo → Pronto → Entregue
              </li>
              <li>
                <Monitor size={18} aria-hidden="true" />
                Visão por mesa, balcão e canal de pedido
              </li>
              <li>
                <Monitor size={18} aria-hidden="true" />
                Menos papel e mais sincronia entre salão e cozinha
              </li>
            </ul>
          </div>
          <div className="lp-spotlight__media">
            <KdsMockup />
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--muted" id="painel" aria-labelledby="painel-title">
        <div className="lp-container lp-spotlight">
          <div>
            <span className="lp-eyebrow">Painel Administrativo</span>
            <h2 id="painel-title" className="lp-title">Gestão com visão da operação</h2>
            <p className="lp-subtitle">
              Monitore vendas, equipe e indicadores do dia a dia sem sair do mesmo
              ambiente que você já usa para operar.
            </p>
            <ul className="lp-spotlight__list">
              <li>
                <LayoutDashboard size={18} aria-hidden="true" />
                Dashboard com métricas da operação
              </li>
              <li>
                <LayoutDashboard size={18} aria-hidden="true" />
                Controle de cardápio, mesas, comandas e colaboradores
              </li>
              <li>
                <LayoutDashboard size={18} aria-hidden="true" />
                Base para decisões rápidas no expediente
              </li>
            </ul>
          </div>
          <div className="lp-spotlight__media">
            <DashboardMockup />
          </div>
        </div>
      </section>

      <section className="lp-section lp-section--surface" id="autoatendimento" aria-labelledby="auto-title">
        <div className="lp-container lp-spotlight lp-spotlight--reverse">
          <div>
            <span className="lp-eyebrow">Em breve</span>
            <h2 id="auto-title" className="lp-title">Autoatendimento</h2>
            <p className="lp-subtitle">
              Este módulo ainda não faz parte da oferta atual. O foco do piloto é
              garçom, caixa, cozinha e painel — o pedido pela mesa entra no roadmap.
            </p>
            <ul className="lp-spotlight__list">
              <li>
                <Tablet size={18} aria-hidden="true" />
                Cardápio na mesa ou totem — em desenvolvimento
              </li>
              <li>
                <Tablet size={18} aria-hidden="true" />
                Hoje o pedido sai pelo app do garçom ou pelo caixa
              </li>
              <li>
                <Tablet size={18} aria-hidden="true" />
                Avise no WhatsApp se quiser acompanhar essa novidade
              </li>
            </ul>
          </div>
          <div className="lp-spotlight__media">
            <TabletMockup />
          </div>
        </div>
      </section>
    </>
  );
}

export default EcosystemSection;
