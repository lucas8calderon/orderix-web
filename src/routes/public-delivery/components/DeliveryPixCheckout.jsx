import { useEffect, useMemo, useRef, useState } from 'react';
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
import {
  PIX_POLL_INTERVAL_MS,
  getDeliveryPixPaymentByToken,
  isPixPaid,
  isPixTerminal,
} from '../../../services/deliveryPaymentService';
import './DeliveryPixCheckout.css';

const TICK_MS = 1000;

export default function DeliveryPixCheckout({
  open,
  payment,
  error,
  creating,
  onClose,
  onPaid,
  onRetry,
}) {
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(payment);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = live?.status || payment?.status;
  const paid = isPixPaid(status);
  const terminal = isPixTerminal(status);
  const hasCharge = Boolean(payment?.qrCode || payment?.qrCodeBase64 || payment?.id);
  const expiresAtRaw = live?.expiresAt ?? payment?.expiresAt;
  const expiresAtMs = useStableExpiresAtMs(payment?.id, expiresAtRaw);
  const windowStartMs = usePaymentWindowStart(payment?.id, expiresAtMs, live?.createdAt ?? payment?.createdAt);
  const timeExpired = Boolean(
    !paid && (status === 'EXPIRED' || (expiresAtMs != null && nowMs >= expiresAtMs))
  );
  const canRetry = Boolean(payment?.orderId) && typeof onRetry === 'function';
  const showRetry = canRetry && !creating && !paid
    && (Boolean(error) || timeExpired || status === 'EXPIRED' || status === 'FAILED');
  const qrSrc = useMemo(() => {
    const raw = live?.qrCodeBase64 || payment?.qrCodeBase64;
    if (!raw) return '';
    return raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`;
  }, [live?.qrCodeBase64, payment?.qrCodeBase64]);
  const copyCode = live?.qrCode || payment?.qrCode || '';
  const expiryProgress = useMemo(
    () => computeExpiryProgress({
      expiresAtMs,
      windowStartMs,
      nowMs,
      expired: timeExpired || status === 'EXPIRED',
    }),
    [expiresAtMs, windowStartMs, nowMs, timeExpired, status]
  );

  useEffect(() => {
    setLive(payment);
  }, [payment]);

  const paidOnce = useRef(false);
  useEffect(() => {
    paidOnce.current = false;
  }, [payment?.id]);

  useEffect(() => {
    if (!open || !hasCharge || paid || !expiresAtMs) {
      return undefined;
    }
    setNowMs(Date.now());
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, TICK_MS);
    return () => {
      window.clearInterval(timer);
    };
  }, [open, hasCharge, paid, expiresAtMs, payment?.id]);

  useEffect(() => {
    const token = payment?.publicToken;
    if (!open || !token || !hasCharge || terminal) {
      return undefined;
    }
    let stopped = false;
    const timer = window.setInterval(async () => {
      if (stopped || paidOnce.current) return;
      try {
        const response = await getDeliveryPixPaymentByToken(token);
        if (stopped) return;
        setLive(response.data);
        if (isPixTerminal(response.data?.status)) {
          stopped = true;
          window.clearInterval(timer);
        }
        if (isPixPaid(response.data?.status) && !paidOnce.current) {
          paidOnce.current = true;
          onPaid(response.data);
        }
      } catch {
        // polling silencioso; o usuário continua vendo o QR
      }
    }, PIX_POLL_INTERVAL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [open, payment?.publicToken, hasCharge, terminal, onPaid]);

  const copy = async () => {
    if (!copyCode) return;
    try {
      await navigator.clipboard.writeText(copyCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const waitLabel = paid
    ? 'Pagamento confirmado'
    : timeExpired || status === 'EXPIRED'
      ? 'Pix expirado — gere um novo código'
      : terminal
        ? statusLabel(status)
        : 'Aguardando pagamento';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="delivery-pix-dialog">
      <DialogTitle className="delivery-pix-title">
        Pix online
        <IconButton aria-label="Fechar" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="delivery-pix-content">
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {creating && !hasCharge ? (
          <Box className="delivery-pix-loading">
            <CircularProgress size={28} />
            <Typography>Gerando Pix…</Typography>
          </Box>
        ) : null}
        {hasCharge ? (
          <>
            <Typography className="delivery-pix-total">
              Total {formatCurrency(payment.amount)}
            </Typography>
            {qrSrc ? (
              <img className="delivery-pix-qr" src={qrSrc} alt="QR Code do Pix" />
            ) : null}
            {copyCode ? (
              <Box className="delivery-pix-copy">
                <Typography variant="body2" className="delivery-pix-code">{copyCode}</Typography>
                <Button variant="outlined" onClick={copy}>{copied ? 'Copiado' : 'Copiar código'}</Button>
              </Box>
            ) : null}
            {!paid ? (
              <PixExpiryBar progress={expiryProgress} />
            ) : null}
            <Typography className="delivery-pix-wait" role="status">
              {waitLabel}
            </Typography>
          </>
        ) : null}
        {showRetry ? (
          <Button variant="contained" onClick={onRetry} sx={{ mt: 2 }} disabled={creating}>
            Gerar novo Pix
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function PixExpiryBar({ progress }) {
  if (!progress || progress.kind === 'unknown') {
    return (
      <Box className="delivery-pix-expiry delivery-pix-expiry--pending" aria-live="polite">
        <Typography className="delivery-pix-expiry-label" component="p">
          Calculando prazo…
        </Typography>
        <Box className="delivery-pix-expiry-track" aria-hidden>
          <Box className="delivery-pix-expiry-fill delivery-pix-expiry-fill--indeterminate" />
        </Box>
      </Box>
    );
  }

  const { ratio, label, expired } = progress;
  const widthPct = Math.max(0, Math.min(100, ratio * 100));

  return (
    <Box
      className={`delivery-pix-expiry${expired ? ' delivery-pix-expiry--expired' : ''}`}
      aria-live="polite"
    >
      <Typography className="delivery-pix-expiry-label" component="p">
        {expired ? 'Código expirado' : `Tempo restante: ${label}`}
      </Typography>
      <Box
        className="delivery-pix-expiry-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(widthPct)}
        aria-label={expired ? 'Código Pix expirado' : `Tempo restante para pagar: ${label}`}
      >
        <Box
          className="delivery-pix-expiry-fill"
          style={{ width: `${widthPct}%` }}
        />
      </Box>
    </Box>
  );
}

function useStableExpiresAtMs(paymentId, raw) {
  const lockRef = useRef({ paymentId: null, ms: null });
  const parsed = useMemo(() => parseExpiresAtMs(raw), [raw]);
  if (lockRef.current.paymentId !== paymentId) {
    lockRef.current = { paymentId, ms: parsed };
    return parsed;
  }
  if (parsed != null && (lockRef.current.ms == null || parsed < lockRef.current.ms)) {
    lockRef.current = { paymentId, ms: parsed };
  }
  return lockRef.current.ms;
}

function usePaymentWindowStart(paymentId, expiresAtMs, createdAtRaw) {
  const anchorRef = useRef({ paymentId: null, startMs: null });

  return useMemo(() => {
    const createdMs = parseExpiresAtMs(createdAtRaw);
    if (createdMs != null && expiresAtMs != null && createdMs < expiresAtMs) {
      return createdMs;
    }
    if (expiresAtMs == null || paymentId == null) {
      return null;
    }
    if (anchorRef.current.paymentId !== paymentId || anchorRef.current.startMs == null) {
      const remaining = Math.max(0, expiresAtMs - Date.now());
      anchorRef.current = {
        paymentId,
        startMs: expiresAtMs - (remaining || 1),
      };
    }
    return anchorRef.current.startMs;
  }, [paymentId, expiresAtMs, createdAtRaw]);
}

export function parseExpiresAtMs(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? null : ms;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  // Backend envia LocalDateTime sem fuso (yyyy-MM-dd'T'HH:mm:ss) — interpreta como horário local.
  const normalized = /Z$|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : raw.replace(' ', 'T');
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? null : ms;
}

export function formatRemainingMs(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

export function computeExpiryProgress({ expiresAtMs, windowStartMs, nowMs, expired }) {
  if (expired || (expiresAtMs != null && nowMs >= expiresAtMs)) {
    return { kind: 'ready', ratio: 0, label: '00:00', expired: true };
  }
  if (expiresAtMs == null) {
    return { kind: 'unknown' };
  }
  if (windowStartMs == null || !(windowStartMs < expiresAtMs)) {
    return { kind: 'unknown' };
  }
  const total = expiresAtMs - windowStartMs;
  const remaining = Math.max(0, expiresAtMs - nowMs);
  const ratio = Math.max(0, Math.min(1, remaining / total));
  return {
    kind: 'ready',
    ratio,
    label: formatRemainingMs(remaining),
    expired: false,
  };
}

function statusLabel(status) {
  if (status === 'EXPIRED') return 'Pix expirado';
  if (status === 'FAILED') return 'Não foi possível concluir o Pix';
  if (status === 'CANCELLED') return 'Pix cancelado';
  return status;
}
