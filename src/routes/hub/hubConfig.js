/**
 * Configuração centralizada dos links do Weper Hub.
 * Permite alterar links, ordem e status sem modificar componentes.
 */
import { MessageCircle, ExternalLink, DollarSign, Users, Play } from 'lucide-react';
import { PATHS } from '../../services/accessControl';
import { WHATSAPP_NUMBER } from '../home/landingAssets';

/**
 * Link principal: destaque visual maior
 */
export const PRIMARY_LINK = {
  id: 'conhecer-weper',
  title: 'Conheça a Weper',
  description: 'Descubra como simplificar a gestão do seu estabelecimento.',
  icon: ExternalLink,
  url: PATHS.HOME,
  type: 'external',
  active: true,
  order: 1,
  featured: true,
};

/**
 * Links secundários: grid principal
 */
export const SECONDARY_LINKS = [
  {
    id: 'funcionalidades',
    title: 'Funcionalidades',
    description: 'Conheça tudo que a Weper oferece.',
    icon: ExternalLink,
    url: '/#funcionalidades',
    type: 'external',
    active: true,
    order: 2,
  },
  {
    id: 'demonstracoes',
    title: 'Demonstrações interativas',
    description: 'Veja como funciona na prática.',
    icon: Play,
    type: 'modal',
    action: 'open-demos',
    active: true,
    order: 3,
  },
  {
    id: 'planos',
    title: 'Planos e preços',
    description: 'Encontre o plano ideal para seu negócio.',
    subtitle: 'A partir de R$ 39,90/mês',
    icon: DollarSign,
    url: '/#plans',
    type: 'external',
    active: true,
    order: 4,
  },
  {
    id: 'parceiros',
    title: 'Seja um parceiro',
    description: 'Indique a Weper e ganhe comissões.',
    icon: Users,
    url: PATHS.PARTNERS,
    type: 'external',
    active: true,
    order: 5,
  },
  {
    id: 'whatsapp',
    title: 'Fale com nossa equipe',
    description: 'Tire suas dúvidas pelo WhatsApp.',
    icon: MessageCircle,
    url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo link da bio e gostaria de conhecer a Weper.')}`,
    type: 'external',
    active: true,
    order: 6,
    highlight: 'whatsapp',
  },
];

/**
 * Demonstrações disponíveis
 */
export const DEMO_OPTIONS = [
  {
    id: 'weper-burger',
    name: 'Hamburgueria',
    description: 'Smash burgers, combos e acompanhamentos',
    url: '/demo/weper-burger',
    active: true,
  },
  {
    id: 'weper-pizza',
    name: 'Pizzaria',
    description: 'Pizzas, tamanhos e bordas personalizáveis',
    url: '/demo/weper-pizza',
    active: true,
  },
  {
    id: 'weper-acai',
    name: 'Açaí',
    description: 'Açaí, complementos e bebidas',
    url: '/delivery/acai',
    active: true,
  },
  {
    id: 'weper-pastel',
    name: 'Pastelaria',
    description: 'Pastéis salgados, doces e bebidas',
    url: '/demo/weper-pastel',
    active: true,
  },
];

/**
 * Retorna todos os links ativos ordenados
 */
export function getActiveLinks() {
  return [PRIMARY_LINK, ...SECONDARY_LINKS]
    .filter((link) => link.active)
    .sort((a, b) => a.order - b.order);
}

/**
 * Retorna demonstrações ativas
 */
export function getActiveDemos() {
  return DEMO_OPTIONS.filter((demo) => demo.active);
}
