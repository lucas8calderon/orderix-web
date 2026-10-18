import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import '../../../../services/apiConfig';
import { getCurrentUser } from '../../../../services/authService';
import { PRICING_TIERS, formatPrice } from '../../../../config/pricingTiers';

const STORE_ADMIN_ROLES = new Set(['ADMIN', 'STORE_ADMIN']);

const STATUS_LABEL = {
  ACTIVE: 'Ativa',
  CANCELED: 'Renovação encerrada',
  OVERDUE: 'Em tolerância',
  BLOCKED: 'Suspensa',
  PENDING: 'Pendente',
};

const METHOD_LABEL = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão',
};

function planLabel(code) {
  return PRICING_TIERS.find((tier) => tier.code === code)?.label || code || '—';
}

function formatDay(value) {
  const parts = Array.isArray(value) ? value : String(value || '').split('-');
  if (parts.length < 3) return '—';
  const [year, month, day] = parts;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function errorMessage(error) {
  const message = error?.response?.data?.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  return 'Não foi possível encerrar a renovação. Tente de novo.';
}

export function SubscriptionRenewalCard() {
  const role = getCurrentUser()?.role;
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [known, setKnown] = useState(false);
  const [error, setError] = useState('');
  const done = Boolean(summary?.renewalCanceled);

  useEffect(() => {
    if (!STORE_ADMIN_ROLES.has(role)) {
      return undefined;
    }
    let active = true;
    axios.get('/api/billing/subscription')
      .then((response) => {
        if (active) {
          setSummary(response?.data || null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setKnown(true);
        }
      });
    return () => {
      active = false;
    };
  }, [role]);

  if (!STORE_ADMIN_ROLES.has(role)) {
    return null;
  }

  async function cancelRenewal() {
    setSubmitting(true);
    setError('');
    try {
      await axios.post('/api/billing/subscription/cancel');
      setSummary((current) => ({ ...(current || {}), renewalCanceled: true, status: 'CANCELED' }));
      setConfirming(false);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="settings-card">
      <CardContent>
        <Typography component="h2" className="card-title">Assinatura</Typography>
        <Typography className="card-description" variant="body2">
          Cancelar a renovação encerra a próxima cobrança. O acesso desta loja segue até o fim do ciclo já pago.
        </Typography>
        {summary ? (
          <Box sx={{ mt: 2, display: 'grid', gap: 0.5 }}>
            <Typography variant="body2">Faixa: {planLabel(summary.plan)}</Typography>
            {summary.price != null ? <Typography variant="body2">Mensalidade: {formatPrice(summary.price)}</Typography> : null}
            <Typography variant="body2">Situação: {STATUS_LABEL[summary.status] || summary.status}</Typography>
            <Typography variant="body2">
              {done ? 'Acesso até' : 'Próxima cobrança'}: {formatDay(summary.expiresAt)}
            </Typography>
            {METHOD_LABEL[summary.billingType] ? (
              <Typography variant="body2">Meio: {METHOD_LABEL[summary.billingType]}</Typography>
            ) : null}
          </Box>
        ) : null}
        {summary?.access === 'GRACE' ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            A mensalidade venceu. A loja segue operando por até 7 dias, com aviso.
          </Alert>
        ) : null}
        {summary?.access === 'LIMITED' ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            A partir do 8º dia a loja fica para consulta, regularização e para concluir o que já estava em andamento.
          </Alert>
        ) : null}
        {done ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            A renovação já foi encerrada. O acesso segue até o fim do ciclo pago.
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="error" role="alert" sx={{ mt: 2 }}>{error}</Alert>
        ) : null}
        {known && !done && !confirming ? (
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setConfirming(true)}>
              Cancelar renovação
            </Button>
          </Box>
        ) : null}
        {known && !done && confirming ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              A renovação para agora. O acesso continua até o fim do ciclo pago. Esta ação não suspende a loja.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button variant="text" disabled={submitting} onClick={() => setConfirming(false)}>
                Manter renovação
              </Button>
              <Button variant="contained" disabled={submitting} onClick={cancelRenewal}>
                Encerrar renovação
              </Button>
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}
