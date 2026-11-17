import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { PATHS } from '../../services/accessControl';
import { completeSaasMercadoPagoOAuth } from './service/financeAdminService';

const DENIED_MESSAGE = 'A conexão não foi autorizada no Mercado Pago. A conta da Weper não mudou.';
const FAILED_MESSAGE = 'Não foi possível concluir a conexão. Volte ao financeiro e clique em Conectar com Mercado Pago de novo.';

/**
 * Retorno do "Conectar com Mercado Pago" da assinatura.
 * O código vai ao backend, que guarda o token da conta Weper. Nenhum token fica no navegador.
 */
export default function SaasMercadoPagoReturnPage() {
  const [params] = useSearchParams();
  const code = params.get('code') || '';
  const state = params.get('state') || '';
  const denied = Boolean(params.get('error')) || !code || !state;
  const [status, setStatus] = useState(denied ? 'error' : 'loading');
  const [message, setMessage] = useState(denied ? DENIED_MESSAGE : '');
  const sent = useRef(false);

  useEffect(() => {
    if (denied || sent.current) return;
    sent.current = true;
    completeSaasMercadoPagoOAuth(code, state)
      .then(() => setStatus('success'))
      .catch((error) => {
        setMessage(error?.response?.data?.message || FAILED_MESSAGE);
        setStatus('error');
      });
  }, [code, state, denied]);

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 6, px: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Conta Mercado Pago da Weper
      </Typography>
      {status === 'loading' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} role="status">
          <CircularProgress size={22} />
          <Typography>Concluindo a conexão...</Typography>
        </Box>
      ) : null}
      {status === 'success' ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Mercado Pago conectado. As mensalidades novas caem nessa conta quando o gateway ativo for Mercado Pago.
        </Alert>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
      ) : null}
      {status !== 'loading' ? (
        <Button component={Link} to={PATHS.ADMIN_FINANCEIRO} variant="contained">
          Voltar ao financeiro
        </Button>
      ) : null}
    </Box>
  );
}
