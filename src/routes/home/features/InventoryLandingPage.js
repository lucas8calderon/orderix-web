import { AlertTriangle, ArrowRight, Boxes, ClipboardCheck, PackagePlus, ShoppingCart, Tag, ToggleLeft } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';
import FeaturePageLayout, { FeatureList, FeatureNotes } from './FeaturePageLayout';

export const INVENTORY_PAGE_SEO = {
  title: 'Controle de estoque com baixa automática | Weper',
  description: 'O estoque baixa sozinho a cada venda no salão, no balcão e no delivery. Alerta de estoque baixo, entradas, saídas e histórico de movimentos no painel da loja.',
  canonical: 'https://www.weper.com.br/controle-de-estoque',
};

const STEPS = {
  title: 'Vendeu,',
  highlight: 'o saldo já mudou.',
  text: 'A contagem acompanha as vendas de todos os canais, sem planilha no fim do dia.',
  items: [
    { Icon: Tag, title: 'Escolha o que contar', text: 'No cadastro do produto, marque se ele entra no controle e informe a quantidade que você tem.' },
    { Icon: ShoppingCart, title: 'A venda baixa sozinha', text: 'Cada pedido do salão, do balcão ou do delivery desconta a quantidade vendida. Se o pedido for cancelado, a quantidade volta.' },
    { Icon: AlertTriangle, title: 'O painel avisa', text: 'Produtos com estoque baixo ou zerado aparecem em destaque no painel da loja.' },
    { Icon: PackagePlus, title: 'Você repõe', text: 'Registre a entrada da mercadoria e o saldo é atualizado. Cada entrada e saída fica no histórico.' },
  ],
};

const FEATURES = [
  'Controle opcional, produto por produto',
  'Baixa automática nas vendas de todos os canais',
  'Quantidade devolvida quando o pedido é cancelado',
  'Venda recusada quando o saldo não é suficiente',
  'Alertas de estoque baixo e sem estoque',
  'Entradas, saídas e histórico de movimentos',
];

const NOTES = [
  { Icon: Boxes, title: 'Contagem por produto vendido', text: 'O controle é feito pelo produto do cardápio, como a lata de refrigerante ou a fatia de torta. Ainda não há ficha técnica que desconte ingredientes.' },
  { Icon: ClipboardCheck, title: 'Comece pelo que mais importa', text: 'Você escolhe quais produtos entram na contagem. Bebidas e itens prontos costumam ser o melhor começo.' },
  { Icon: ToggleLeft, title: 'Disponibilidade é sua', text: 'Quando um produto acaba, você pode marcá-lo como indisponível no cardápio da loja.' },
];

const FAQS = {
  title: 'Dúvidas sobre o estoque',
  items: [
    ['Preciso controlar todos os produtos?', 'Não. O controle é opcional e você liga produto por produto. Os itens sem controle vendem normalmente, sem mexer em saldo.'],
    ['O estoque baixa nas vendas do delivery?', 'Sim. A baixa acontece nas vendas do salão, do balcão, das comandas e do delivery. No delivery pago online, a baixa acontece quando o pagamento é confirmado.'],
    ['E se o pedido for cancelado?', 'A quantidade volta para o estoque automaticamente, e o movimento fica registrado no histórico.'],
    ['O que acontece quando o produto acaba?', 'Se o saldo não for suficiente, a venda não é concluída. Você também pode marcar o produto como indisponível no cardápio.'],
    ['Dá para controlar ingredientes, como carne e pão?', 'Ainda não. Hoje a contagem é pelo produto vendido. Ingredientes e ficha técnica não fazem parte do controle.'],
  ],
};

export default function InventoryLandingPage() {
  const hero = {
    eyebrow: 'Controle de estoque Weper',
    title: 'O estoque baixa sozinho',
    highlight: 'a cada venda.',
    text: 'Marque quais produtos entram na contagem. A cada pedido do salão, do balcão ou do delivery, a Weper desconta a quantidade vendida e avisa quando está acabando.',
    actions: <><a className="wp-button wp-button--primary" href="/#plans">Ver a mensalidade <ArrowRight size={18} /></a><a className="wp-button wp-button--outline" href="#como-funciona">Ver como funciona <ArrowRight size={18} /></a></>,
    assurances: ['Baixa automática', 'Alerta de estoque baixo', 'Histórico de movimentos'],
  };
  return <FeaturePageLayout
    seo={INVENTORY_PAGE_SEO}
    path={PATHS.INVENTORY_LANDING}
    whatsappMessage="Olá! Quero saber como funciona o controle de estoque da Weper."
    hero={hero}
    steps={STEPS}
    faqs={FAQS}
    finalCta={{ kicker: 'MENOS SURPRESA NO MEIO DO SERVIÇO.', title: 'Quer ver o estoque', highlight: 'da sua loja no painel?' }}
  >
    <FeatureList kicker="O QUE O CONTROLE FAZ" title="O saldo certo," highlight="sem contar na mão." text="O estoque segue as vendas de todos os canais, e cada mudança fica registrada." items={FEATURES} />
    <FeatureNotes title="Como o controle" highlight="funciona hoje." notes={NOTES} />
  </FeaturePageLayout>;
}
