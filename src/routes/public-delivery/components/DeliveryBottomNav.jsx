import { useNavigate } from 'react-router-dom';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

export default function DeliveryBottomNav({
  slug,
  active = 'menu',
  hasSession = false,
  lastOrderToken = '',
  onAccount,
}) {
  const navigate = useNavigate();
  if (!slug) return null;

  const ordersLabel = !hasSession && lastOrderToken ? 'Ver meu último pedido' : 'Pedidos';

  const goOrders = () => {
    if (hasSession) {
      navigate(`/delivery/${encodeURIComponent(slug)}/conta/pedidos`);
      return;
    }
    if (lastOrderToken) {
      navigate(`/delivery/pedido/${lastOrderToken}`);
      return;
    }
    navigate(`/delivery/${encodeURIComponent(slug)}/conta/pedidos`);
  };

  const goAccount = () => {
    if (onAccount) {
      onAccount();
      return;
    }
    navigate(`/delivery/${encodeURIComponent(slug)}/conta`);
  };

  return (
    <nav className="delivery-bottom-nav" aria-label="Navegação do delivery">
      <button
        type="button"
        className={active === 'menu' ? 'is-active' : undefined}
        aria-current={active === 'menu' ? 'page' : undefined}
        onClick={() => navigate(`/delivery/${encodeURIComponent(slug)}`)}
      >
        <HomeOutlinedIcon fontSize="small" />
        <span>Início</span>
      </button>
      <button
        type="button"
        className={active === 'orders' ? 'is-active' : undefined}
        aria-current={active === 'orders' ? 'page' : undefined}
        aria-label={ordersLabel}
        onClick={goOrders}
      >
        <ReceiptLongOutlinedIcon fontSize="small" />
        <span>Pedidos</span>
      </button>
      <button
        type="button"
        className={active === 'account' ? 'is-active' : undefined}
        aria-current={active === 'account' ? 'page' : undefined}
        onClick={goAccount}
      >
        <PersonOutlineIcon fontSize="small" />
        <span>Conta</span>
      </button>
    </nav>
  );
}
