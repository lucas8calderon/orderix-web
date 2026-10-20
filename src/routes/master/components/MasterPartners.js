import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { PageHeader } from '../../../commons/components/PageHeader';
import { EmptyState } from '../../../commons/components/EmptyState';
import { useDialogResponsiveProps } from '../../../commons/hooks/useResponsive';
import { PATHS, ROLES, formatCurrency, formatDate } from '../../../services/accessControl';
import { getCurrentUser } from '../../../services/session';
import { EMPTY_PAGE, formatWhatsappDisplay, getApiErrorMessage, partnerFullName } from '../../../services/partnerService';
import { PARTNER_PAGE_SIZE, PARTNER_STATUS_META, formatDateTime } from '../../partners/partnerConstants';
import { PartnerStatusChip } from '../../partners/PartnerStatusChip';
import PartnerPagedList from '../../partners/PartnerPagedList';
import {
  authorizeAdminPartnerRecovery,
  getAdminPartner,
  listAdminPartnerCommissions,
  listAdminPartnerPayouts,
  listAdminPartnerReferrals,
  listAdminPartners,
  approveAdminPayoutBatch,
  createAdminPartnerPayoutBatch,
  getAdminPayoutTransferConfig,
  listAdminPartnerPayoutBatches,
  rejectAdminPayoutBatch,
  lookupAdminPartnerPixKey,
  reviewAdminPartnerPayoutData,
  transferAdminPayoutBatch,
  updateAdminPartnerStatus,
} from '../service/partnersAdminService';

const STATUS_ACTIONS = [
  { status: 'ACTIVE', label: 'Ativar', variant: 'contained' },
  { status: 'SUSPENDED', label: 'Suspender', variant: 'outlined' },
  { status: 'DISABLED', label: 'Desativar', variant: 'outlined' },
];

function partnerCodeLabel(partner) {
  const share = partner?.shareCode;
  const legacy = partner?.referralCode;
  if (share && legacy && share !== legacy) return `${share} (antigo ${legacy})`;
  return share || legacy || '—';
}

const REFERRAL_COLUMNS = [
  { key: 'establishment', label: 'Estabelecimento', render: (item) => item.establishmentName },
  {
    key: 'contact',
    label: 'Contato',
    render: (item) => [item.contactName, item.commercialWhatsapp && formatWhatsappDisplay(item.commercialWhatsapp)].filter(Boolean).join(' · ') || '—',
  },
  { key: 'status', label: 'Status', render: (item) => <PartnerStatusChip kind="referral" value={item.status} /> },
  { key: 'plan', label: 'Plano / assinatura', render: (item) => [item.planCode, item.subscriptionStatus].filter(Boolean).join(' · ') || '—' },
  { key: 'estimated', label: 'Prevista', align: 'right', render: (item) => formatCurrency(item.estimatedCommission) },
  { key: 'paid', label: 'Paga', align: 'right', render: (item) => formatCurrency(item.paidCommission) },
  { key: 'createdAt', label: 'Indicada em', render: (item) => formatDate(item.createdAt) },
];

const COMMISSION_COLUMNS = [
  { key: 'establishment', label: 'Estabelecimento', render: (item) => item.establishmentName || '—' },
  { key: 'amount', label: 'Valor', align: 'right', render: (item) => formatCurrency(item.commissionAmount) },
  { key: 'status', label: 'Status', render: (item) => <PartnerStatusChip kind="commission" value={item.status} /> },
  { key: 'competence', label: 'Competência', render: (item) => formatDate(item.competenceDate) },
  { key: 'eligibility', label: 'Elegível em', render: (item) => formatDate(item.eligibilityDate) },
  { key: 'paidAt', label: 'Pago em', render: (item) => formatDateTime(item.paidAt) },
];

