import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import {
  apiErrorMessage,
  cancelDeliveryRoute,
  getDeliveryRoute,
  listDeliveryRoutes,
  newIdempotencyKey,
} from '../../../../services/deliveryRouteApi';
import { readRouteSecret } from '../../../../services/deliveryRouteSecrets';
import { openRouteSheetPrint } from '../../../../printing/routeSheetPrint';

const STATUS_LABEL = {
  DRAFT: 'Rascunho',
  CONFIRMED: 'Confirmada',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

function formatWhen(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR');
}

export function DeliveryRoutesPanel({ open, onClose, onChanged }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadList = () => {
    setLoading(true);
    return listDeliveryRoutes()
      .then((response) => {
        setRoutes(Array.isArray(response?.data?.routes) ? response.data.routes : []);
        setError('');
      })
      .catch((err) => {
        setRoutes([]);
        setError(apiErrorMessage(err, 'Não foi possível carregar as rotas.'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open) return undefined;
    setSelectedId(null);
    setDetail(null);
    loadList();
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !selectedId) return undefined;
    let cancelled = false;
    const pull = () => {
      getDeliveryRoute(selectedId)
        .then((response) => {
          if (!cancelled) setDetail(response.data);
        })
        .catch((err) => {
          if (!cancelled) setError(apiErrorMessage(err, 'Não foi possível atualizar a rota.'));
        });
    };
    pull();
    const timer = window.setInterval(pull, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [open, selectedId]);

  if (!open) return null;

  const secret = readRouteSecret(selectedId);

  const copyLink = async () => {
    if (!secret?.publicUrl) return;
    try {
      await navigator.clipboard.writeText(secret.publicUrl);
      setError('');
    } catch {
      setError('Não foi possível copiar o link.');
    }
  };

  const printAgain = async () => {
    if (!detail || !secret) return;
    setBusy(true);
    setError('');
    try {
      await openRouteSheetPrint({
        storeName: detail.storeName,
        routeLabel: String(detail.id).padStart(4, '0'),
        stopCount: detail.stopCount,
        originAddress: detail.originAddress,
        courierName: detail.courierName,
        publicUrl: secret.publicUrl,
        pin: secret.pin,
        stops: (detail.stops || []).map((stop) => ({
          sequence: stop.sequence,
          orderLabel: stop.orderLabel,
          address: stop.addressLine,
          neighborhood: stop.neighborhood,
          complement: stop.complement,
        })),
      });
    } catch (err) {
      setError(err?.message || 'Não foi possível imprimir. A rota continua salva.');
    } finally {
      setBusy(false);
    }
  };

  const cancelRoute = async () => {
    if (!detail?.cancellable) return;
    setBusy(true);
    setError('');
    try {
      await cancelDeliveryRoute(detail.id, newIdempotencyKey());
      setSelectedId(null);
      setDetail(null);
      await loadList();
      onChanged?.();
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível cancelar a rota.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rotas de entrega</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A ordem é manual. O painel não mostra distância nem tempo.
        </Typography>
        {loading ? <Typography>Carregando rotas...</Typography> : null}
        {!loading && !selectedId && routes.length === 0 ? (
          <Typography>Nenhuma rota recente.</Typography>
        ) : null}
        {!selectedId ? routes.map((route) => (
          <Box key={route.id} sx={{ borderBottom: '1px solid var(--color-border, #e5e7eb)', py: 1.25 }}>
            <Typography sx={{ fontWeight: 700 }}>
              Rota {String(route.id).padStart(4, '0')} · {STATUS_LABEL[route.status] || route.status}
            </Typography>
            <Typography variant="body2">
              {route.stopCount} pedidos · {route.deliveredCount} concluídas
              {route.courierName ? ` · ${route.courierName}` : ''}
              {formatWhen(route.createdAt) ? ` · ${formatWhen(route.createdAt)}` : ''}
            </Typography>
            <Button size="small" onClick={() => setSelectedId(route.id)} sx={{ textTransform: 'none', px: 0 }}>
              Ver
            </Button>
          </Box>
        )) : null}
        {detail ? (
          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              Rota {String(detail.id).padStart(4, '0')} · {STATUS_LABEL[detail.status] || detail.status}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {detail.deliveredCount} de {detail.stopCount} paradas concluídas
              {detail.courierName ? ` · ${detail.courierName}` : ''}
            </Typography>
            {(detail.stops || []).map((stop) => (
              <Typography key={stop.id} variant="body2" sx={{ overflowWrap: 'anywhere', mb: 0.5 }}>
                {stop.sequence}. Pedido {stop.orderLabel} · {stop.addressLine} · {stop.status === 'DELIVERED' ? 'Entregue' : stop.status === 'SKIPPED' ? 'Não entregue' : 'Pendente'}
              </Typography>
            ))}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              <Button size="small" onClick={() => { setSelectedId(null); setDetail(null); }} sx={{ textTransform: 'none' }}>
                Voltar
              </Button>
              <Button size="small" onClick={copyLink} disabled={!secret} sx={{ textTransform: 'none' }}>
                Copiar link
              </Button>
              <Button size="small" onClick={printAgain} disabled={!secret || busy} sx={{ textTransform: 'none' }}>
                Imprimir de novo
              </Button>
              {detail.cancellable ? (
                <Button size="small" color="error" onClick={cancelRoute} disabled={busy} sx={{ textTransform: 'none' }}>
                  Cancelar rota
                </Button>
              ) : null}
            </Box>
            {!secret ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                O link e o PIN ficam neste navegador depois da confirmação. Sem eles, a reimpressão do QR não é possível.
              </Typography>
            ) : null}
          </Box>
        ) : null}
        {error ? <Typography color="error" sx={{ mt: 1 }}>{error}</Typography> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
