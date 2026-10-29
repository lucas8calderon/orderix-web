import { PATHS } from '../../../services/accessControl';

/** Páginas de funcionalidade, na ordem do rodapé. Só entra aqui o que está pronto no produto. */
export const FEATURE_PAGES = [
  { path: PATHS.DELIVERY_LANDING, label: 'Delivery sem comissão' },
  { path: PATHS.WAITER_LANDING, label: 'App do garçom' },
  { path: PATHS.KITCHEN_LANDING, label: 'Painel da cozinha' },
  { path: PATHS.INVENTORY_LANDING, label: 'Controle de estoque' },
  { path: PATHS.SELF_SERVICE_LANDING, label: 'Autoatendimento' },
];
