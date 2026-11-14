import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {
  apiErrorMessage,
  confirmPublicDeliveryStop,
  getPublicDeliveryRoute,
  newIdempotencyKey,
} from '../../services/deliveryRouteApi';
import { googleMapsUrl, navigationAddress, wazeUrl } from './courierRouteLinks';

const STATUS_LABEL = {
  PENDING: 'Pendente',
  DELIVERED: 'Entregue',
  SKIPPED: 'Não foi possível entregar',
};

function stopStatus(stop) {
  return STATUS_LABEL[stop?.status] || stop?.status || '';
}

export default function CourierRoutePage() {
  const { token } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingStopId, setPendingStopId] = useState(null);
  const [formError, setFormError] = useState('');
  const [attemptKey, setAttemptKey] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (created) meta.remove();
      else if (previous == null) meta.removeAttribute('content');
      else meta.setAttribute('content', previous);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setRoute(null);
      setLoading(false);
      setError('');
      return undefined;
    }
    let cancelled = false;
    const pull = (quiet) => {
      if (!quiet) setLoading(true);
      getPublicDeliveryRoute(token)
        .then((response) => {
          if (cancelled) return;
          setRoute(response.data);
          setError('');
        })
        .catch((err) => {
          if (cancelled) return;
          setRoute(null);
          setError(apiErrorMessage(err, 'Rota não encontrada.'));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    pull(false);
    const timer = window.setInterval(() => pull(true), 10000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [token]);

  const begin = (nextOutcome, stopId) => {
    setOutcome(nextOutcome);
    setPendingStopId(stopId);
    setFormError('');
    setAttemptKey(newIdempotencyKey());
    setDialogOpen(true);
  };

  const cancel = () => {
    if (sending) return;
    setDialogOpen(false);
  };

  const submit = async () => {
    if (!pendingStopId || !token || !outcome) return;
    setSending(true);
    setFormError('');
    try {
      const response = await confirmPublicDeliveryStop(token, pendingStopId, { outcome }, attemptKey);
      setRoute(response.data);
      setDialogOpen(false);
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Não foi possível confirmar a parada.'));
    } finally {
      setSending(false);
    }
  };

  const current = (route?.stops || []).find((stop) => stop.id === route?.currentStopId) || null;
  const destination = current ? navigationAddress(current) : '';

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Typography sx={{ color: '#2563EB', fontWeight: 800, letterSpacing: 0.4 }}>Weper</Typography>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, mt: 0.5 }}>
          Minha rota de entregas
        </Typography>
        {!token ? (
          <Typography sx={{ mt: 2 }}>Este link de rota está incompleto.</Typography>
        ) : null}
        {token && loading ? <Typography sx={{ mt: 2 }}>Carregando rota...</Typography> : null}
        {token && error ? <Typography sx={{ mt: 2 }}>{error}</Typography> : null}
        {route ? (
          <Box sx={{ mt: 2 }}>
            <Typography>{route.storeName}</Typography>
            {route.courierName ? <Typography color="text.secondary">Motoboy {route.courierName}</Typography> : null}
            <Typography sx={{ my: 1, fontWeight: 700 }}>
              {route.finishedCount} de {route.stopCount} paradas concluídas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A ordem foi definida pela loja. Este link não mostra distância nem tempo.
            </Typography>
            {(route.stops || []).map((stop) => {
              const active = stop.id === route.currentStopId;
              return (
                <Box
                  key={stop.id}
                  sx={{
                    border: '1px solid',
                    borderColor: active ? '#2563EB' : '#e2e8f0',
                    borderRadius: '16px',
                    p: 2,
                    mb: 1.5,
                    background: '#fff',
                  }}
                >
                  <Typography sx={{ fontWeight: 800 }}>
                    {stop.sequence}. Pedido {stop.orderLabel}
                  </Typography>
                  <Typography sx={{ overflowWrap: 'anywhere' }}>{stop.address}</Typography>
                  {stop.complement ? <Typography>Compl.: {stop.complement}</Typography> : null}
                  {stop.reference ? <Typography color="text.secondary">{stop.reference}</Typography> : null}
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{stopStatus(stop)}</Typography>
                  {active ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1.5 }}>
                      {destination ? (
                        <>
                          <Button
                            component="a"
                            href={googleMapsUrl(destination)}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            sx={{ textTransform: 'none', borderColor: '#2563EB', color: '#2563EB' }}
                          >
                            Abrir no Google Maps
                          </Button>
                          <Button
                            component="a"
                            href={wazeUrl(destination)}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outlined"
                            sx={{ textTransform: 'none', borderColor: '#2563EB', color: '#2563EB' }}
                          >
                            Abrir no Waze
                          </Button>
                        </>
                      ) : null}
                      <Button variant="contained" onClick={() => begin('DELIVERED', stop.id)} sx={{ textTransform: 'none', background: '#2563EB' }}>
                        Confirmar entrega
                      </Button>
                      <Button variant="text" onClick={() => begin('FAILED', stop.id)} sx={{ textTransform: 'none' }}>
                        Não foi possível entregar
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              );
            })}
            {!current && route.status === 'COMPLETED' ? (
              <Typography sx={{ fontWeight: 700, mt: 1 }}>Rota concluída.</Typography>
            ) : null}
          </Box>
        ) : null}
        <Dialog
          open={dialogOpen}
          onClose={() => {
            if (!sending) setDialogOpen(false);
          }}
          fullWidth
          maxWidth="xs"
          aria-labelledby="courier-stop-dialog-title"
          PaperProps={{ sx: { m: 2, width: 'calc(100% - 32px)' } }}
        >
          <DialogTitle id="courier-stop-dialog-title" sx={{ fontWeight: 800, pr: 2 }}>
            {outcome === 'FAILED' ? 'Não foi possível entregar?' : 'Confirmar esta entrega?'}
          </DialogTitle>
          {formError ? (
            <DialogContent>
              <Typography color="error">{formError}</Typography>
            </DialogContent>
          ) : null}
          <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
            <Button onClick={cancel} disabled={sending} sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={submit}
              disabled={sending}
              sx={{ textTransform: 'none', background: '#2563EB' }}
            >
              {sending ? 'Enviando...' : 'Confirmar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
