import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Typography } from '@mui/material';
import axios from 'axios';
import '../../../../services/apiConfig';
import { getCurrentUser } from '../../../../services/authService';

const STORE_ADMIN_ROLES = new Set(['ADMIN', 'STORE_ADMIN']);

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
  const [done, setDone] = useState(false);
  const [known, setKnown] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!STORE_ADMIN_ROLES.has(role)) {
      return undefined;
    }
    let active = true;
    axios.get('/api/auth/me')
      .then((response) => {
        if (active && response?.data?.subscriptionStatus === 'CANCELED') {
          setDone(true);
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
      setDone(true);
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
