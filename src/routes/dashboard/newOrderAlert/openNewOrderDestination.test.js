import { PATHS, ROLES } from '../../../services/accessControl';
import {
  openNewOrderDestination,
  peekKitchenFocusId,
  takeOpenOrdersRequest,
} from './openNewOrderDestination';

const storeUser = (role) => ({ role, storeId: 4, subscriptionActive: true });

describe('destino do botão de pedido novo', () => {
  it('na cozinha pede foco no pedido mais novo e não troca de tela', () => {
    const navigate = jest.fn();
    const result = openNewOrderDestination({
      pathname: PATHS.APP_COZINHA,
      user: storeUser(ROLES.KITCHEN),
      newestOrderId: 15,
      navigate,
    });
    expect(result).toBe('kitchen-focus');
    expect(navigate).not.toHaveBeenCalled();
    expect(peekKitchenFocusId()).toBe('15');
  });

  it('fora da cozinha abre o atendimento na lista de pedidos abertos', () => {
    const navigate = jest.fn();
    const result = openNewOrderDestination({
      pathname: PATHS.APP_DASHBOARD,
      user: storeUser(ROLES.STORE_ADMIN),
      newestOrderId: 3,
      navigate,
    });
    expect(result).toBe('open-orders');
    expect(navigate).toHaveBeenCalledWith(PATHS.APP_ATENDIMENTO);
    expect(takeOpenOrdersRequest()).toBe(true);
    expect(takeOpenOrdersRequest()).toBe(false);
  });

  it('papel só da cozinha vai para o KDS quando ainda não está lá', () => {
    const navigate = jest.fn();
    const result = openNewOrderDestination({
      pathname: PATHS.APP_DASHBOARD,
      user: storeUser(ROLES.KITCHEN),
      newestOrderId: 8,
      navigate,
    });
    expect(result).toBe('kitchen');
    expect(navigate).toHaveBeenCalledWith(PATHS.APP_COZINHA);
    expect(peekKitchenFocusId()).toBe('8');
  });

  it('garçom sem lista de pedidos só reconhece e permanece', () => {
    const navigate = jest.fn();
    const result = openNewOrderDestination({
      pathname: PATHS.APP_GARCOM,
      user: storeUser(ROLES.WAITER),
      newestOrderId: 2,
      navigate,
    });
    expect(result).toBe('stay');
    expect(navigate).not.toHaveBeenCalled();
  });
});
