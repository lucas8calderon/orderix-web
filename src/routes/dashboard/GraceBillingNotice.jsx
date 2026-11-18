import { useEffect, useState } from 'react';
import { Alert, Button } from '@mui/material';
import axios from 'axios';
import { getCurrentUser } from '../../services/authService';
import { getSubscriptionNotice, subscribeSubscriptionNotice } from '../../services/subscriptionNotice';

const GRACE_COPY = 'A mensalidade venceu. A loja segue operando por até 8 dias, com aviso.';
const STORE_ADMIN_ROLES = new Set(['ADMIN', 'STORE_ADMIN']);

function formatDay(value) {
  const parts = Array.isArray(value) ? value : String(value || '').slice(0, 10).split('-');
  if (parts.length < 3) return '';
  const [year, month, day] = parts;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

export function GraceBillingNotice() {
  const user = getCurrentUser();
  const [liveNotice, setLiveNotice] = useState(getSubscriptionNotice);
  const [pixLimit, setPixLimit] = useState('');

  useEffect(() => subscribeSubscriptionNotice(setLiveNotice), []);

  const inGrace = Boolean(user?.subscriptionActive) && user?.subscriptionStatus === 'OVERDUE';
  const canPay = STORE_ADMIN_ROLES.has(user?.role);

  useEffect(() => {
    if (!inGrace || !canPay) return undefined;
    let active = true;
    axios.get('/api/billing/subscription/invoices')
      .then((response) => {
        const open = response?.data?.invoices?.find((invoice) => invoice.status === 'OPEN' && invoice.graceLimit);
        if (active && open) setPixLimit(formatDay(open.graceLimit));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [inGrace, canPay]);

  const pixText = pixLimit
    ? `Identificamos uma mensalidade pendente. Regularize seu pagamento até ${pixLimit} para evitar a suspensão do acesso.`
    : '';
  const text = liveNotice || pixText || (inGrace ? GRACE_COPY : '');
  if (!text) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      role="status"
      sx={{ mb: 2 }}
      action={pixLimit && canPay ? (
        <Button color="inherit" size="small" href="/app/configuracoes/empresa#mensalidades">
          Pagar mensalidade
        </Button>
      ) : undefined}
    >
      {text}
    </Alert>
  );
}
