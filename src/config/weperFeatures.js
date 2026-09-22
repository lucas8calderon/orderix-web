/**
 * WEPER FEATURES
 * 
 * Lista de funcionalidades/produtos disponíveis na plataforma Weper.
 * Todas as funcionalidades estão incluídas independentemente da faixa de preço.
 */

import {
  LayoutDashboard,
  Monitor,
  Smartphone,
  ClipboardList,
  QrCode,
  CookingPot,
  Truck,
  TabletSmartphone,
  Package,
  ChartBar,
  FileText,
  CreditCard,
  Users,
} from 'lucide-react';

export const WEPER_FEATURES = [
  {
    id: 'pdv',
    title: 'PDV',
    description: 'Controle de vendas e operação do estabelecimento',
    Icon: Monitor,
  },
  {
    id: 'app-garcom',
    title: 'App Garçom',
    description: 'Pedidos, mesas, comandas e atendimento pelo celular',
    Icon: Smartphone,
  },
  {
    id: 'mesas-comandas',
    title: 'Mesas e Comandas',
    description: 'Controle completo dos atendimentos presenciais',
    Icon: ClipboardList,
  },
  {
    id: 'kds-cozinha',
    title: 'KDS / Cozinha',
    description: 'Pedidos organizados em tempo real para produção',
    Icon: CookingPot,
  },
  {
    id: 'cardapio-digital',
    title: 'Cardápio Digital',
    description: 'Cardápio acessível através de QR Code',
    Icon: QrCode,
  },
  {
    id: 'delivery-proprio',
    title: 'Delivery Próprio',
    description: 'Canal próprio de vendas sem depender de marketplaces',
    Icon: Truck,
  },
  {
    id: 'autoatendimento',
    title: 'Autoatendimento',
    description: 'Experiência de autoatendimento através de tablet',
    Icon: TabletSmartphone,
  },
  {
    id: 'estoque',
    title: 'Controle de Estoque',
    description: 'Acompanhamento dos produtos e disponibilidade',
    Icon: Package,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Indicadores e acompanhamento da operação',
    Icon: LayoutDashboard,
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    description: 'Informações estratégicas sobre vendas e desempenho',
    Icon: ChartBar,
  },
  {
    id: 'pagamentos',
    title: 'Pagamentos',
    description: 'Integrações disponíveis de acordo com as soluções suportadas',
    Icon: CreditCard,
  },
  {
    id: 'colaboradores',
    title: 'Gestão de Colaboradores',
    description: 'Controle dos usuários e permissões da operação',
    Icon: Users,
  },
];

/**
 * Retorna as funcionalidades em formato simplificado (apenas título).
 * Útil para listas de verificação.
 */
export function getFeatureTitles() {
  return WEPER_FEATURES.map((f) => f.title);
}

/**
 * Retorna uma feature pelo ID.
 */
export function getFeatureById(id) {
  return WEPER_FEATURES.find((f) => f.id === id);
}
