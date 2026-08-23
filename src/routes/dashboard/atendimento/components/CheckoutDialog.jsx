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

const PAYMENT_METHODS = [
  { id: 'PIX', label: 'Pix' },
  { id: 'DEBIT', label: 'Débito' },
  { id: 'CREDIT', label: 'Crédito' },
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

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

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
  const [applyServiceTax, setApplyServiceTax] = useState(false);
  const [discount, setDiscount] = useState('0');
  const [toast, setToast] = useState('');

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
    setPaymentMethod('PIX');
    setApplyServiceTax(false);
    setDiscount('0');

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

  const subtotal = useMemo(() => accountSubtotal(account), [account]);
  const discountValue = Math.max(0, Number(discount) || 0);
  const serviceTax = applyServiceTax ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal + serviceTax - discountValue);
  const itemCount = useMemo(() => countAccountItems(account), [account]);
  const canClose = !loading && !empty && !error && itemCount > 0 && Boolean(paymentMethod);

  const handleConfirm = () => {
    if (!canClose || !target?.id) return;
    setClosing(true);
    setError('');
    const payload = {
      paymentMethod,
      applyServiceTax,
      discount: discountValue,
    };
    const request =
      target.kind === 'comanda'
        ? closeComandaAccount(target.id, payload)
        : closeTableAccount(target.id, payload);

    request
      .then(() => {
        setToast('Conta fechada com sucesso!');
        onPaid?.();
      })
      .catch((err) => {
        setError(apiErrorMessage(err, 'Erro ao fechar a conta.'));
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
                  label="Taxa de serviço (10%)"
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
                  {PAYMENT_METHODS.map((method) => (
                    <ToggleButton key={method.id} value={method.id}>
                      {method.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
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
              onClick={handleConfirm}
              disabled={!canClose || closing}
              sx={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
              }}
            >
              {closing ? 'Fechando...' : 'Confirmar pagamento e liberar'}
            </Button>
          )}
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
