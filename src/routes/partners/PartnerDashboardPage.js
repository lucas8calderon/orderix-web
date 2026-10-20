import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Skeleton, Snackbar, Stack, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Link } from 'react-router-dom';
import { PATHS, formatCurrency, formatDate } from '../../services/accessControl';
import { getCurrentUser } from '../../services/session';
import {
  getApiErrorMessage,
  getPartnerDashboard,
  getPartnerEarnings,
} from '../../services/partnerService';
import { buildPublicReferralLink } from '../../services/partnerReferral';
import PartnerEarningsChart from './PartnerEarningsChart';
import PartnerReferralDialog from './PartnerReferralDialog';
import PartnerReferralsPanel from './PartnerReferralsPanel';
import PartnerShell from './PartnerShell';

function shareableCode(dashboard) {
  return dashboard?.shareCode || dashboard?.referralCode || '';
}

function buildReferralLink(dashboard) {
  const code = shareableCode(dashboard);
  if (code && typeof window !== 'undefined') {
    return buildPublicReferralLink(code, window.location.origin);
  }
  return dashboard?.referralLink || '';
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand?.('copy');
  document.body.removeChild(area);
  if (!ok) throw new Error('copy-failed');
}

function Kpi({ label, value, hint, accent, loading }) {
  return (
    <div className={accent ? 'partner-kpi is-accent' : 'partner-kpi'}>
      <p className="partner-kpi-label">{label}</p>
      {loading ? (
        <Skeleton variant="text" width="70%" sx={{ fontSize: 24 }} />
      ) : (
        <p className="partner-kpi-value">{value}</p>
      )}
      {hint && !loading && <p className="partner-kpi-hint">{hint}</p>}
    </div>
  );
}

