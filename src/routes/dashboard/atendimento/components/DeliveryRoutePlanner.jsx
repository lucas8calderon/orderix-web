import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { QRCodeSVG } from 'qrcode.react';
import { formatOrderDisplayCode } from '../../../../services/salesChannel';
import {
  apiErrorMessage,
  cancelDeliveryRoute,
  confirmDeliveryRoute,
  createDeliveryRoute,
  getDeliveryRoute,
  listDeliveryRoutes,
  newIdempotencyKey,
} from '../../../../services/deliveryRouteApi';
import { absolutePublicUrl, rememberRouteSecret } from '../../../../services/deliveryRouteSecrets';
import { openRouteSheetPrint } from '../../../../printing/routeSheetPrint';
import { deliveryAddressParts } from '../utils/deliveryOrderView';

function StrictModeDroppable({ children, ...props }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(frame);
      setEnabled(false);
    };
  }, []);
  if (!enabled) return null;
  return <Droppable {...props}>{children}</Droppable>;
}

function moveItem(list, index, direction) {
  const next = index + direction;
  if (next < 0 || next >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

export function DeliveryRoutePlanner({ open, orders, onClose, onConfirmed }) {
  const fullScreen = useMediaQuery('(max-width:720px)');
  const [stops, setStops] = useState([]);
  const [courierName, setCourierName] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [storeName, setStoreName] = useState('');
  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    setStops((orders || []).map((order) => ({ order, address: deliveryAddressParts(order) })));
    setCourierName('');
    setError('');
    setResult(null);
    let cancelled = false;
    listDeliveryRoutes()
      .then((response) => {
        if (cancelled) return;
        setOriginAddress(response?.data?.originAddress || '');
        setStoreName(response?.data?.storeName || '');
      })
      .catch(() => {
        if (!cancelled) setOriginAddress('');
      });
    return () => {
      cancelled = true;
    };
    // Copia os pedidos só na abertura. Atualizar a lista depois não pode apagar o QR.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const onDragEnd = (drag) => {
    if (!drag.destination) return;
    setStops((current) => {
      const copy = current.slice();
      const [item] = copy.splice(drag.source.index, 1);
      copy.splice(drag.destination.index, 0, item);
      return copy;
    });
  };

  const confirmRoute = async () => {
    const name = courierName.trim();
    if (!name) {
      setError('Informe o nome do motoboy.');
      return;
    }
    if (!stops.length || stops.length > 25) {
      setError('Uma rota aceita de 1 a 25 pedidos.');
      return;
    }
    setSaving(true);
    setError('');
    let created = null;
    try {
      created = (await createDeliveryRoute({
        orderIds: stops.map((stop) => stop.order.id),
        courierName: name,
      }, newIdempotencyKey())).data;
      let detail;
      try {
        detail = (await confirmDeliveryRoute(created.id, newIdempotencyKey())).data;
      } catch (confirmError) {
        const current = await getDeliveryRoute(created.id).catch(() => null);
        const status = current?.data?.status;
        if (status === 'IN_PROGRESS' || status === 'COMPLETED') {
          detail = current.data;
        } else {
          await cancelDeliveryRoute(created.id, newIdempotencyKey()).catch(() => {});
          throw confirmError;
        }
      }
      const publicUrl = absolutePublicUrl(created.publicUrl);
      rememberRouteSecret(created.id, { token: created.token, pin: created.pin, publicUrl });
      setResult({
        id: created.id,
        token: created.token,
        pin: created.pin,
        publicUrl,
        detail,
      });
      onConfirmed?.();
    } catch (err) {
      setError(apiErrorMessage(err, 'Não foi possível gerar a rota.'));
    } finally {
      setSaving(false);
    }
  };

  const printSheet = async () => {
    if (!result) return;
    setPrinting(true);
    setError('');
    try {
      const detail = result.detail;
      await openRouteSheetPrint({
        storeName: detail?.storeName || storeName,
        routeLabel: String(result.id).padStart(4, '0'),
        stopCount: detail?.stopCount || stops.length,
        originAddress: detail?.originAddress || originAddress,
        courierName: detail?.courierName || courierName.trim(),
        publicUrl: result.publicUrl,
        pin: result.pin,
        stops: (detail?.stops || []).map((stop) => ({
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
      setPrinting(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={fullScreen} fullWidth maxWidth="md">
      <DialogTitle>
        Planejar rota de entrega
        <Typography variant="body2" color="text.secondary">
          Organize suas entregas e reduza deslocamentos.
        </Typography>
      </DialogTitle>
      <DialogContent>
        {result ? (
          <Box>
            <Typography sx={{ mb: 1 }}>
              A ordem é manual. Esta rota não calcula distância nem tempo.
            </Typography>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              {result.detail?.stopCount || stops.length} paradas · Motoboy {result.detail?.courierName || courierName}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <QRCodeSVG value={result.publicUrl} size={180} includeMargin />
            </Box>
            <Typography align="center" sx={{ wordBreak: 'break-all' }}>{result.publicUrl}</Typography>
            <Typography align="center" variant="h4" sx={{ letterSpacing: 4, my: 2 }}>
              PIN {result.pin}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography sx={{ mb: 1 }}>
              {stops.length === 1 ? '1 parada' : `${stops.length} paradas`}
              {' · '}
              {originAddress
                ? `Saída: ${originAddress}`
                : 'A loja está sem endereço de saída cadastrado. A rota segue sem esse ponto.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              A ordem é manual. Esta tela não mostra distância nem tempo de deslocamento.
            </Typography>
            <DragDropContext onDragEnd={onDragEnd}>
              <StrictModeDroppable droppableId="delivery-route-stops">
                {(provided) => (
                  <Box ref={provided.innerRef} {...provided.droppableProps}>
                    {stops.map((stop, index) => {
                      const code = formatOrderDisplayCode(stop.order);
                      return (
                        <Draggable key={stop.order.id} draggableId={String(stop.order.id)} index={index}>
                          {(drag) => (
                            <Box
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'flex-start',
                                border: '1px solid var(--color-border, #e5e7eb)',
                                borderRadius: '12px',
                                p: 1.5,
                                mb: 1,
                              }}
                            >
                              <Box {...drag.dragHandleProps} aria-label={`Arrastar pedido ${code}`} sx={{ pt: 0.5, cursor: 'grab' }}>
                                <DragIndicatorIcon fontSize="small" />
                              </Box>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontWeight: 700 }}>{index + 1}. Pedido {code}</Typography>
                                <Typography sx={{ overflowWrap: 'anywhere' }}>{stop.address.line}</Typography>
                                {stop.address.complement ? (
                                  <Typography variant="body2" color="text.secondary">
                                    {stop.address.complement}
                                  </Typography>
                                ) : null}
                              </Box>
                              <Box>
                                <IconButton
                                  aria-label={`Subir pedido ${code}`}
                                  disabled={index === 0}
                                  onClick={() => setStops((current) => moveItem(current, index, -1))}
                                >
                                  <ArrowUpwardIcon />
                                </IconButton>
                                <IconButton
                                  aria-label={`Descer pedido ${code}`}
                                  disabled={index === stops.length - 1}
                                  onClick={() => setStops((current) => moveItem(current, index, 1))}
                                >
                                  <ArrowDownwardIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </StrictModeDroppable>
            </DragDropContext>
            <TextField
              label="Nome do motoboy"
              value={courierName}
              onChange={(event) => setCourierName(event.target.value)}
              fullWidth
              margin="normal"
              inputProps={{ maxLength: 80 }}
            />
          </Box>
        )}
        {error ? (
          <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {result ? (
          <>
            <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fechar</Button>
            <Button variant="contained" onClick={printSheet} disabled={printing} sx={{ textTransform: 'none' }}>
              {printing ? 'Preparando impressão...' : 'Imprimir rota'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose} disabled={saving} sx={{ textTransform: 'none' }}>Cancelar</Button>
            <Button variant="contained" onClick={confirmRoute} disabled={saving} sx={{ textTransform: 'none' }}>
              {saving ? 'Gerando...' : 'Confirmar e gerar QR Code'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
