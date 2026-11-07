import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../../services/session';
import { NewOrderAlertButton } from './NewOrderAlertButton';
import { openNewOrderDestination } from './openNewOrderDestination';
import { useNewOrderAlert } from './useNewOrderAlert';

export function NewOrderAlert() {
  const alert = useNewOrderAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpen = () => {
    const newestOrderId = alert.acknowledge();
    openNewOrderDestination({
      pathname: location.pathname,
      user: getCurrentUser(),
      newestOrderId,
      navigate,
    });
  };

  return (
    <NewOrderAlertButton
      count={alert.count}
      toastOpen={alert.toastOpen}
      onOpen={handleOpen}
      onDismissToast={alert.dismissToast}
    />
  );
}
