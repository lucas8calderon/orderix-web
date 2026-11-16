/**
 * Segmentos do carrossel e do modal do Weper Hub.
 * Uma única lista: card e modal leem os mesmos campos.
 *
 * name: título. description: linha curta. image: mesma foto do card.
 * icon: ícone do estabelecimento (fallback do card e detalhe do modal).
 * benefits: exatamente 3 itens { icon, title, description }.
 *
 * A URL de demonstração não é duplicada aqui. resolveSegmentDestination
 * devolve a demoUrl real (DEMO_OPTIONS ativo ou delivery já conhecido).
 * Com URL, o modal destaca "Ver demonstração". Sem URL, só "Conhecer a Weper".
 */
import {
  Beef,
  Beer,
  Bike,
  CakeSlice,
  Candy,
  ChefHat,
  Citrus,
  ClipboardList,
  Coffee,
  CreditCard,
  Croissant,
  Drumstick,
  Fish,
  Flame,
  IceCream,
  IceCreamCone,
  Package,
  Pizza,
  Salad,
  Smartphone,
  Soup,
  Store,
  Truck,
  Utensils,
  UtensilsCrossed,
} from 'lucide-react';
import { DEMO_OPTIONS } from './hubConfig';

/** Links de delivery já citados no Hub. Não adicionar URL nova aqui. */
export const KNOWN_SEGMENT_DELIVERY_URLS = new Set([
  'https://www.weper.com.br/delivery/japa',
  'https://www.weper.com.br/delivery/marmita',
]);

function benefit(icon, title, description) {
  return { icon, title, description };
}

