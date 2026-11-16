/**
 * Configuração centralizada dos links do Weper Hub.
 * Permite alterar links, ordem e status sem modificar componentes.
 * REDESIGN COMPLETO: nova estrutura com cards de destaque e acesso rápido
 */
import { MessageCircle, DollarSign, Users, Play, Grid3x3, Calendar, BookOpen, Headphones } from 'lucide-react';
import { PATHS } from '../../services/accessControl';
import { WHATSAPP_NUMBER } from '../home/landingAssets';

/**
 * Cards de destaque (2 colunas): Demonstrações e Funcionalidades
 */
export const FEATURED_CARDS = [
  {
    id: 'demonstracoes',
    title: 'Demonstrações',
    description: 'Veja como funciona na prática.',
    icon: Play,
    type: 'modal',
    action: 'open-demos',
    active: true,
    order: 10,
  },
  {
    id: 'funcionalidades',
    title: 'Funcionalidades',
    description: 'Conheça tudo que a Weper oferece.',
    icon: Grid3x3,
    url: '/#funcionalidades',
    type: 'external',
    active: true,
    order: 20,
  },
];

/**
 * Links de acesso rápido (lista completa)
 */
export const QUICK_ACCESS_LINKS = [
  {
    id: 'planos',
    title: 'Planos e preços',
    description: 'Encontre o plano ideal para seu negócio.',
    subtitle: 'A partir de R$ 39,90/mês',
    icon: DollarSign,
    url: '/#plans',
    type: 'external',
    active: true,
    order: 30,
  },
  {
    id: 'parceiros',
    title: 'Seja um parceiro',
    description: 'Indique a Weper e ganhe comissões.',
    icon: Users,
    url: PATHS.PARTNERS,
    type: 'external',
    active: true,
    order: 40,
  },
  {
    id: 'agendar',
    title: 'Agendar demonstração',
    description: 'Escolha o melhor horário e conheça o sistema.',
    icon: Calendar,
    url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de agendar uma demonstração da Weper.')}`,
    type: 'external',
    active: true,
    order: 50,
  },
  {
    id: 'conteudos',
    title: 'Conteúdos & Materiais',
    description: 'Guias, tutoriais e novidades da Weper.',
    icon: BookOpen,
    url: 'https://www.weper.com.br/#resources',
    type: 'external',
    active: false, // Desabilitado até ter página dedicada
    order: 60,
  },
  {
    id: 'suporte',
    title: 'Suporte ao cliente',
    description: 'Já é cliente? Entre em contato com nossa equipe.',
    icon: Headphones,
    url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Sou cliente Weper e preciso de suporte.')}`,
    type: 'external',
    active: true,
    order: 70,
  },
];

/**
 * Card especial WhatsApp (destaque verde)
 */
export const WHATSAPP_CARD = {
  id: 'whatsapp',
  title: 'Fale com nossa equipe',
  description: 'Tire suas dúvidas pelo WhatsApp.',
  icon: MessageCircle,
  url: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Vim pelo Weper Hub e gostaria de saber mais.')}`,
  type: 'external',
  active: true,
  order: 80,
  highlight: 'whatsapp',
};

/**
 * Link principal (mantido para compatibilidade com testes)
 * @deprecated Agora o banner é o destaque principal
 */
export const PRIMARY_LINK = {
  id: 'banner-principal',
  title: 'Conheça a Weper',
  description: 'Simplifique a gestão do seu estabelecimento.',
  icon: Grid3x3,
  url: PATHS.HOME,
  type: 'external',
  active: true,
  order: 0,
  featured: true,
};

/**
 * Links secundários legados (para compatibilidade)
 * @deprecated Use FEATURED_CARDS, QUICK_ACCESS_LINKS e WHATSAPP_CARD
 */
export const SECONDARY_LINKS = [
  ...FEATURED_CARDS,
  ...QUICK_ACCESS_LINKS,
  WHATSAPP_CARD,
].filter(link => link.active);

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
