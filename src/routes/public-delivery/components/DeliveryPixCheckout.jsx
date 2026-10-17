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
  provider,
}) {
  const [copied, setCopied] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [live, setLive] = useState(payment);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const status = live?.status || payment?.status;
  const paid = isPixPaid(status);
  const terminal = isPixTerminal(status);
  const hasCharge = Boolean(payment?.qrCode || payment?.qrCodeBase64 || payment?.ticketUrl || payment?.id);
  const expiresAtRaw = live?.expiresAt ?? payment?.expiresAt;
  const expiresAtMs = useStableExpiresAtMs(payment?.id, expiresAtRaw);
  const windowStartMs = usePaymentWindowStart(payment?.id, expiresAtMs, live?.createdAt ?? payment?.createdAt);
  const timeExpired = Boolean(
    !paid && (status === 'EXPIRED' || (expiresAtMs != null && nowMs >= expiresAtMs))
  );
  const canRetry = Boolean(payment?.orderId) && typeof onRetry === 'function';
  const showRetry = canRetry && !creating && !paid
    && (Boolean(error) || timeExpired || status === 'EXPIRED' || status === 'FAILED');
  const copyCode = live?.qrCode || payment?.qrCode || '';
  const ticketUrl = live?.ticketUrl || payment?.ticketUrl || '';
  const showMercadoPagoTicket = isMercadoPagoTicket(provider, ticketUrl);
  const qrCandidate = useMemo(() => {
    const fromCode = qrImageSource(live?.qrCodeBase64 || payment?.qrCodeBase64);
    if (fromCode) return fromCode;
    if (showMercadoPagoTicket) return '';
    return qrImageSource(ticketUrl);
  }, [live?.qrCodeBase64, payment?.qrCodeBase64, showMercadoPagoTicket, ticketUrl]);
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
    setQrFailed(false);
  }, [qrCandidate]);

  const qrSrc = qrFailed ? '' : qrCandidate;

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
        setLive((current) => mergePixCharge(current, response.data, payment));
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
              <div className="delivery-pix-qr-frame">
                <img
                  className="delivery-pix-qr"
                  src={qrSrc}
                  alt="QR Code do Pix"
                  onError={() => setQrFailed(true)}
                />
              </div>
            ) : null}
            {copyCode ? (
              <Box className="delivery-pix-copy">
                <code className="delivery-pix-code">{copyCode}</code>
                <Button variant="outlined" onClick={copy}>{copied ? 'Copiado' : 'Copiar código'}</Button>
              </Box>
            ) : null}
            {showMercadoPagoTicket ? (
              <Button
                variant="text"
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir cobrança no Mercado Pago
              </Button>
            ) : null}
            {!qrSrc && !copyCode && !showMercadoPagoTicket ? (
              <Alert severity="warning">
                {String(provider || '').toUpperCase() === 'PAGBANK'
                  ? 'O PagBank não devolveu o código desta cobrança. Gere um novo Pix.'
                  : 'O Mercado Pago não devolveu o código desta cobrança. Gere um novo Pix. Se continuar vazio, cadastre uma chave Pix na conta que emitiu a cobrança.'}
              </Alert>
            ) : null}
            {!paid && (expiresAtMs != null || status === 'EXPIRED') ? (
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

export function mergePixCharge(current, incoming, original) {
  const pick = (key) => {
    const value = incoming?.[key];
    if (value != null && String(value).trim() !== '') return value;
    return current?.[key] || original?.[key] || '';
  };
  return {
    ...original,
    ...current,
    ...incoming,
    qrCode: pick('qrCode'),
    qrCodeBase64: pick('qrCodeBase64'),
    ticketUrl: pick('ticketUrl'),
  };
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

const MIN_PIX_EXPIRY_MS = Date.UTC(2020, 0, 1);

export function parseExpiresAtMs(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return normalizeEpoch(value);
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isNaN(ms) ? null : validPixInstant(ms);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^\d+(\.\d+)?$/.test(raw)) {
    return normalizeEpoch(Number(raw));
  }
  // Sem fuso (yyyy-MM-dd'T'HH:mm:ss) vale o horário local. Com Z ou offset, o instante absoluto.
  const normalized = /Z$|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : raw.replace(' ', 'T');
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? null : validPixInstant(ms);
}

function normalizeEpoch(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  // 13 dígitos: milissegundos. 10 dígitos: unix em segundos. Duração curta (ex.: 1800) não é instante.
  if (value >= 1e12) return validPixInstant(value);
  if (value >= 1e9) return validPixInstant(value * 1000);
  return null;
}

function validPixInstant(ms) {
  return ms >= MIN_PIX_EXPIRY_MS ? ms : null;
}

export function isMercadoPagoTicket(provider, ticketUrl) {
  if (!ticketUrl) return false;
  const name = String(provider || '').toUpperCase();
  if (name === 'PAGBANK') return false;
  if (name === 'MERCADOPAGO') return true;
  return isMercadoPagoHost(ticketUrl);
}

function isMercadoPagoHost(url) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host === 'mpago.la' || host.endsWith('.mpago.la') || host.includes('mercadopago.');
  } catch {
    return false;
  }
}

function qrImageSource(raw) {
  if (raw == null) return '';
  const value = String(raw).trim();
  if (!value) return '';
  if (value.startsWith('data:image/')) return value;
  if (/^https?:\/\//i.test(value)) {
    return looksLikeRasterImage(value) ? value : '';
  }
  if (/^data:/i.test(value)) return '';
  return `data:image/png;base64,${value}`;
}

function looksLikeRasterImage(url) {
  const path = url.split(/[?#]/)[0].toLowerCase();
  return /\.(png|jpe?g|gif|webp)$/.test(path);
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
  if (status === 'FAILED' || status === 'DECLINED') return 'Não foi possível concluir o Pix';
  if (status === 'CANCELLED') return 'Pix cancelado';
  if (status === 'REFUNDED') return 'Pagamento estornado';
  if (status === 'APPROVED' || status === 'PAID') return 'Pagamento confirmado';
  return 'Aguardando confirmação do provedor';
}
