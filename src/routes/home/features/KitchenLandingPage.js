import { ArrowRight, BellOff, CheckCircle2, ChefHat, Flame, Monitor, PackageCheck, Wifi } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import FeaturePageLayout, { FeatureList, FeatureNotes } from './FeaturePageLayout';

export const KITCHEN_PAGE_SEO = {
  title: 'Painel de cozinha KDS para restaurantes | Weper',
  description: 'Pedidos do salão, do balcão e do delivery na mesma tela da cozinha, organizados por etapa, com filtro por canal e destaque para os atrasados. Funciona no navegador.',
  canonical: 'https://www.weper.com.br/cozinha-kds',
};

const STEPS = {
  title: 'Cada pedido',
  highlight: 'na etapa certa.',
  text: 'A cozinha move o pedido de etapa com um toque, e quem atende vê o andamento sem precisar perguntar.',
  items: [
    { Icon: ChefHat, title: 'O pedido chega', text: 'Pedidos do garçom, do balcão, da comanda e do delivery aparecem na mesma tela, sem ninguém levar papel.' },
    { Icon: Flame, title: 'Entra em preparo', text: 'A equipe marca o que já está sendo feito, e o pedido muda de coluna.' },
    { Icon: PackageCheck, title: 'Fica pronto', text: 'O pedido pronto fica separado, à vista de quem vai servir ou despachar.' },
    { Icon: CheckCircle2, title: 'Sai da cozinha', text: 'No delivery, cada mudança de etapa aparece na página de acompanhamento do cliente.' },
  ],
};

const FEATURES = [
  'Pedidos de todos os canais na mesma tela',
  'Colunas por etapa: novo, em produção, feito, entregue e finalizado',
  'Filtro por canal, que pode combinar vários ao mesmo tempo',
  'Filtro de atrasados: pedidos há 20 minutos ou mais sem ficar prontos',
  'Cancelamento com motivo, que aparece para o cliente do delivery',
  'Atualização automática da tela a cada poucos segundos',
];

const NOTES = [
  { Icon: Monitor, title: 'Uma tela com navegador', text: 'Serve uma TV com navegador, um monitor ou um tablet. Não precisa instalar programa.' },
  { Icon: BellOff, title: 'Sem aviso sonoro', text: 'A tela se atualiza sozinha, mas ainda não toca som quando chega pedido. Deixe a tela à vista de quem prepara.' },
  { Icon: Wifi, title: 'Internet na cozinha', text: 'O painel busca os pedidos pela internet, então a tela precisa de conexão estável.' },
];

const FAQS = {
  title: 'Dúvidas sobre o painel da cozinha',
  items: [
    ['Preciso comprar um equipamento específico?', 'Não. O painel abre no navegador, em qualquer TV, monitor ou tablet com internet.'],
    ['Os pedidos do delivery aparecem junto?', 'Sim. Delivery, retirada, mesa, comanda e balcão aparecem na mesma tela. Use o filtro de canal para ver só um tipo.'],
    ['Como sei que um pedido está atrasado?', 'O filtro de atrasados mostra os pedidos que estão há 20 minutos ou mais como novos ou em preparo.'],
    ['Posso continuar imprimindo a via da cozinha?', 'Sim. O app do garçom imprime a via em impressora térmica Bluetooth, e o painel pode ser usado junto ou no lugar do papel.'],
    ['O cliente do delivery vê o andamento?', 'Sim. Quando a cozinha muda a etapa, a página de acompanhamento do cliente mostra a mudança.'],
  ],
};

export default function KitchenLandingPage() {
  const hero = {
    eyebrow: 'Painel da cozinha Weper',
    title: 'A cozinha vê o que chegou, o que está em preparo',
    highlight: 'e o que já pode sair.',
    text: 'Pedidos do salão, do balcão e do delivery na mesma tela, organizados por etapa. Funciona no navegador de uma TV, monitor ou tablet.',
    actions: <><a className="wp-button wp-button--primary" href="/#plans">Ver a mensalidade <ArrowRight size={18} /></a><a className="wp-button wp-button--outline" href="#como-funciona">Ver como funciona <ArrowRight size={18} /></a></>,
    assurances: ['Todos os canais na mesma tela', 'Destaque para atrasados', 'Sem instalar programa'],
  };
  return <FeaturePageLayout
    seo={KITCHEN_PAGE_SEO}
    path={PATHS.KITCHEN_LANDING}
    whatsappMessage="Olá! Quero saber como funciona o painel da cozinha da Weper."
    hero={hero}
    steps={STEPS}
    faqs={FAQS}
    finalCta={{ kicker: 'COZINHA NO RITMO.', title: 'Quer ver o painel', highlight: 'na sua cozinha?' }}
  >
    <FeatureList kicker="O QUE O PAINEL FAZ" title="Menos grito" highlight="no passa-prato." text="Quem prepara vê a fila, e quem atende sabe o que já está pronto." items={FEATURES} />
    <FeatureNotes title="O que a cozinha" highlight="precisa ter." notes={NOTES} />
  </FeaturePageLayout>;
}
