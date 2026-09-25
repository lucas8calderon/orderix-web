import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Slide,
  Snackbar,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatCurrency } from '../../../../services/accessControl';
import {
  channelPaymentMode,
  confirmExternalPayment,
  getStorePaymentConfig,
  isSettledPaymentStatus,
  paymentMethodsFromConfig,
} from '../../../../services/paymentConfigService';
import {
  closeComandaAccount,
  closeTableAccount,
  getComandaAccount,
  getTableAccount,
} from '../service/accountService';
import {
  accountSubtotal,
  countAccountItems,
  productLineTotal,
  resolveMandatorySelections,
} from '../utils/accountTotals';

const FALLBACK_PAYMENT_METHODS = [
  { id: 'PIX', label: 'PIX' },
  { id: 'DEBIT', label: 'Cartão de Débito' },
  { id: 'CREDIT', label: 'Cartão de Crédito' },
  { id: 'CASH', label: 'Dinheiro' },
  { id: 'VOUCHER', label: 'Vale' },
];

function apiErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function isEmptyAccountError(error) {
  const status = error?.response?.status;
  return status === 404;
}

function newUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

const confirmPaperSx = {
  maxWidth: 480,
  backgroundColor: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  backgroundImage: 'none',
  border: '1px solid var(--color-border)',
  borderRadius: { xs: '16px', sm: '20px' },
};

export function getCloseAccountConfirmCopy(target, options = {}) {
  const isComanda = target?.kind === 'comanda';
  const number = target?.number != null && String(target.number).trim() !== ''
    ? String(target.number).trim()
    : '';
  const subject = number
    ? `${isComanda ? 'comanda' : 'mesa'} ${number}`
    : (isComanda ? 'comanda' : 'mesa');
  const mode = options.paymentMode || 'MANUAL_CONFIRMATION';
  const totalLabel = options.totalLabel || '';

  if (mode === 'ORDER_ONLY') {
    return {
      title: isComanda ? 'Liberar comanda?' : 'Liberar mesa?',
      description: `O Weper não cobra neste canal. Ao confirmar, a ${subject} será liberada. Esta ação não pode ser desfeita.`,
    };
  }
  if (mode === 'INTEGRATED_PAYMENT') {
    return {
      title: isComanda ? 'Fechar comanda?' : 'Fechar mesa?',
      description: `Só feche se o pagamento já foi aprovado no terminal. A ${subject} será liberada e os dados desta conta serão limpos.`,
    };
  }

  return {
    title: 'Confirma que o pagamento foi realizado?',
    description: `Confirma que o pagamento de ${totalLabel || 'R$ 0,00'} foi realizado fora do Weper? A ${subject} será liberada. O Weper não processou esta transação.`,
  };
}

