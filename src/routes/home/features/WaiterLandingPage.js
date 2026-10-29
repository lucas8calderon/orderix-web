import { ArrowRight, ChefHat, ClipboardList, Receipt, Smartphone, Wifi, Printer } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import FeaturePageLayout, { FeatureList, FeatureNotes } from './FeaturePageLayout';

export const WAITER_PAGE_SEO = {
  title: 'App para garçom com mesas e comandas | Weper',
  description: 'O garçom lança o pedido no celular Android, a cozinha recebe na hora e a conta da mesa ou da comanda fecha no app ou no caixa. Sistema para restaurantes, bares e lanchonetes.',
  canonical: 'https://www.weper.com.br/app-garcom',
};

const STEPS = {
  title: 'Da mesa à cozinha',
  highlight: 'sem bloquinho de papel.',
  text: 'O garçom anota no celular e o pedido chega na cozinha na hora, sem ninguém precisar levar a comanda.',
  items: [
    { Icon: ClipboardList, title: 'Abre a mesa ou a comanda', text: 'O garçom vê no app quais mesas estão livres e quais estão ocupadas, e escolhe onde lançar.' },
    { Icon: Smartphone, title: 'Lança os itens', text: 'Ele escolhe os produtos do cardápio da loja, com os adicionais e as observações do cliente.' },
    { Icon: ChefHat, title: 'A cozinha recebe', text: 'O pedido aparece no painel da cozinha e, se a loja quiser, sai impresso na impressora da cozinha.' },
    { Icon: Receipt, title: 'Fecha a conta', text: 'A conta da mesa ou da comanda fecha no app ou no caixa do painel web, com taxa de serviço e forma de pagamento.' },
  ],
};

const FEATURES = [
  'Mesas com situação de livre ou ocupada',
  'Comandas individuais e pedidos de balcão',
  'Produtos com adicionais e observações',
  'Via da cozinha em impressora térmica Bluetooth',
  'Caixa no painel web, com abertura, fechamento, sangria e suprimento',
  'Colaboradores com acesso próprio de garçom ou de caixa',
];

const NOTES = [
  { Icon: Smartphone, title: 'Celular Android', text: 'O app do garçom roda em celulares Android. Ainda não há versão para iPhone.' },
  { Icon: Wifi, title: 'Internet no salão', text: 'O app envia o pedido na hora, por isso precisa de conexão. Vale conferir o sinal do Wi-Fi nas mesas mais distantes.' },
  { Icon: Printer, title: 'Impressora é opcional', text: 'A cozinha pode acompanhar tudo pela tela. Quem prefere papel usa uma impressora térmica Bluetooth.' },
];

const FAQS = {
  title: 'Dúvidas sobre o app do garçom',
  items: [
    ['Funciona no iPhone?', 'Ainda não. O app do garçom é para celulares Android. O painel de gestão e o caixa funcionam no navegador do computador.'],
    ['Como cada garçom entra no app?', 'O dono cadastra os colaboradores no painel da loja. Cada um entra com o próprio acesso, de garçom ou de caixa.'],
    ['Preciso de impressora?', 'Não. A cozinha pode trabalhar só com o painel na tela. Se a loja quiser a via em papel, o app imprime em impressora térmica Bluetooth.'],
    ['A taxa de serviço entra na conta?', 'Sim. No fechamento da mesa ou da comanda, a conta mostra a taxa de serviço de 10% junto com os itens.'],
    ['Funciona sem internet?', 'Não. O pedido vai para a cozinha pela internet, então o celular precisa estar conectado.'],
    ['O app tem custo à parte?', 'Não. O app do garçom faz parte da mensalidade da Weper, que segue o volume processado na plataforma.'],
  ],
};

export default function WaiterLandingPage() {
  const hero = {
    eyebrow: 'App do garçom Weper',
    title: 'O garçom lança o pedido no celular.',
    highlight: 'A comanda não fica no papel.',
    text: 'Mesas, comandas e balcão no mesmo app Android. O pedido vai direto para a cozinha, e a conta fecha no app ou no caixa do painel web.',
    actions: <><a className="wp-button wp-button--primary" href="/#plans">Ver a mensalidade <ArrowRight size={18} /></a><a className="wp-button wp-button--outline" href="#como-funciona">Ver como funciona <ArrowRight size={18} /></a></>,
    assurances: ['App para Android', 'Mesas e comandas', 'Pedido direto na cozinha'],
  };
  return <FeaturePageLayout
    seo={WAITER_PAGE_SEO}
    path={PATHS.WAITER_LANDING}
    whatsappMessage="Olá! Quero saber como funciona o app do garçom da Weper."
    hero={hero}
    steps={STEPS}
    faqs={FAQS}
    finalCta={{ kicker: 'MENOS PAPEL. MENOS ERRO.', title: 'Quer ver o app', highlight: 'na sua operação?' }}
  >
    <FeatureList kicker="O QUE O APP FAZ" title="Salão, balcão" highlight="e caixa conectados." text="O que o garçom lança no app aparece no painel da loja e no caixa, sem digitar duas vezes." items={FEATURES} />
    <FeatureNotes title="O que a loja" highlight="precisa ter." notes={NOTES} />
  </FeaturePageLayout>;
}
