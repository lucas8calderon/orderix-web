import { Boxes, ChefHat, ShoppingBag, Smartphone, Tablet } from 'lucide-react';
import { PATHS } from '../../../services/accessControl';

/**
 * Páginas de funcionalidade, na ordem dos cartões da home e do rodapé.
 * Só entra aqui o que está pronto no produto.
 */
export const FEATURE_PAGES = [
  { path: PATHS.DELIVERY_LANDING, label: 'Delivery sem comissão', Icon: ShoppingBag, summary: 'O pedido que chega pelo link da sua loja não paga comissão.' },
  { path: PATHS.WAITER_LANDING, label: 'App do garçom', Icon: Smartphone, summary: 'Pedido lançado no celular, direto na cozinha.' },
  { path: PATHS.KITCHEN_LANDING, label: 'Painel da cozinha', Icon: ChefHat, summary: 'Salão, balcão e delivery na mesma tela, por etapa.' },
  { path: PATHS.INVENTORY_LANDING, label: 'Controle de estoque', Icon: Boxes, summary: 'O saldo baixa sozinho a cada venda.' },
  { path: PATHS.SELF_SERVICE_LANDING, label: 'Autoatendimento', Icon: Tablet, summary: 'O cliente faz o pedido no tablet da loja.' },
];