export default function PartnerDashboardPage() {
  const sessionUser = getCurrentUser();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const [range, setRange] = useState('6m');
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [earningsError, setEarningsError] = useState('');
  const earningsRequest = useRef(0);

  const [referralOpen, setReferralOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError('');
    try {
      setDashboard(await getPartnerDashboard());
    } catch (error) {
      setDashboardError(getApiErrorMessage(error, 'Não foi possível carregar seus indicadores.'));
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadEarnings = useCallback(async (nextRange) => {
    const current = ++earningsRequest.current;
    setEarningsLoading(true);
    setEarningsError('');
    try {
      const result = await getPartnerEarnings(nextRange);
      if (current === earningsRequest.current) setEarnings(result);
    } catch (error) {
      if (current === earningsRequest.current) {
        setEarningsError(getApiErrorMessage(error, 'Não foi possível carregar o gráfico.'));
      }
    } finally {
      if (current === earningsRequest.current) setEarningsLoading(false);
    }
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Painel do Parceiro | Weper';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadEarnings(range); }, [loadEarnings, range]);

  const firstName = dashboard?.firstName || sessionUser?.firstName || 'parceiro';
  const referralLink = buildReferralLink(dashboard);
  const shareCode = shareableCode(dashboard);
  const legacyStillValid = Boolean(
    dashboard?.referralCode && shareCode && dashboard.referralCode !== shareCode,
  );
  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await copyText(referralLink);
      showToast('Link de indicação copiado!');
    } catch {
      showToast('Não foi possível copiar. Selecione o link e copie manualmente.', 'error');
    }
  };

  const handleCopyCode = async () => {
    if (!shareCode) return;
    try {
      await copyText(shareCode);
      showToast('Código de indicação copiado!');
    } catch {
      showToast('Não foi possível copiar. Selecione o código e copie manualmente.', 'error');
    }
  };

  const whatsappShare = referralLink
    ? `https://wa.me/?text=${encodeURIComponent(`Conheça a Weper, plataforma para estabelecimentos: ${referralLink}`)}`
    : '';

  const handleReferralCreated = () => {
    setReferralOpen(false);
    setRefreshKey((key) => key + 1);
    loadDashboard();
    showToast('Indicação enviada com sucesso!');
  };

  const kpis = [
    { label: 'Indicações', value: dashboard?.totalReferrals ?? 0 },
    { label: 'Convertidas', value: dashboard?.convertedReferrals ?? 0 },
    { label: 'Previstas', value: formatCurrency(dashboard?.estimatedCommissions) },
    { label: 'Pendentes', value: formatCurrency(dashboard?.pendingCommissions) },
    { label: 'Disponível', value: formatCurrency(dashboard?.availableCommissions), accent: true },
    { label: 'Em processamento', value: formatCurrency(dashboard?.reservedCommissions) },
    { label: 'Recebidas', value: formatCurrency(dashboard?.totalReceived) },
    {
      label: 'Próximo pagamento',
      value: dashboard?.nextPayoutDate ? formatDate(dashboard.nextPayoutDate) : 'Sob aprovação',
      hint: dashboard?.nextPayoutDate ? undefined : 'Lotes Pix só após aprovação admin',
    },
  ];

  return (
    <PartnerShell>
      <div className="partner-page-head">
        <div>
          <h1 className="partner-page-title">Olá, {firstName}! <span aria-hidden="true">👋</span></h1>
          <p className="partner-page-subtitle">
            Acompanhe suas indicações, comissões e pagamentos da Weper.
          </p>
        </div>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setReferralOpen(true)}
            sx={{ bgcolor: 'var(--color-primary)', '&:hover': { bgcolor: 'var(--color-primary-dark)' } }}
          >
            Nova indicação
          </Button>
          <Button component={Link} to={PATHS.PARTNERS_PAYOUTS} variant="outlined" startIcon={<PaymentsOutlinedIcon />}>
            Pagamentos
          </Button>
          <Button component={Link} to={PATHS.PARTNERS_PROFILE} variant="outlined" startIcon={<PersonOutlineIcon />}>
            Perfil
          </Button>
        </Stack>
      </div>

      <div className="partner-stack">
        {dashboardError && (
          <Alert
            severity="error"
            role="alert"
            action={<Button color="inherit" size="small" onClick={loadDashboard}>Tentar novamente</Button>}
          >
            {dashboardError}
          </Alert>
        )}

        {dashboard && dashboard.commissionsRuleConfigured === false && (
          <Alert severity="info">
            {dashboard.commissionsAvailabilityNote
              || 'As comissões financeiras aguardam a regra comercial do programa. Os valores aparecem zerados até lá.'}
          </Alert>
        )}

        <section aria-label="Indicadores">
          <div className="partner-kpis">
            {kpis.map((kpi) => (
              <Kpi key={kpi.label} {...kpi} loading={dashboardLoading && !dashboard} />
            ))}
          </div>
        </section>

        <section className="partner-card" aria-labelledby="partner-link-title">
          <h2 id="partner-link-title" className="partner-card-title">Seu link de indicação</h2>
          <p className="partner-card-subtitle">
            Compartilhe o link ou peça para o cliente digitar o código em Contratar.
          </p>
          {dashboardLoading && !dashboard ? (
            <Skeleton variant="rounded" height={48} />
          ) : (
            <>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  size="small"
                  fullWidth
                  value={referralLink || 'Link indisponível no momento'}
                  inputProps={{ readOnly: true, 'aria-label': 'Link de indicação' }}
                  onFocus={(event) => event.target.select()}
                />
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  <Button variant="contained" startIcon={<ContentCopyOutlinedIcon />} onClick={handleCopy} disabled={!referralLink}>
                    Copiar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<WhatsAppIcon />}
                    component="a"
                    href={whatsappShare || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={!referralLink}
                  >
                    Compartilhar
                  </Button>
                </Stack>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Código para digitar"
                  value={shareCode || 'Código indisponível no momento'}
                  inputProps={{
                    readOnly: true,
                    'aria-label': 'Código de indicação',
                    style: { fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' },
                  }}
                  onFocus={(event) => event.target.select()}
                />
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyOutlinedIcon />}
                  onClick={handleCopyCode}
                  disabled={!shareCode}
                  sx={{ flexShrink: 0, alignSelf: { sm: 'center' } }}
                >
                  Copiar código
                </Button>
              </Stack>
              <p className="partner-kpi-hint" style={{ marginTop: 10 }}>
                O cliente cola este código no campo “Indicação? Insira o código”.
                {legacyStillValid ? ' Links já enviados com o código anterior continuam válidos.' : ''}
              </p>
            </>
          )}
        </section>

        <PartnerEarningsChart
          earnings={earnings}
          loading={earningsLoading}
          error={earningsError}
          range={range}
          onRangeChange={setRange}
        />

        <PartnerReferralsPanel onNewReferral={() => setReferralOpen(true)} refreshKey={refreshKey} />
      </div>

      <PartnerReferralDialog
        open={referralOpen}
        onClose={() => setReferralOpen(false)}
        onCreated={handleReferralCreated}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 72, md: 24 } }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((current) => ({ ...current, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </PartnerShell>
  );
}