export const HUB_SEGMENTS = [
  {
    id: 'hamburguerias',
    name: 'Hamburguerias',
    description: 'Combos, balcão e delivery juntos.',
    icon: Beef,
    image: '/images/demo/burger/cover.jpg',
    demoId: 'weper-burger',
    benefits: [
      benefit(ClipboardList, 'Gestão de pedidos e combos', 'Combos, balcão e delivery no mesmo atendimento.'),
      benefit(Smartphone, 'Cardápio digital com adicionais', 'O cliente monta o pedido no celular.'),
      benefit(Bike, 'Delivery próprio sem comissão por pedido', 'A entrega sai com a marca da casa.'),
    ],
  },
  {
    id: 'pizzarias',
    name: 'Pizzarias',
    description: 'Tamanhos, bordas e sabores no pedido.',
    icon: Pizza,
    image: '/images/demo/pizza/cover.jpg',
    demoId: 'weper-pizza',
    benefits: [
      benefit(Pizza, 'Organização de sabores e adicionais', 'Tamanhos, bordas e sabores no mesmo pedido.'),
      benefit(ChefHat, 'Pedidos enviados para a cozinha', 'A produção recebe o pedido sem papel.'),
      benefit(Bike, 'Delivery próprio e acompanhamento de pedidos', 'A entrega segue com a marca da casa.'),
    ],
  },
  {
    id: 'pastelarias',
    name: 'Pastelarias',
    description: 'Pastéis, combos e fila sem papel.',
    icon: UtensilsCrossed,
    image: '/images/demo/pastel/cover.jpg',
    demoId: 'weper-pastel',
    benefits: [
      benefit(UtensilsCrossed, 'Combos no mesmo pedido', 'Pastel, bebida e combo sem anotar.'),
      benefit(Bike, 'Balcão e delivery próprio', 'Os dois canais usam o mesmo cardápio.'),
      benefit(ChefHat, 'Pedido no preparo', 'A chapa recebe o pedido organizado.'),
    ],
  },
  {
    id: 'acaiterias',
    name: 'Açaiterias',
    description: 'Copos, complementos e menos fila.',
    icon: IceCream,
    image: '/images/segments/acaiterias.webp',
    demoId: 'weper-acai',
    benefits: [
      benefit(IceCream, 'Personalização de tamanhos e complementos', 'O copo é montado no pedido, sem anotar.'),
      benefit(Smartphone, 'Cardápio digital', 'Tamanhos e adicionais visíveis no celular.'),
      benefit(ClipboardList, 'Gestão de pedidos e entregas', 'Balcão, retirada e delivery no mesmo lugar.'),
    ],
  },
  {
    id: 'marmitarias',
    name: 'Marmitarias',
    description: 'Cardápio do dia e retirada organizada.',
    icon: Soup,
    image: '/images/segments/marmitarias.webp',
    deliveryUrl: 'https://www.weper.com.br/delivery/marmita',
    benefits: [
      benefit(Soup, 'Organização do cardápio diário', 'O cardápio do dia atualiza sem reimprimir.'),
      benefit(Bike, 'Pedidos para retirada e delivery', 'Retirada e entrega entram no mesmo fluxo.'),
      benefit(Package, 'Controle de vendas e estoque', 'O que vendeu e o que saiu ficam registrados.'),
    ],
  },
  {
    id: 'japones',
    name: 'Restaurantes Japoneses',
    description: 'Combinados e delivery com a sua marca.',
    icon: Fish,
    image: '/images/segments/japones.webp',
    deliveryUrl: 'https://www.weper.com.br/delivery/japa',
    benefits: [
      benefit(Fish, 'Organização de combinados e adicionais', 'Combinados e peças no mesmo pedido.'),
      benefit(ChefHat, 'Gestão de pedidos na cozinha', 'A cozinha recebe o pedido organizado.'),
      benefit(Smartphone, 'Cardápio digital e delivery', 'Cardápio e entrega com a marca da casa.'),
    ],
  },
  {
    id: 'lanchonetes',
    name: 'Lanchonetes',
    description: 'Pedido rápido no balcão ou viagem.',
    icon: Store,
    image: '/images/segments/lanchonetes.webp',
    benefits: [
      benefit(Store, 'Atendimento de balcão', 'Agilidade e organização nas vendas.'),
      benefit(Smartphone, 'Cardápio sempre visível no celular', 'Mais praticidade para seus clientes.'),
      benefit(CreditCard, 'Conta e pagamento sem papel', 'Mais controle e eficiência no caixa.'),
    ],
  },
  {
    id: 'padarias',
    name: 'Padarias',
    description: 'Balcão, encomendas e menos fila.',
    icon: Croissant,
    image: '/images/segments/padarias.webp',
    benefits: [
      benefit(Store, 'Venda no balcão', 'Atendimento rápido, sem anotar em papel.'),
      benefit(Smartphone, 'Cardápio digital da vitrine', 'O que está disponível aparece no celular.'),
      benefit(CreditCard, 'Registro das vendas', 'Cada venda fica no caixa, no mesmo sistema.'),
    ],
  },
  {
    id: 'sorveterias',
    name: 'Sorveterias',
    description: 'Sabores, coberturas e venda no balcão.',
    icon: IceCreamCone,
    image: '/images/segments/sorveterias.webp',
    benefits: [
      benefit(IceCreamCone, 'Sabores e coberturas no pedido', 'O cliente escolhe no cardápio digital.'),
      benefit(Store, 'Atendimento de balcão', 'O pedido chega organizado, sem papel.'),
      benefit(Smartphone, 'Cardápio fácil de atualizar', 'Sabores do dia entram e saem na hora.'),
    ],
  },
  {
    id: 'restaurantes',
    name: 'Restaurantes',
    description: 'Salão, cozinha e conta no mesmo lugar.',
    icon: Utensils,
    image: '/images/segments/restaurantes.webp',
    benefits: [
      benefit(Utensils, 'Mesas e comandas', 'O salão lança o pedido na mesa.'),
      benefit(ChefHat, 'Pedido na cozinha', 'A cozinha recebe sem recado de papel.'),
      benefit(CreditCard, 'Conta e pagamento', 'O fechamento da mesa fica no mesmo sistema.'),
    ],
  },
  {
    id: 'cafeterias',
    name: 'Cafeterias',
    description: 'Pedidos curtos e cardápio atualizado.',
    icon: Coffee,
    image: '/images/segments/cafeterias.webp',
    benefits: [
      benefit(Coffee, 'Pedido rápido no balcão', 'Menos espera no horário de pico.'),
      benefit(Smartphone, 'Cardápio digital', 'Bebidas e acompanhamentos sempre visíveis.'),
      benefit(CreditCard, 'Conta sem papel', 'O pagamento fecha junto com o pedido.'),
    ],
  },
  {
    id: 'docerias',
    name: 'Docerias',
    description: 'Encomendas e vitrine no celular.',
    icon: Candy,
    image: '/images/segments/docerias.webp',
    benefits: [
      benefit(Smartphone, 'Vitrine no celular', 'Doces e preços visíveis para o cliente.'),
      benefit(ClipboardList, 'Encomenda registrada', 'O pedido fica no sistema, sem recado perdido.'),
      benefit(Store, 'Venda no balcão', 'Atendimento e pagamento no mesmo fluxo.'),
    ],
  },
  {
    id: 'confeitarias',
    name: 'Confeitarias',
    description: 'Bolos sob encomenda e produção no controle.',
    icon: CakeSlice,
    image: '/images/segments/confeitarias.webp',
    benefits: [
      benefit(CakeSlice, 'Encomenda no pedido', 'Bolo e observações ficam registrados.'),
      benefit(ChefHat, 'Produção por pedido', 'A cozinha vê o que precisa sair.'),
      benefit(Smartphone, 'Cardápio da vitrine', 'Sabores e preços no celular.'),
    ],
  },
  {
    id: 'bares',
    name: 'Bares',
    description: 'Comanda, mesas e conta no ritmo da casa.',
    icon: Beer,
    image: '/images/segments/bares.webp',
    benefits: [
      benefit(Beer, 'Comanda por mesa', 'O consumo da mesa fica reunido.'),
      benefit(ClipboardList, 'Pedido no preparo', 'O lançamento segue da mesa para o preparo.'),
      benefit(CreditCard, 'Fechamento da conta', 'A conta usa o que foi lançado na comanda.'),
    ],
  },
  {
    id: 'espetarias',
    name: 'Espetarias',
    description: 'Espetos, porções e pedido da mesa.',
    icon: Flame,
    image: '/images/segments/espetarias.webp',
    benefits: [
      benefit(Flame, 'Porções e espetos na comanda', 'A mesa pede e o consumo fica junto.'),
      benefit(ChefHat, 'Pedido na chapa', 'O preparo recebe o pedido sem papel.'),
      benefit(CreditCard, 'Conta no fechamento', 'O fechamento mostra o que foi consumido.'),
    ],
  },
  {
    id: 'churrascarias',
    name: 'Churrascarias',
    description: 'Mesas, rodízio e conta por pessoa.',
    icon: Beef,
    image: '/images/segments/churrascarias.webp',
    benefits: [
      benefit(Utensils, 'Controle de mesas', 'O salão acompanha mesa e consumo.'),
      benefit(ClipboardList, 'Pedidos organizados', 'O que a mesa pediu segue para a cozinha.'),
      benefit(CreditCard, 'Conta no fim do serviço', 'O fechamento lista o que foi lançado.'),
    ],
  },
  {
    id: 'food-trucks',
    name: 'Food Trucks',
    description: 'Cardápio digital onde o caminhão parar.',
    icon: Truck,
    image: '/images/segments/food-trucks.webp',
    benefits: [
      benefit(Smartphone, 'Cardápio no celular', 'O cliente vê as opções sem fila cega.'),
      benefit(ClipboardList, 'Pedido registrado', 'A venda entra no sistema mesmo na rua.'),
      benefit(CreditCard, 'Pagamento no pedido', 'A cobrança fecha junto com a venda.'),
    ],
  },
  {
    id: 'rotisserias',
    name: 'Rotisserias',
    description: 'Retirada, delivery e produção do dia.',
    icon: Drumstick,
    benefits: [
      benefit(Drumstick, 'Cardápio do dia', 'O que está pronto fica visível no celular.'),
      benefit(Bike, 'Retirada e delivery', 'Os dois canais no mesmo sistema.'),
      benefit(Store, 'Pedido no balcão', 'Menos confusão na hora de entregar.'),
    ],
  },
  {
    id: 'sucos',
    name: 'Casas de Sucos',
    description: 'Copos, combos e pedido sem fila.',
    icon: Citrus,
    benefits: [
      benefit(Citrus, 'Copos e combos', 'Tamanho e combo entram no mesmo pedido.'),
      benefit(Store, 'Pedido no balcão', 'A fila anda sem anotar no papel.'),
      benefit(ClipboardList, 'Preparo organizado', 'O pedido chega claro para quem monta.'),
    ],
  },
  {
    id: 'comida-saudavel',
    name: 'Restaurantes de Comida Saudável',
    description: 'Prato montado e opções bem claras.',
    icon: Salad,
    image: '/images/segments/comida-saudavel.webp',
    benefits: [
      benefit(Salad, 'Opções do prato visíveis', 'Montagem e ingredientes no cardápio.'),
      benefit(ChefHat, 'Pedido sem erro de item', 'O que o cliente escolheu chega na cozinha.'),
      benefit(Bike, 'Salão, retirada ou delivery', 'O mesmo cardápio nos três canais.'),
    ],
  },
];

export function resolveSegmentDestination(segment) {
  if (!segment) return null;

  if (segment.demoId) {
    const demo = DEMO_OPTIONS.find(
      (item) => item.active && item.id === segment.demoId && item.url
    );
    if (demo) return demo.url;
  }

  if (segment.deliveryUrl && KNOWN_SEGMENT_DELIVERY_URLS.has(segment.deliveryUrl)) {
    return segment.deliveryUrl;
  }

  return null;
}
