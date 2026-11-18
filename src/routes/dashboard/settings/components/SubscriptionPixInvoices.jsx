import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import '../../../../services/apiConfig';
import { getCurrentUser } from '../../../../services/authService';
import { formatPrice } from '../../../../config/pricingTiers';

const STORE_ADMIN_ROLES = new Set(['ADMIN', 'STORE_ADMIN']);
export const PIX_INVOICE_POLL_MS = 10000;

const STATUS_LABEL = {
  OPEN: 'Aguardando pagamento',
  PAID: 'Paga',
  REVIEW: 'Em análise',
  REFUNDED: 'Devolvida',
  CANCELED: 'Cancelada',
};

export function formatDay(value) {
  const parts = Array.isArray(value) ? value : String(value || '').slice(0, 10).split('-');
  if (parts.length < 3) return '—';
  const [year, month, day] = parts;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function qrImage(base64) {
  const value = String(base64 || '').trim();
  if (!value) return '';
  return value.startsWith('data:image/') ? value : `data:image/png;base64,${value}`;
}

function errorMessage(error, fallback) {
  const message = error?.response?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

/** Mensalidades Pix da loja (Mercado Pago). Só aparece quando a assinatura tem mensalidades. */
export function SubscriptionPixInvoices() {
  const role = getCurrentUser()?.role;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justPaid, setJustPaid] = useState(false);
  const openIdRef = useRef(null);

  const load = useCallback(async () => {
    const response = await axios.get('/api/billing/subscription/invoices');
    const next = response?.data || null;
    const open = next?.invoices?.find((invoice) => invoice.status === 'OPEN');
    const previousOpen = openIdRef.current;
    if (previousOpen && !open) {
      const settled = next?.invoices?.find((invoice) => invoice.id === previousOpen);
      if (settled?.status === 'PAID') setJustPaid(true);
    }
    openIdRef.current = open ? open.id : null;
    setData(next);
    return next;
  }, []);

  useEffect(() => {
    if (!STORE_ADMIN_ROLES.has(role)) return undefined;
    let active = true;
    load().catch(() => {
      if (active) setData(null);
    });
    return () => {
      active = false;
    };
  }, [role, load]);

  const open = data?.invoices?.find((invoice) => invoice.status === 'OPEN') || null;
  const waitingPix = Boolean(open?.pix);

  useEffect(() => {
    if (!waitingPix) return undefined;
    const timer = window.setInterval(() => {
      load().catch(() => {});
    }, PIX_INVOICE_POLL_MS);
    return () => window.clearInterval(timer);
  }, [waitingPix, load]);

  if (!STORE_ADMIN_ROLES.has(role) || !data || !data.invoices || data.invoices.length === 0) {
    return null;
  }

  async function generatePix() {
    if (!open || busy) return;
    setBusy(true);
    setError('');
    try {
      await axios.post(`/api/billing/subscription/invoices/${open.id}/pix`);
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError, 'Não foi possível gerar o Pix agora. Tente de novo em alguns minutos.'));
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    setError('');
    try {
      await load();
    } catch (requestError) {
      setError(errorMessage(requestError, 'Não foi possível atualizar agora.'));
    }
  }

  async function copyCode() {
    if (!open?.pix?.qrCode) return;
    try {
      await navigator.clipboard.writeText(open.pix.qrCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const history = data.invoices.filter((invoice) => invoice.status !== 'OPEN');
  const image = qrImage(open?.pix?.qrCodeBase64);

  return (
    <Card id="mensalidades" variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
          Mensalidades
        </Typography>

        {justPaid && !open ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Pagamento confirmado! Sua assinatura está regularizada.
          </Alert>
        ) : null}

        {open ? (
          <Box sx={{ mb: 3 }} data-testid="pix-open-invoice">
            <Typography sx={{ fontWeight: 700 }}>Sua mensalidade está disponível</Typography>
            <Typography>Valor: {formatPrice(Number(open.amount))}</Typography>
            <Typography>Vencimento: {formatDay(open.dueDate)}</Typography>
            {open.graceLimit ? (
              <Typography variant="body2" color="text.secondary">
                Pague até {formatDay(open.graceLimit)} para evitar a suspensão do acesso.
              </Typography>
            ) : null}

            {open.pix ? (
              <Stack spacing={1.5} sx={{ mt: 2, alignItems: 'flex-start' }}>
                {image ? (
                  <img src={image} alt="QR Code Pix da mensalidade" width={200} height={200} />
                ) : (
                  <QRCodeSVG value={open.pix.qrCode} size={200} />
                )}
                <Box
                  component="code"
                  data-testid="pix-copy-code"
                  sx={{ wordBreak: 'break-all', fontSize: 12, bgcolor: 'action.hover', p: 1, borderRadius: 1, maxWidth: '100%' }}
                >
                  {open.pix.qrCode}
                </Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                  <Button variant="contained" onClick={copyCode}>
                    {copied ? 'Código copiado' : 'Copiar código Pix'}
                  </Button>
                  <Button variant="outlined" onClick={refresh}>
                    Atualizar status
                  </Button>
                </Stack>
                <Chip label="Aguardando pagamento" color="warning" size="small" />
              </Stack>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  O Pix anterior expirou ou ainda não foi gerado.
                </Typography>
                <Button variant="contained" onClick={generatePix} disabled={busy}>
                  {busy ? 'Gerando…' : 'Gerar Pix da mensalidade'}
                </Button>
              </Box>
            )}
          </Box>
        ) : null}

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        {history.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Histórico de pagamentos</Typography>
            <Stack spacing={0.75}>
              {history.map((invoice) => (
                <Box key={invoice.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="body2">
                    {invoice.competence} · {formatPrice(Number(invoice.amount))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {STATUS_LABEL[invoice.status] || invoice.status}
                    {invoice.paidAt ? ` em ${formatDay(invoice.paidAt)}` : ''}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}
