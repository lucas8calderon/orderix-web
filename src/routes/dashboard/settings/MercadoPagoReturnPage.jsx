import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { PATHS } from '../../../services/accessControl';
import { completeMercadoPagoOAuth } from '../../../services/paymentConfigService';

const DENIED_MESSAGE = 'A conexão não foi autorizada no Mercado Pago. Nada mudou na sua loja.';
const FAILED_MESSAGE = 'Não foi possível concluir a conexão. Volte às configurações e clique em Conectar com Mercado Pago de novo.';

/**
 * Retorno do "Conectar com Mercado Pago". O Mercado Pago devolve a loja para cá com code e state;
 * a página entrega os dois ao backend, que guarda os tokens. Nenhum token passa pelo navegador.
 */
export default function MercadoPagoReturnPage() {
  const [params] = useSearchParams();
  const code = params.get('code') || '';
  const state = params.get('state') || '';
  const denied = Boolean(params.get('error')) || !code || !state;
  const [status, setStatus] = useState(denied ? 'error' : 'loading');
  const [message, setMessage] = useState(denied ? DENIED_MESSAGE : '');
  const sent = useRef(false);

  useEffect(() => {
    // O código vale uma vez só: o ref evita o segundo envio do modo estrito do React.
    if (denied || sent.current) return;
    sent.current = true;
    completeMercadoPagoOAuth(code, state)
      .then(() => setStatus('success'))
      .catch((error) => {
        setMessage(error?.response?.data?.message || FAILED_MESSAGE);
        setStatus('error');
      });
  }, [code, state, denied]);

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 6, px: 2 }}>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
        Conexão com o Mercado Pago
      </Typography>
      {status === 'loading' ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }} role="status">
          <CircularProgress size={22} />
          <Typography>Concluindo a conexão...</Typography>
        </Box>
      ) : null}
      {status === 'success' ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Mercado Pago conectado. Agora ligue o Pix online ou o cartão online nas configurações do Delivery.
        </Alert>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>
      ) : null}
      {status !== 'loading' ? (
        <Button component={Link} to={PATHS.APP_CONFIGURACOES} variant="contained">
          Voltar às configurações
        </Button>
      ) : null}
    </Box>
  );
}
