import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useDialogResponsiveProps } from '../../commons/hooks/useResponsive';
import { PATHS, formatCurrency, formatDate } from '../../services/accessControl';
import {
  getApiErrorMessage,
  getPartnerPayout,
  listPartnerCommissions,
  listPartnerPayouts,
} from '../../services/partnerService';
import { formatDateTime } from './partnerConstants';
import PartnerPagedList from './PartnerPagedList';
import PartnerShell from './PartnerShell';
import { PartnerStatusChip } from './PartnerStatusChip';

function PayoutDetailDialog({ payoutId, summary, onClose }) {
  const dialogProps = useDialogResponsiveProps();
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!payoutId) return undefined;
    let active = true;
    setPayout(null);
    setLoading(true);
    setError('');
    getPartnerPayout(payoutId)
      .then((data) => { if (active) setPayout(data); })
      .catch((failure) => {
        if (active) setError(getApiErrorMessage(failure, 'Não foi possível carregar o pagamento.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [payoutId]);

  const view = payout || summary;
  const rows = view
    ? [
      ['Referência', view.reference || `#${view.id}`],
      ['Competência', view.competence || '—'],
      ['Valor', formatCurrency(view.amount)],
      ['Previsto para', formatDate(view.scheduledAt)],
      ['Pago em', formatDateTime(view.paidAt)],
    ]
    : [];

  return (
    <Dialog open={Boolean(payoutId)} onClose={onClose} maxWidth="xs" aria-labelledby="partner-payout-title" {...dialogProps}>
      <DialogTitle id="partner-payout-title">Detalhes do pagamento</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && !view && <Skeleton variant="rounded" height={160} />}
        {view && (
          <Stack spacing={1.5}>
            <Box><PartnerStatusChip kind="payout" value={view.status} /></Box>
            {rows.map(([label, value]) => (
              <Stack key={label} direction="row" justifyContent="space-between" gap={2}>
                <Typography variant="body2" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={600} textAlign="right">{value}</Typography>
              </Stack>
            ))}
            {view.notes && (
              <Box>
                <Typography variant="body2" color="text.secondary">Observações</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{view.notes}</Typography>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}

const PAYOUT_COLUMNS = [
  { key: 'reference', label: 'Referência', render: (item) => item.reference || `#${item.id}` },
  { key: 'competence', label: 'Competência', render: (item) => item.competence || '—' },
  { key: 'amount', label: 'Valor', align: 'right', render: (item) => formatCurrency(item.amount) },
  { key: 'status', label: 'Status', render: (item) => <PartnerStatusChip kind="payout" value={item.status} /> },
  { key: 'scheduledAt', label: 'Previsto para', render: (item) => formatDate(item.scheduledAt) },
  { key: 'paidAt', label: 'Pago em', render: (item) => formatDateTime(item.paidAt) },
];

function commissionKindLabel(item) {
  const percent = Number(item.commissionPercent);
  if (item.commissionKind === 'FIRST_MONTH' || percent === 100) {
    return '1ª mensalidade (100%)';
  }
  if (item.commissionKind === 'RENEWAL' || percent === 10) {
    return 'Renovação (10%)';
  }
  return item.commissionPercent != null ? `${item.commissionPercent}%` : '—';
}

const COMMISSION_COLUMNS = [
  { key: 'establishment', label: 'Estabelecimento', render: (item) => item.establishmentName || '—' },
  { key: 'kind', label: 'Tipo', render: (item) => commissionKindLabel(item) },
  { key: 'amount', label: 'Valor', align: 'right', render: (item) => formatCurrency(item.commissionAmount) },
  { key: 'status', label: 'Status', render: (item) => <PartnerStatusChip kind="commission" value={item.status} /> },
  { key: 'competence', label: 'Competência', render: (item) => formatDate(item.competenceDate) },
  { key: 'eligibility', label: 'Elegível em', render: (item) => formatDate(item.eligibilityDate) },
  { key: 'paidAt', label: 'Pago em', render: (item) => formatDateTime(item.paidAt) },
];

export default function PartnerPayoutsPage() {
  const [tab, setTab] = useState('payouts');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Pagamentos | Parceiros Weper';
    return () => { document.title = previous; };
  }, []);

  return (
    <PartnerShell>
      <div className="partner-page-head">
        <div>
          <h1 className="partner-page-title">Pagamentos</h1>
          <p className="partner-page-subtitle">
            Acompanhe os pagamentos e as comissões geradas pelas suas indicações.
          </p>
        </div>
        <Button component={Link} to={PATHS.PARTNERS_DASHBOARD} variant="outlined">Voltar ao painel</Button>
      </div>

      <section className="partner-card">
        <Tabs
          value={tab}
          onChange={(_event, next) => setTab(next)}
          aria-label="Pagamentos e comissões"
          sx={{ mb: 2, borderBottom: '1px solid var(--color-border)' }}
        >
          <Tab value="payouts" label="Pagamentos" />
          <Tab value="commissions" label="Comissões" />
        </Tabs>

        {tab === 'payouts' ? (
          <PartnerPagedList
            key="payouts"
            fetchPage={listPartnerPayouts}
            columns={PAYOUT_COLUMNS}
            ariaLabel="Pagamentos"
            emptyTitle="Nenhum pagamento por aqui ainda"
            emptyDescription="Quando houver pagamentos agendados ou realizados, eles aparecerão nesta lista."
            onRowClick={setSelected}
            renderCard={(item) => (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography fontWeight={700}>{item.reference || `#${item.id}`}</Typography>
                  <PartnerStatusChip kind="payout" value={item.status} />
                </Stack>
                <Typography variant="h6" sx={{ mt: 0.5 }}>{formatCurrency(item.amount)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Competência {item.competence || '—'} · Previsto {formatDate(item.scheduledAt)}
                </Typography>
              </>
            )}
          />
        ) : (
          <PartnerPagedList
            key="commissions"
            fetchPage={listPartnerCommissions}
            columns={COMMISSION_COLUMNS}
            ariaLabel="Comissões"
            emptyTitle="Nenhuma comissão ainda"
            emptyDescription="As comissões aparecem aqui quando uma indicação elegível gera movimentação."
            renderCard={(item) => (
              <>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{item.establishmentName || '—'}</Typography>
                  <PartnerStatusChip kind="commission" value={item.status} />
                </Stack>
                <Typography variant="h6" sx={{ mt: 0.5 }}>{formatCurrency(item.commissionAmount)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {commissionKindLabel(item)} · Competência {formatDate(item.competenceDate)}
                </Typography>
              </>
            )}
          />
        )}
      </section>

      <PayoutDetailDialog
        payoutId={selected?.id}
        summary={selected}
        onClose={() => setSelected(null)}
      />
    </PartnerShell>
  );
}
