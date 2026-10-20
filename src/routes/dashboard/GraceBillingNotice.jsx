import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { getCurrentUser } from '../../services/authService';
import { getSubscriptionNotice, subscribeSubscriptionNotice } from '../../services/subscriptionNotice';

const GRACE_COPY = 'A mensalidade venceu. A loja segue operando por até 7 dias, com aviso.';

export function GraceBillingNotice() {
  const user = getCurrentUser();
  const [liveNotice, setLiveNotice] = useState(getSubscriptionNotice);

  useEffect(() => subscribeSubscriptionNotice(setLiveNotice), []);

  const inGrace = Boolean(user?.subscriptionActive) && user?.subscriptionStatus === 'OVERDUE';
  const text = liveNotice || (inGrace ? GRACE_COPY : '');
  if (!text) {
    return null;
  }

  return (
    <Alert severity="warning" role="status" sx={{ mb: 2 }}>
      {text}
    </Alert>
  );
}