export function CheckoutDialog({ open, target, onClose, onPaid }) {
  const dialogProps = useDialogResponsiveProps({
    paperSx: {
      maxWidth: 640,
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-text-primary)',
      backgroundImage: 'none',
      border: '1px solid var(--color-border)',
      borderRadius: { xs: 0, sm: '20px' },
    },
  });
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [account, setAccount] = useState(null);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [paymentMethods, setPaymentMethods] = useState(FALLBACK_PAYMENT_METHODS);
  const [serviceFeeRate, setServiceFeeRate] = useState(0.1);
  const [applyServiceTax, setApplyServiceTax] = useState(false);
  const [discount, setDiscount] = useState('0');
  const [toast, setToast] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState('MANUAL_CONFIRMATION');
  const confirmDialogProps = useDialogResponsiveProps({
    fullScreenOnMobile: false,
    paperSx: confirmPaperSx,
  });
  const kindLabel = target?.kind === 'comanda' ? 'Comanda' : 'Mesa';
  const title = target ? `${kindLabel} ${target.number ?? ''}` : '';

  useEffect(() => {
    if (!open || !target?.id) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setAccount(null);
    setEmpty(false);
    setError('');
    setApplyServiceTax(false);
    setDiscount('0');
    setPaymentStatus('');

    const request =
      target.kind === 'comanda'
        ? getComandaAccount(target.id)
        : getTableAccount(target.id);

    request
      .then((response) => {
        if (cancelled) return;
        const data = response.data || {};
        const orders = data.orders || [];
        const closed = String(data.status || '').toUpperCase() === 'CLOSED';
        if (closed || orders.length === 0) {
          setEmpty(true);
          setAccount(data);
          return;
        }
        setAccount(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (isEmptyAccountError(err)) {
          setEmpty(true);
          setError('');
          return;
        }
        setError(apiErrorMessage(err, 'Não foi possível carregar os pedidos.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, target]);

  useEffect(() => {
    if (!open) {
      setConfirmOpen(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled = false;
    getStorePaymentConfig()
      .then((response) => {
        if (cancelled) return;
        const dto = response.data || {};
        const methods = paymentMethodsFromConfig(dto);
        const nextMethods = methods.length ? methods : FALLBACK_PAYMENT_METHODS;
        setPaymentMethods(nextMethods);
        setPaymentMethod((current) => (
          nextMethods.some((method) => method.id === current)
            ? current
            : nextMethods[0].id
        ));
        const rate = Number(dto.serviceFeePercent);
        setServiceFeeRate(Number.isFinite(rate) && rate >= 0 && rate <= 1 ? rate : 0.1);
        setPaymentMode(channelPaymentMode(dto, target?.kind === 'comanda' ? 'comanda' : 'table'));
      })
      .catch(() => {
        if (cancelled) return;
        setPaymentMethods(FALLBACK_PAYMENT_METHODS);
        setServiceFeeRate(0.1);
      });

    return () => {
      cancelled = true;
    };
  }, [open, target]);

  const subtotal = useMemo(() => accountSubtotal(account), [account]);
  const discountValue = Math.max(0, Number(discount) || 0);
  const serviceFeePercentLabel = Math.round(serviceFeeRate * 100);
  const serviceTax = applyServiceTax ? subtotal * serviceFeeRate : 0;
  const total = Math.max(0, subtotal + serviceTax - discountValue);
  const itemCount = useMemo(() => countAccountItems(account), [account]);
  const needsPaymentMethod = paymentMode !== 'ORDER_ONLY';
  const canClose = !loading && !empty && itemCount > 0 && (!needsPaymentMethod || Boolean(paymentMethod));
  const confirmCopy = getCloseAccountConfirmCopy(target, {
    paymentMode,
    totalLabel: formatCurrency(total),
  });

  const handleAskConfirm = () => {
    if (!canClose || !target?.id || closing) return;
    setConfirmOpen(true);
  };

  const handleCancelConfirm = () => {
    if (closing) return;
    setConfirmOpen(false);
  };

  const handleConfirm = () => {
    if (!canClose || !target?.id || closing) return;
    setConfirmOpen(false);
    setClosing(true);
    setError('');
    setPaymentStatus('PROCESSING');
    const payload = {
      paymentMethod: paymentMethod || 'OTHER',
      applyServiceTax,
      discount: discountValue,
    };
    const groupOrderId = account?.groupOrderId;
    const orderId = groupOrderId ? undefined : account?.orders?.[0]?.id;
    const clientPaymentId = newUuid();
    const intentKey = newUuid();
    const closeKey = newUuid();

    const closeAccount = () => (
      target.kind === 'comanda'
        ? closeComandaAccount(target.id, payload, closeKey)
        : closeTableAccount(target.id, payload, closeKey)
    );

    const settle = () => {
      if (paymentMode === 'ORDER_ONLY') {
        return Promise.resolve({ status: 'NOT_REQUIRED' });
      }
      const body = {
        clientPaymentId,
        paymentMethod: payload.paymentMethod,
        applyServiceTax,
        discount: discountValue,
      };
      if (groupOrderId) body.groupOrderId = groupOrderId;
      else if (orderId) body.orderId = orderId;
      if (paymentMode === 'INTEGRATED_PAYMENT') {
        return Promise.resolve({ status: 'CLOSE_ONLY' });
      }
      return confirmExternalPayment(body, intentKey).then((response) => response.data || {});
    };

    settle()
      .then((approved) => {
        if (paymentMode === 'MANUAL_CONFIRMATION' && !isSettledPaymentStatus(approved?.status)) {
          throw new Error('Pagamento não confirmado. A mesa não foi liberada.');
        }
        setPaymentStatus(
          paymentMode === 'ORDER_ONLY'
            ? 'NOT_REQUIRED'
            : paymentMode === 'MANUAL_CONFIRMATION'
              ? 'PAID_EXTERNALLY'
              : 'APPROVED',
        );
        return closeAccount();
      })
      .then(() => {
        setToast('Conta fechada com sucesso!');
        onPaid?.();
      })
      .catch((err) => {
        setPaymentStatus('');
        setError(apiErrorMessage(err, err?.message || 'Erro ao registrar o pagamento. A mesa não foi liberada.'));
      })
      .finally(() => setClosing(false));
  };

  return (
    <>
      <Dialog
        {...dialogProps}
        className="checkout-dialog"
        open={open}
        onClose={closing ? undefined : onClose}
        TransitionComponent={Transition}
        maxWidth="sm"
      >
        <DialogTitle className="checkout-dialog-title" sx={{ pr: 6 }}>
          <Typography variant="h5" component="span" fontWeight="bold" sx={{ color: 'var(--color-primary)' }}>
            {title}
          </Typography>
          <IconButton
            aria-label="Fechar"
            onClick={onClose}
            disabled={closing}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'var(--color-text-secondary)',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="checkout-dialog-content" dividers>
          {loading && (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && empty && (
            <Typography sx={{ py: 3, textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Nenhum pedido encontrado. {kindLabel} liberada.
            </Typography>
          )}

          {!loading && account && !empty && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Pedidos
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'var(--color-text-secondary)' }}>
                    {(account.orders || []).length} pedido(s) · {itemCount} item(ns)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Tipo
                  </Typography>
                  <Chip
                    label={kindLabel}
                    size="small"
                    sx={{
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      fontWeight: 'bold',
                    }}
                  />
                </Grid>
              </Grid>

              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Itens do pedido
                </Typography>
                {(account.orders || []).map((order) => (
                  <Box key={order.id} className="checkout-order-block">
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Pedido #{order.id}
                      {order.customerName ? ` · ${order.customerName}` : ''}
                    </Typography>
                    {(order.products || []).map((product, index) => {
                      const quantity = Number(product.quantity) > 0 ? Number(product.quantity) : 1;
                      const selections = resolveMandatorySelections(product);
                      return (
                        <Box key={`${order.id}-${product.id}-${index}`} className="checkout-item">
                          <Box display="flex" justifyContent="space-between" gap={2}>
                            <Typography variant="body1">
                              {quantity}x {product.name}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {formatCurrency(productLineTotal(product))}
                            </Typography>
                          </Box>
                          {selections.map((selection) => (
                            <Typography
                              key={`${selection.groupName}-${selection.itemName}`}
                              variant="body2"
                              sx={{ color: 'var(--color-text-secondary)' }}
                            >
                              {selection.groupName}: {selection.itemName}
                              {selection.price > 0 ? ` (+${formatCurrency(selection.price)})` : ''}
                            </Typography>
                          ))}
                          {(product.extras || []).map((extra) => (
                            <Typography
                              key={extra.productExtraId || extra.name}
                              variant="body2"
                              sx={{ color: 'var(--color-text-secondary)' }}
                            >
                              Extra: {extra.name}
                              {extra.quantity > 1 ? ` x${extra.quantity}` : ''}
                              {extra.price > 0 ? ` (+${formatCurrency(extra.price)})` : ''}
                            </Typography>
                          ))}
                          {product.observation && (
                            <Typography className="checkout-item-obs" variant="body2">
                              Obs.: {product.observation}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                    {order.observation && (
                      <Typography className="checkout-item-obs" variant="body2" sx={{ mt: 0.5 }}>
                        Observação do pedido: {order.observation}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box className="checkout-summary">
                <Box display="flex" justifyContent="space-between">
                  <Typography sx={{ color: 'var(--color-text-secondary)' }}>Subtotal</Typography>
                  <Typography>{formatCurrency(subtotal)}</Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={applyServiceTax}
                      onChange={(event) => setApplyServiceTax(event.target.checked)}
                    />
                  }
                  label={`Taxa de serviço (${serviceFeePercentLabel}%)`}
                />
                {applyServiceTax && (
                  <Box display="flex" justifyContent="space-between">
                    <Typography sx={{ color: 'var(--color-text-secondary)' }}>Taxa</Typography>
                    <Typography>{formatCurrency(serviceTax)}</Typography>
                  </Box>
                )}
                <TextField
                  label="Desconto"
                  type="number"
                  size="small"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                  inputProps={{ min: 0, step: '0.01' }}
                  sx={{ maxWidth: 180 }}
                />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="h6" fontWeight="bold">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>

              {paymentStatus === 'PROCESSING' && (
                <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={18} />}>
                  {paymentMode === 'ORDER_ONLY' ? 'Liberando conta…' : 'Registrando pagamento…'}
                </Alert>
              )}
              {paymentMode === 'MANUAL_CONFIRMATION' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Pagamento confirmado manualmente — o Weper não processa esta transação.
                </Alert>
              )}
              {paymentMode === 'INTEGRATED_PAYMENT' && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Cobrar no terminal Android. Só feche aqui se o pagamento já estiver aprovado.
                </Alert>
              )}

              {paymentMode !== 'ORDER_ONLY' && (
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Forma de pagamento
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={paymentMethod}
                  onChange={(_, value) => value && setPaymentMethod(value)}
                  className="checkout-payments"
                >
                  {paymentMethods.map((method) => (
                    <ToggleButton key={method.id} value={method.id}>
                      {method.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions className="checkout-dialog-actions" sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={closing}
            sx={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            Fechar
          </Button>
          {!empty && (
            <Button
              variant="contained"
              onClick={handleAskConfirm}
              disabled={!canClose || closing}
              sx={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
              }}
            >
              {closing
                ? (paymentStatus === 'PROCESSING' ? 'Registrando...' : 'Fechando...')
                : paymentMode === 'ORDER_ONLY'
                  ? 'Liberar conta'
                  : paymentMode === 'MANUAL_CONFIRMATION'
                    ? 'Confirmar pagamento e liberar'
                    : 'Fechar conta'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        {...confirmDialogProps}
        className="checkout-confirm-dialog"
        open={confirmOpen}
        onClose={closing ? undefined : handleCancelConfirm}
        aria-labelledby="checkout-confirm-title"
        aria-describedby="checkout-confirm-description"
        maxWidth="xs"
      >
        <DialogTitle
          id="checkout-confirm-title"
          sx={{
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontSize: '1.25rem',
          }}
        >
          {confirmCopy.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="checkout-confirm-description"
            sx={{
              color: 'var(--color-text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.5,
            }}
          >
            {confirmCopy.description}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button
            autoFocus
            variant="outlined"
            onClick={handleCancelConfirm}
            disabled={closing}
            sx={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!canClose || closing}
            sx={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setToast('')} severity="success" sx={{ width: '100%' }}>
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}