const PAYOUT_COLUMNS = [
  { key: 'reference', label: 'Referência', render: (item) => item.reference || `#${item.id}` },
  { key: 'competence', label: 'Competência', render: (item) => item.competence || '—' },
  { key: 'amount', label: 'Valor', align: 'right', render: (item) => formatCurrency(item.amount) },
  { key: 'status', label: 'Status', render: (item) => <PartnerStatusChip kind="payout" value={item.status} /> },
  { key: 'scheduledAt', label: 'Previsto para', render: (item) => formatDate(item.scheduledAt) },
  { key: 'paidAt', label: 'Pago em', render: (item) => formatDateTime(item.paidAt) },
];

function Field({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Box sx={{ fontWeight: 600, fontSize: 14, overflowWrap: 'anywhere' }}>{children}</Box>
    </Box>
  );
}

function SimpleCard({ title, subtitle, status }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
      <Box sx={{ minWidth: 0 }}>
        <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
      </Box>
      {status}
    </Stack>
  );
}

function PartnerDetailDialog({ partnerId, onClose, onChanged, notify }) {
  const dialogProps = useDialogResponsiveProps();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('summary');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(null);
  const [batches, setBatches] = useState([]);
  const [transferConfig, setTransferConfig] = useState({ transfersEnabled: false, flag: 'asaas.partner-pix-transfer.enabled' });
  const [confirmAction, setConfirmAction] = useState(null);
  const [pixLookup, setPixLookup] = useState(null);
  const [pixLookupBusy, setPixLookupBusy] = useState(false);

  const reloadBatches = useCallback(async () => {
    if (!partnerId) return;
    try {
      const [page, config] = await Promise.all([
        listAdminPartnerPayoutBatches(partnerId, { page: 0, size: 20 }),
        getAdminPayoutTransferConfig().catch(() => ({ transfersEnabled: false, flag: 'asaas.partner-pix-transfer.enabled' })),
      ]);
      setBatches(page?.items || []);
      setTransferConfig(config || { transfersEnabled: false });
    } catch {
      setBatches([]);
    }
  }, [partnerId]);

  useEffect(() => {
    if (!partnerId) return undefined;
    let active = true;
    setPartner(null);
    setError('');
    setTab('summary');
    setReason('');
    setRecovery(null);
    setBatches([]);
    setConfirmAction(null);
    setPixLookup(null);
    setLoading(true);
    getAdminPartner(partnerId)
      .then((data) => { if (active) setPartner(data); })
      .catch((failure) => { if (active) setError(getApiErrorMessage(failure, 'Não foi possível carregar o parceiro.')); })
      .finally(() => { if (active) setLoading(false); });
    reloadBatches();
    return () => { active = false; };
  }, [partnerId, reloadBatches]);

  const fetchReferrals = useCallback((params) => listAdminPartnerReferrals(partnerId, params), [partnerId]);
  const fetchCommissions = useCallback((params) => listAdminPartnerCommissions(partnerId, params), [partnerId]);
  const fetchPayouts = useCallback((params) => listAdminPartnerPayouts(partnerId, params), [partnerId]);

  const runConfirmedBatchAction = async () => {
    if (!confirmAction || busy) return;
    setBusy(true);
    setError('');
    try {
      if (confirmAction.type === 'approve') {
        await approveAdminPayoutBatch(confirmAction.batchId);
        notify(`Lote #${confirmAction.batchId} aprovado.`);
      } else if (confirmAction.type === 'reject') {
        await rejectAdminPayoutBatch(confirmAction.batchId, { notes: reason || 'Lote rejeitado na revisão administrativa.' });
        notify(`Lote #${confirmAction.batchId} rejeitado.`);
      } else if (confirmAction.type === 'transfer') {
        const result = await transferAdminPayoutBatch(confirmAction.batchId);
        notify(`Transferência do lote #${confirmAction.batchId}: ${result.status}.`);
      }
      setConfirmAction(null);
      await reloadBatches();
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Não foi possível concluir a ação no lote.'));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status) => {
    if (busy || !partner) return;
    setBusy(true);
    setError('');
    try {
      const updated = await updateAdminPartnerStatus(partner.id, { status, reason });
      setPartner(updated);
      setReason('');
      onChanged?.(updated);
      notify(`Status alterado para "${PARTNER_STATUS_META[status]?.label || status}".`);
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Não foi possível alterar o status.'));
    } finally {
      setBusy(false);
    }
  };

  const authorizeRecovery = async () => {
    if (busy || !partner) return;
    setBusy(true);
    setError('');
    try {
      setRecovery(await authorizeAdminPartnerRecovery(partner.id));
    } catch (failure) {
      setError(getApiErrorMessage(failure, 'Não foi possível autorizar a recuperação.'));
    } finally {
      setBusy(false);
    }
  };

  const resetLink = recovery?.rawToken
    ? `${window.location.origin}${PATHS.PARTNERS_RESET}?token=${encodeURIComponent(recovery.rawToken)}`
    : '';

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copiado para a área de transferência.');
    } catch {
      notify('Não foi possível copiar automaticamente.', 'error');
    }
  };

  return (
    <Dialog open={Boolean(partnerId)} onClose={onClose} maxWidth="md" aria-labelledby="admin-partner-title" {...dialogProps}>
      <DialogTitle id="admin-partner-title">
        {partner ? partnerFullName(partner) || `Parceiro #${partner.id}` : 'Parceiro'}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{error}</Alert>}
        {loading && <Skeleton variant="rounded" height={180} />}
        {partner && (
          <>
            <Tabs
              value={tab}
              onChange={(_event, next) => setTab(next)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Seções do parceiro"
              sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab value="summary" label="Resumo" />
              <Tab value="referrals" label="Indicações" />
              <Tab value="commissions" label="Comissões" />
              <Tab value="payouts" label="Pagamentos" />
            </Tabs>

            {tab === 'summary' && (
              <Stack spacing={3}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' } }}>
                  <Field label="Status"><PartnerStatusChip kind="partner" value={partner.status} /></Field>
                  <Field label="WhatsApp">
                    {formatWhatsappDisplay(partner.whatsapp)}{' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {partner.phoneVerified ? '· verificado' : '· não verificado'}
                    </Typography>
                  </Field>
                  <Field label="Código de indicação">{partnerCodeLabel(partner)}</Field>
                  <Field label="Indicações">{partner.totalReferrals ?? 0}</Field>
                  <Field label="Convertidas">{partner.convertedReferrals ?? 0}</Field>
                  <Field label="Cadastro">{formatDateTime(partner.createdAt)}</Field>
                  <Field label="Titular Pix">{partner.payoutHolderName || '—'}</Field>
                  <Field label="Documento">{partner.payoutDocument || '—'}</Field>
                  <Field label="Chave Pix">{partner.pixKeyType ? `${partner.pixKeyType}: ${partner.pixKey || '—'}` : '—'}</Field>
                  <Field label="Status recebimento">{partner.payoutDataStatus || 'MISSING'}</Field>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Dados de recebimento (Pix)</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    <Button
                      variant="outlined"
                      disabled={busy || pixLookupBusy || !partner.pixKeyType}
                      onClick={async () => {
                        setPixLookupBusy(true);
                        setError('');
                        try {
                          setPixLookup(await lookupAdminPartnerPixKey(partner.id));
                          notify('Consulta de titularidade Pix concluída.');
                        } catch (failure) {
                          setPixLookup(null);
                          setError(getApiErrorMessage(failure, 'Não foi possível consultar a titularidade Pix no Asaas.'));
                        } finally {
                          setPixLookupBusy(false);
                        }
                      }}
                    >
                      {pixLookupBusy ? 'Consultando…' : 'Consultar titularidade'}
                    </Button>
                    <Button
                      variant="contained"
                      disabled={busy || partner.payoutDataStatus === 'READY'}
                      onClick={async () => {
                        setBusy(true);
                        setError('');
                        try {
                          const updated = await reviewAdminPartnerPayoutData(partner.id, { status: 'READY' });
                          setPartner(updated);
                          notify('Dados Pix liberados para lotes.');
                        } catch (failure) {
                          setError(getApiErrorMessage(failure, 'Não foi possível aprovar os dados Pix.'));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Aprovar Pix
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={busy || partner.payoutDataStatus === 'REJECTED'}
                      onClick={async () => {
                        setBusy(true);
                        setError('');
                        try {
                          const updated = await reviewAdminPartnerPayoutData(partner.id, {
                            status: 'REJECTED',
                            notes: reason || 'Dados Pix rejeitados na revisão administrativa.',
                          });
                          setPartner(updated);
                          notify('Dados Pix rejeitados.');
                        } catch (failure) {
                          setError(getApiErrorMessage(failure, 'Não foi possível rejeitar os dados Pix.'));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Rejeitar Pix
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={busy || !partner.payoutDataStatus || partner.payoutDataStatus !== 'READY'}
                      onClick={async () => {
                        setBusy(true);
                        setError('');
                        try {
                          const batch = await createAdminPartnerPayoutBatch(partner.id);
                          notify(`Lote #${batch.id} criado (${batch.status}).`);
                          await reloadBatches();
                        } catch (failure) {
                          setError(getApiErrorMessage(failure, 'Não foi possível criar o lote.'));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      Criar lote
                    </Button>
                  </Stack>
                  {partner.payoutDataNotes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {partner.payoutDataNotes}
                    </Typography>
                  )}
                  {pixLookup && (
                    <Alert
                      severity={pixLookup.documentMatches ? (pixLookup.nameMatches ? 'success' : 'warning') : 'warning'}
                      sx={{ mt: 1.5 }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                        Titularidade Asaas
                      </Typography>
                      <Typography variant="body2">
                        Asaas: {pixLookup.asaasHolderName || '—'} · doc {pixLookup.asaasDocument || '—'}
                      </Typography>
                      <Typography variant="body2">
                        Cadastro: {pixLookup.registeredHolderName || '—'} · doc {pixLookup.registeredDocument || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Documento {pixLookup.documentMatches ? 'confere' : 'diverge'} · nome{' '}
                        {pixLookup.nameMatches ? 'compatível' : 'diverge'}.
                      </Typography>
                      {pixLookup.guidance && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {pixLookup.guidance}
                        </Typography>
                      )}
                    </Alert>
                  )}
                  <Alert severity={transferConfig.transfersEnabled ? 'warning' : 'info'} sx={{ mt: 1.5 }}>
                    Transferências Pix: {transferConfig.transfersEnabled ? 'LIGADAS' : 'DESLIGADAS'}
                    {' '}(`{transferConfig.flag || 'asaas.partner-pix-transfer.enabled'}`).
                    Sem auto-agendamento em produção.
                  </Alert>

                  {batches.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Lotes Pix</Typography>
                      <Stack spacing={1.5}>
                        {batches.map((batch) => (
                          <Paper key={batch.id} variant="outlined" sx={{ p: 1.5 }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                              <Box>
                                <Typography fontWeight={700}>
                                  Lote #{batch.id} · {formatCurrency(batch.amount)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {batch.commissionCount ?? 0} comissão(ões) · {batch.status}
                                  {batch.failureReason ? ` · ${batch.failureReason}` : ''}
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {batch.status === 'PENDING_APPROVAL' && (
                                  <>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      disabled={busy}
                                      onClick={() => setConfirmAction({ type: 'approve', batchId: batch.id })}
                                    >
                                      Aprovar
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="inherit"
                                      disabled={busy}
                                      onClick={() => setConfirmAction({ type: 'reject', batchId: batch.id })}
                                    >
                                      Rejeitar
                                    </Button>
                                  </>
                                )}
                                {(batch.status === 'APPROVED' || batch.status === 'FAILED' || batch.status === 'TRANSFER_PENDING') && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="warning"
                                    disabled={busy}
                                    onClick={() => setConfirmAction({ type: 'transfer', batchId: batch.id })}
                                  >
                                    {transferConfig.transfersEnabled ? 'Executar Pix' : 'Tentar transferir'}
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Situação do acesso</Typography>
                  <TextField
                    size="small"
                    fullWidth
                    label="Motivo (opcional)"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {STATUS_ACTIONS.map((action) => (
                      <Button
                        key={action.status}
                        variant={action.variant}
                        disabled={busy || partner.status === action.status}
                        onClick={() => changeStatus(action.status)}
                        color={action.status === 'ACTIVE' ? 'primary' : 'inherit'}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Suspenso ou desativado não consegue entrar na Área de Parceiros.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Recuperação de acesso</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Gera um código de redefinição de senha, válido por tempo limitado. Entregue-o ao
                    parceiro por um canal confiável, depois de confirmar a identidade.
                  </Typography>
                  <Button variant="outlined" onClick={authorizeRecovery} disabled={busy}>
                    Autorizar recuperação
                  </Button>
                  {recovery && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Código exibido apenas agora. Expira em {formatDateTime(recovery.expiresAt)}.
                      </Typography>
                      <Typography
                        component="code"
                        sx={{ display: 'block', p: 1, borderRadius: 1, bgcolor: 'action.hover', fontSize: 13, overflowWrap: 'anywhere' }}
                      >
                        {recovery.rawToken}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                        <Button size="small" onClick={() => copy(recovery.rawToken)}>Copiar código</Button>
                        <Button size="small" onClick={() => copy(resetLink)}>Copiar link de redefinição</Button>
                      </Stack>
                      {recovery.note && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>{recovery.note}</Typography>
                      )}
                    </Alert>
                  )}
                </Box>
              </Stack>
            )}

            {tab === 'referrals' && (
              <PartnerPagedList
                key={`ref-${partnerId}`}
                fetchPage={fetchReferrals}
                columns={REFERRAL_COLUMNS}
                ariaLabel="Indicações do parceiro"
                emptyTitle="Sem indicações"
                emptyDescription="Este parceiro ainda não indicou estabelecimentos."
                renderCard={(item) => (
                  <>
                    <SimpleCard
                      title={item.establishmentName}
                      subtitle={`${item.contactName || 'Sem contato'} · ${formatDate(item.createdAt)}`}
                      status={<PartnerStatusChip kind="referral" value={item.status} />}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Prevista {formatCurrency(item.estimatedCommission)} · Paga {formatCurrency(item.paidCommission)}
                    </Typography>
                  </>
                )}
              />
            )}

            {tab === 'commissions' && (
              <PartnerPagedList
                key={`com-${partnerId}`}
                fetchPage={fetchCommissions}
                columns={COMMISSION_COLUMNS}
                ariaLabel="Comissões do parceiro"
                emptyTitle="Sem comissões"
                emptyDescription="Nenhuma comissão foi gerada para este parceiro."
                renderCard={(item) => (
                  <>
                    <SimpleCard
                      title={item.establishmentName || '—'}
                      subtitle={`Competência ${formatDate(item.competenceDate)}`}
                      status={<PartnerStatusChip kind="commission" value={item.status} />}
                    />
                    <Typography fontWeight={700}>{formatCurrency(item.commissionAmount)}</Typography>
                  </>
                )}
              />
            )}

            {tab === 'payouts' && (
              <PartnerPagedList
                key={`pay-${partnerId}`}
                fetchPage={fetchPayouts}
                columns={PAYOUT_COLUMNS}
                ariaLabel="Pagamentos do parceiro"
                emptyTitle="Sem pagamentos"
                emptyDescription="Nenhum pagamento foi agendado para este parceiro."
                renderCard={(item) => (
                  <>
                    <SimpleCard
                      title={item.reference || `#${item.id}`}
                      subtitle={`Competência ${item.competence || '—'} · Previsto ${formatDate(item.scheduledAt)}`}
                      status={<PartnerStatusChip kind="payout" value={item.status} />}
                    />
                    <Typography fontWeight={700}>{formatCurrency(item.amount)}</Typography>
                  </>
                )}
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>

      <Dialog
        open={Boolean(confirmAction)}
        onClose={() => !busy && setConfirmAction(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {confirmAction?.type === 'approve' && `Aprovar lote #${confirmAction.batchId}?`}
          {confirmAction?.type === 'reject' && `Rejeitar lote #${confirmAction.batchId}?`}
          {confirmAction?.type === 'transfer' && `Executar transferência do lote #${confirmAction.batchId}?`}
        </DialogTitle>
        <DialogContent>
          {confirmAction?.type === 'approve' && (
            <Typography variant="body2">
              As comissões permanecem RESERVED até a transferência Pix ser confirmada (TRANSFER_DONE).
            </Typography>
          )}
          {confirmAction?.type === 'reject' && (
            <Typography variant="body2">
              As comissões do lote voltam para AVAILABLE. Use o campo Motivo acima se quiser registrar a razão.
            </Typography>
          )}
          {confirmAction?.type === 'transfer' && (
            <Alert severity={transferConfig.transfersEnabled ? 'warning' : 'info'} sx={{ mt: 0.5 }}>
              {transferConfig.transfersEnabled
                ? 'A flag de transferência está LIGADA neste ambiente. Confirme que deseja movimentar saldo Pix real.'
                : 'A flag está DESLIGADA: a API recusará Pix real e apenas reportará o estado. Não há transferência Asaas.'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} disabled={busy}>Cancelar</Button>
          <Button
            variant="contained"
            color={confirmAction?.type === 'transfer' ? 'warning' : 'primary'}
            disabled={busy}
            onClick={runConfirmedBatchAction}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

/** Seção "Parceiros" do painel Master. Restrita a MASTER e SUPER_ADMIN. */
export function MasterPartners() {
  const user = getCurrentUser();
  const allowed = user?.role === ROLES.MASTER || user?.role === ROLES.SUPER_ADMIN;

  const [filters, setFilters] = useState({ q: '', status: '' });
  const [applied, setApplied] = useState({ q: '', status: '' });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PARTNER_PAGE_SIZE);
  const [data, setData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!allowed) return;
    const current = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const result = await listAdminPartners({ ...applied, page, size });
      if (current === requestId.current) setData(result || EMPTY_PAGE);
    } catch (failure) {
      if (current === requestId.current) setError(getApiErrorMessage(failure, 'Não foi possível carregar os parceiros.'));
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [allowed, applied, page, size]);

  useEffect(() => { load(); }, [load]);

  const notify = useMemo(
    () => (message, severity = 'success') => setToast({ open: true, message, severity }),
    [],
  );

  if (!allowed) {
    return <Alert severity="error">Acesso restrito à administração da plataforma.</Alert>;
  }

  const items = data.items || [];
  const hasFilters = Boolean(applied.q || applied.status);

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(0);
    setApplied({ q: filters.q.trim(), status: filters.status });
  };

  const clearFilters = () => {
    setFilters({ q: '', status: '' });
    setApplied({ q: '', status: '' });
    setPage(0);
  };

  return (
    <>
      <PageHeader
        title="Parceiros"
        description="Cadastros do programa de parceiros: status de acesso, indicações, comissões e pagamentos."
      />

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: { xs: 1.5, sm: 2 } }}>
        <Box component="form" onSubmit={applyFilters} aria-label="Filtrar parceiros">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Buscar por nome, WhatsApp ou código"
              value={filters.q}
              onChange={(event) => setFilters((c) => ({ ...c, q: event.target.value }))}
              sx={{ flex: 1.5, minWidth: 0 }}
            />
            <FormControl size="small" sx={{ flex: 1, minWidth: 180 }}>
              <InputLabel id="admin-partner-status">Status</InputLabel>
              <Select
                labelId="admin-partner-status"
                label="Status"
                value={filters.status}
                onChange={(event) => setFilters((c) => ({ ...c, status: event.target.value }))}
              >
                <MenuItem value="">Todos</MenuItem>
                {Object.entries(PARTNER_STATUS_META).map(([value, meta]) => (
                  <MenuItem key={value} value={value}>{meta.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>Filtrar</Button>
              {(hasFilters || filters.q || filters.status) && <Button onClick={clearFilters}>Limpar</Button>}
            </Stack>
          </Stack>
        </Box>

        {error && (
          <Alert
            severity="error"
            role="alert"
            sx={{ mb: 2 }}
            action={<Button color="inherit" size="small" onClick={load}>Tentar novamente</Button>}
          >
            {error}
          </Alert>
        )}

        {loading && (
          <Stack spacing={1} aria-busy="true" aria-label="Carregando parceiros">
            {[0, 1, 2, 3, 4].map((row) => <Skeleton key={row} variant="rounded" height={44} />)}
          </Stack>
        )}

        {!loading && !error && items.length === 0 && (
          <EmptyState
            title={hasFilters ? 'Nenhum parceiro encontrado' : 'Nenhum parceiro cadastrado'}
            description={hasFilters
              ? 'Ajuste ou limpe os filtros.'
              : 'Os cadastros feitos pela Área de Parceiros aparecem aqui.'}
            actionLabel={hasFilters ? 'Limpar filtros' : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}

        {!loading && items.length > 0 && (
          <>
            <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
              <Table size="small" aria-label="Parceiros" sx={{ minWidth: 760 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Parceiro</TableCell>
                    <TableCell>WhatsApp</TableCell>
                    <TableCell>Código</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Indicações</TableCell>
                    <TableCell align="right">Convertidas</TableCell>
                    <TableCell>Cadastro</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((partner) => (
                    <TableRow key={partner.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{partnerFullName(partner) || `#${partner.id}`}</TableCell>
                      <TableCell>{formatWhatsappDisplay(partner.whatsapp)}</TableCell>
                      <TableCell>{partnerCodeLabel(partner)}</TableCell>
                      <TableCell><PartnerStatusChip kind="partner" value={partner.status} /></TableCell>
                      <TableCell align="right">{partner.totalReferrals ?? 0}</TableCell>
                      <TableCell align="right">{partner.convertedReferrals ?? 0}</TableCell>
                      <TableCell>{formatDate(partner.createdAt)}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setSelectedId(partner.id)}>Detalhes</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
              {items.map((partner) => (
                <Paper key={partner.id} elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <SimpleCard
                    title={partnerFullName(partner) || `#${partner.id}`}
                    subtitle={`${formatWhatsappDisplay(partner.whatsapp)} · ${partnerCodeLabel(partner)}`}
                    status={<PartnerStatusChip kind="partner" value={partner.status} />}
                  />
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {partner.totalReferrals ?? 0} indicações · {partner.convertedReferrals ?? 0} convertidas · {formatDate(partner.createdAt)}
                  </Typography>
                  <Button size="small" onClick={() => setSelectedId(partner.id)} sx={{ mt: 1, minHeight: 40 }}>
                    Ver detalhes
                  </Button>
                </Paper>
              ))}
            </Stack>
          </>
        )}

        {!error && data.totalElements > 0 && (
          <TablePagination
            component="div"
            count={data.totalElements}
            page={page}
            rowsPerPage={size}
            rowsPerPageOptions={[10, 20, 50]}
            onPageChange={(_event, next) => setPage(next)}
            onRowsPerPageChange={(event) => {
              setSize(Number(event.target.value));
              setPage(0);
            }}
          />
        )}
      </Paper>

      <PartnerDetailDialog
        partnerId={selectedId}
        onClose={() => setSelectedId(null)}
        onChanged={load}
        notify={notify}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((current) => ({ ...current, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default MasterPartners;
