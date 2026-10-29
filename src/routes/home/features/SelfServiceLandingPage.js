import { ArrowRight, ChefHat, QrCode, Receipt, ShieldCheck, Tablet, TabletSmartphone, UserCheck } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import FeaturePageLayout, { FeatureList, FeatureNotes } from './FeaturePageLayout';

export const SELF_SERVICE_PAGE_SEO = {
  title: 'Autoatendimento em tablet para restaurantes | Weper',
  description: 'O cliente lê o QR Code da comanda no tablet Android e faz o próprio pedido, que vai direto para a cozinha e entra na conta da comanda.',
  canonical: 'https://www.weper.com.br/autoatendimento',
};

const STEPS = {
  title: 'O cliente pede,',
  highlight: 'a equipe só acompanha.',
  text: 'O pedido feito no tablet segue o mesmo caminho do pedido do garçom: cozinha, conta e fechamento.',
  items: [
    { Icon: QrCode, title: 'A equipe abre a comanda', text: 'No painel ou no app, a equipe gera o QR Code da comanda do cliente.' },
    { Icon: Tablet, title: 'O cliente lê o QR no tablet', text: 'A câmera do tablet lê o QR Code e abre o cardápio ligado àquela comanda.' },
    { Icon: ChefHat, title: 'Escolhe e envia', text: 'O cliente escolhe os produtos e os adicionais. O pedido vai direto para o painel da cozinha.' },
    { Icon: Receipt, title: 'A conta fecha no caixa', text: 'Os itens entram na conta da comanda, que a equipe fecha no caixa ou no app.' },
  ],
};

const FEATURES = [
  'Tablet Android com o app da Weper em modo autoatendimento',
  'QR Code próprio para cada comanda',
  'QR Code invalidado quando a comanda é fechada',
  'Pedido direto no painel da cozinha',
  'Itens na mesma conta que o garçom e o caixa veem',
  'Produtos e adicionais do cardápio da loja',
];

const NOTES = [
  { Icon: TabletSmartphone, title: 'Tablet Android', text: 'O autoatendimento roda no app da Weper em tablet Android. Ainda não há versão em totem web nem para iPad.' },
  { Icon: UserCheck, title: 'Login da equipe no tablet', text: 'Alguém da equipe entra uma vez com o próprio acesso. Depois disso, o cliente só lê o QR Code e pede.' },
  { Icon: ShieldCheck, title: 'Pagamento no fechamento', text: 'O tablet registra o pedido. O pagamento acontece no fechamento da comanda, com a equipe.' },
];

const FAQS = {
  title: 'Dúvidas sobre o autoatendimento',
  items: [
    ['Funciona em totem ou no celular do cliente?', 'Hoje o autoatendimento é no tablet Android, com o app da Weper. Não há versão em totem web nem pedido pelo celular do cliente.'],
    ['O cliente paga no tablet?', 'Não. O tablet registra o pedido na comanda. O pagamento é feito no fechamento da comanda, no caixa ou com o garçom.'],
    ['O pedido do tablet vai para a cozinha?', 'Sim. Ele aparece no painel da cozinha junto com os pedidos do garçom, do balcão e do delivery.'],
    ['E se alguém usar o QR Code de uma comanda já fechada?', 'Não funciona. Quando a comanda é fechada, o QR Code deixa de valer.'],
    ['Preciso de um tablet específico?', 'Qualquer tablet Android com câmera e internet atende. A equipe orienta a configuração pelo WhatsApp.'],
  ],
};

export default function SelfServiceLandingPage() {
  const hero = {
    eyebrow: 'Autoatendimento Weper',
    title: 'O cliente faz o próprio pedido',
    highlight: 'no tablet da loja.',
    text: 'Um tablet Android vira autoatendimento: o cliente lê o QR Code da comanda e escolhe os produtos. O pedido vai direto para a cozinha e entra na conta da comanda.',
    actions: <><a className="wp-button wp-button--primary" href="/#plans">Ver a mensalidade <ArrowRight size={18} /></a><a className="wp-button wp-button--outline" href="#como-funciona">Ver como funciona <ArrowRight size={18} /></a></>,
    assurances: ['Tablet Android', 'QR Code por comanda', 'Pedido direto na cozinha'],
  };
  return <FeaturePageLayout
    seo={SELF_SERVICE_PAGE_SEO}
    path={PATHS.SELF_SERVICE_LANDING}
    whatsappMessage="Olá! Quero saber como funciona o autoatendimento em tablet da Weper."
    hero={hero}
    steps={STEPS}
    faqs={FAQS}
    finalCta={{ kicker: 'MENOS FILA NO BALCÃO.', title: 'Quer ver o autoatendimento', highlight: 'na sua loja?' }}
  >
    <FeatureList kicker="O QUE O TABLET FAZ" title="O pedido entra" highlight="sem fila no balcão." text="O cliente pede no próprio ritmo, e a equipe fica livre para preparar e servir." items={FEATURES} />
    <FeatureNotes title="O que a loja" highlight="precisa ter." notes={NOTES} />
  </FeaturePageLayout>;
}
