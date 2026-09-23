import { useEffect, useId, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency } from '../../../services/accessControl';
import { createDeliveryCardPayment, getDeliveryPixPayment, isPixPaid } from '../../../services/deliveryPaymentService';
import './DeliveryCardCheckout.css';

const SDK_URL = 'https://sdk.mercadopago.com/js/v2';

function newKey() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
}

function loadMercadoPago() {
  if (window.MercadoPago) {
    return Promise.resolve(window.MercadoPago);
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-mp-sdk="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.MercadoPago), { once: true });
      existing.addEventListener('error', () => reject(new Error('sdk')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.dataset.mpSdk = '1';
    script.onload = () => resolve(window.MercadoPago);
    script.onerror = () => reject(new Error('sdk'));
    document.body.appendChild(script);
  });
}

export default function DeliveryCardCheckout({
  open,
  slug,
  orderId,
  amount,
  publicKey,
  payerEmail,
  onClose,
  onApproved,
  onChooseOther,
}) {
  const reactId = useId().replace(/:/g, '');
  const containerId = `card-brick-${reactId}`;
  const keyRef = useRef(newKey());
  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState('form');
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);
  const [loadingBrick, setLoadingBrick] = useState(false);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    setPhase('form');
    setError('');
    setPayment(null);
    keyRef.current = newKey();
  }, [open, orderId]);

  useEffect(() => {
    if (!open || phase !== 'form' || !publicKey || !orderId) {
      return undefined;
    }
    let cancelled = false;
    let controller;
    setLoadingBrick(true);
    setError('');
    loadMercadoPago()
      .then((MercadoPago) => {
        if (cancelled || !MercadoPago) return null;
        const mp = new MercadoPago(publicKey, { locale: 'pt-BR' });
        return mp.bricks().create('cardPayment', containerId, {
          initialization: {
            amount: Number(amount),
            payer: payerEmail ? { email: payerEmail } : undefined,
          },
          customization: {
            visual: { hideFormTitle: true },
            paymentMethods: {
              maxInstallments: 12,
              types: { excluded: ['debit_card', 'prepaid_card'] },
            },
          },
          callbacks: {
            onReady: () => {
              if (!cancelled) setLoadingBrick(false);
            },
            onError: () => {
              if (!cancelled) {
                setLoadingBrick(false);
                setError('Não foi possível carregar o pagamento com cartão.');
              }
            },
            onSubmit: (formData) => submitCard(formData),
          },
        });
      })
      .then((created) => {
        if (cancelled && created && typeof created.unmount === 'function') {
          created.unmount();
          return;
        }
        controller = created;
      })
      .catch(() => {
        if (!cancelled) {
          setLoadingBrick(false);
          setError('Não foi possível carregar o Mercado Pago.');
        }
      });
    return () => {
      cancelled = true;
      if (controller && typeof controller.unmount === 'function') {
        controller.unmount();
      }
    };
  }, [open, phase, publicKey, orderId, amount, payerEmail, attempt, containerId]);

  useEffect(() => {
    if (!open || phase !== 'pending' || !payment?.id) {
      return undefined;
    }
    const timer = window.setInterval(async () => {
      try {
        const response = await getDeliveryPixPayment(slug, orderId, payment.id);
        const status = response.data?.status;
        if (isPixPaid(status)) {
          setPayment(response.data);
          setPhase('approved');
        } else if (status === 'FAILED' || status === 'DECLINED' || status === 'CANCELLED') {
          setPayment(response.data);
          setPhase('failed');
          setError(response.data?.statusMessage || 'Não foi possível concluir o pagamento com este cartão.');
        }
      } catch {
        // continua em análise
      }
    }, 5000);
    return () => window.clearInterval(timer);
  }, [open, phase, payment?.id, slug, orderId]);

  const submitCard = (formData) => {
    const payload = {
      cardToken: formData?.token,
      paymentMethodId: formData?.payment_method_id,
      installments: Number(formData?.installments),
      identificationType: formData?.payer?.identification?.type,
      identificationNumber: formData?.payer?.identification?.number,
    };
    return createDeliveryCardPayment(slug, orderId, keyRef.current, payload)
      .then((response) => {
        const data = response.data || {};
        setPayment(data);
        if (isPixPaid(data.status)) {
          setPhase('approved');
          return undefined;
        }
        if (data.status === 'FAILED' || data.status === 'DECLINED' || data.status === 'CANCELLED') {
          setPhase('failed');
          setError(data.statusMessage || 'Não foi possível concluir o pagamento com este cartão.');
          return Promise.reject(new Error('declined'));
        }
        setPhase('pending');
        return undefined;
      })
      .catch((err) => {
        if (err?.message === 'declined') {
          return Promise.reject(err);
        }
        if (!err?.response) {
          setPhase('unknown');
          setError('Não confirmamos o resultado. Aguarde antes de tentar outro pagamento.');
        } else {
          setPhase('failed');
          setError(err?.response?.data?.message || 'Não foi possível concluir o pagamento com este cartão.');
        }
        return Promise.reject(err);
      });
  };

  const tryAnotherCard = () => {
    keyRef.current = newKey();
    setPayment(null);
    setError('');
    setPhase('form');
    setAttempt((value) => value + 1);
  };

  return (
    <Dialog open={open} onClose={phase === 'form' ? onClose : undefined} fullWidth maxWidth="sm" className="delivery-card-dialog">
      <DialogTitle>
        Cartão de crédito
        <IconButton aria-label="Fechar" onClick={onClose} size="small" sx={{ float: 'right' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="delivery-card-content">
        <Typography className="delivery-card-total">Total {formatCurrency(amount)}</Typography>
        {error && phase !== 'approved' ? <Alert severity={phase === 'unknown' ? 'warning' : 'error'} sx={{ mb: 2 }}>{error}</Alert> : null}
        {phase === 'form' ? (
          <>
            {loadingBrick ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CircularProgress size={22} />
                <Typography>Carregando pagamento…</Typography>
              </Box>
            ) : null}
            <div id={containerId} className="delivery-card-brick" />
          </>
        ) : null}
        {phase === 'approved' ? (
          <Box className="delivery-card-result" role="status">
            <Typography variant="h6">Pagamento aprovado</Typography>
            <Typography>Recebemos seu pagamento.</Typography>
            <Typography>Pedido #{orderId}</Typography>
            <Button variant="contained" onClick={() => onApproved(payment)}>Acompanhar pedido</Button>
          </Box>
        ) : null}
        {phase === 'failed' ? (
          <Box className="delivery-card-result" role="status">
            <Typography variant="h6">Pagamento não aprovado</Typography>
            <Typography>Não conseguimos concluir o pagamento.</Typography>
            <Box className="delivery-card-actions">
              <Button variant="contained" onClick={tryAnotherCard}>Tentar outro cartão</Button>
              <Button variant="outlined" onClick={onChooseOther}>Escolher outra forma de pagamento</Button>
            </Box>
          </Box>
        ) : null}
        {phase === 'pending' || phase === 'unknown' ? (
          <Box className="delivery-card-result" role="status">
            <Typography variant="h6">Pagamento em análise</Typography>
            <Typography>Estamos aguardando a confirmação do Mercado Pago.</Typography>
            {phase === 'pending' ? <CircularProgress size={22} sx={{ alignSelf: 'center' }} /> : null}
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
