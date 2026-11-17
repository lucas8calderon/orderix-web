import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, IconButton, Skeleton, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Link } from 'react-router-dom';
import { PATHS, formatCurrency, formatDate } from '../../services/accessControl';
import { getCurrentUser } from '../../services/session';
import {
  getApiErrorMessage,
  getPartnerDashboard,
  getPartnerEarnings,
  getPartnerLeaderboard,
} from '../../services/partnerService';
import { buildPublicReferralLink } from '../../services/partnerReferral';
import PartnerEarningsChart from './PartnerEarningsChart';
import PartnerLeaderboard from './PartnerLeaderboard';
import PartnerReferralDialog from './PartnerReferralDialog';
import PartnerReferralsPanel from './PartnerReferralsPanel';
import PartnerShell from './PartnerShell';
import './PartnerDashboard.css';

const WHATSAPP_MESSAGE =
  'Oi! Queria te indicar a Weper, um sistema para restaurante que junta pedidos, mesas, cozinha e delivery num lugar só. Dá uma olhada:';

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

function displayLink(link) {
  return String(link || '').replace(/^https?:\/\//, '');
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

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function conversionRate(total, converted) {
  const all = toNumber(total);
  if (all <= 0) return null;
  return Math.round((toNumber(converted) / all) * 100);
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

  const [leaderboard, setLeaderboard] = useState(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');

  const [referralOpen, setReferralOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [copied, setCopied] = useState('');
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

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    setLeaderboardError('');
    try {
      setLeaderboard(await getPartnerLeaderboard());
    } catch (error) {
      setLeaderboardError(getApiErrorMessage(error, 'Não foi possível carregar o ranking.'));
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    const previous = document.title;
    document.title = 'Painel do Parceiro | Weper';
    return () => { document.title = previous; };
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);
  useEffect(() => { loadEarnings(range); }, [loadEarnings, range]);

  const firstName = dashboard?.firstName || sessionUser?.firstName || '';
  const referralLink = buildReferralLink(dashboard);
  const shareCode = shareableCode(dashboard);
  const firstLoad = dashboardLoading && !dashboard;
  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const flagCopied = (key) => {
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? '' : current)), 2000);
  };

  const copyWithFeedback = async (text) => {
    try {
      await copyText(text);
      return true;
    } catch {
      showToast('Não foi possível copiar. Selecione o texto e copie manualmente.', 'error');
      return false;
    }
  };

  const handleCopyLink = async () => {
    if (referralLink && await copyWithFeedback(referralLink)) flagCopied('link');
  };

  const handleCopyCode = async () => {
    if (shareCode && await copyWithFeedback(shareCode)) flagCopied('code');
  };

  const handleReferralCreated = () => {
    setReferralOpen(false);
    setRefreshKey((key) => key + 1);
    loadDashboard();
    showToast('Indicação registrada. Acompanhe o andamento em Minhas indicações.');
  };

  const whatsappHref = referralLink
    ? `https://wa.me/?text=${encodeURIComponent(`${WHATSAPP_MESSAGE} ${referralLink}`)}`
    : undefined;

  const total = toNumber(dashboard?.totalReferrals);
  const converted = toNumber(dashboard?.convertedReferrals);
  const reserved = toNumber(dashboard?.reservedCommissions);

  return (
    <PartnerShell>
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

        {sessionUser?.status && sessionUser.status !== 'ACTIVE' && (
          <Alert severity="info">
            Os leads do CRM ficam disponíveis quando a Weper ativar seu cadastro.
          </Alert>
        )}

        {dashboard && dashboard.commissionsRuleConfigured === false && (
          <Alert severity="info">
            {dashboard.commissionsAvailabilityNote
              || 'As comissões financeiras aguardam a regra comercial do programa. Os valores aparecem zerados até lá.'}
          </Alert>
        )}

        <section className="partner-card pd-top" aria-labelledby="pd-top-title">
          <div className="pd-top-head">
            <div>
              <h1 id="pd-top-title" className="pd-title">{firstName ? `Olá, ${firstName}` : 'Olá'}</h1>
              <p className="pd-lead">Compartilhe seu link. Cada loja que assinar gera comissão para você.</p>
            </div>
            <Button
              variant="text"
              startIcon={<AddIcon />}
              onClick={() => setReferralOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 700, flexShrink: 0 }}
            >
              Indicar estabelecimento
            </Button>
          </div>

          {firstLoad ? (
            <Skeleton variant="rounded" height={46} />
          ) : (
            <div className="pd-link">
              <span className="pd-link-url" title={referralLink} aria-label="Seu link de indicação">
                {referralLink ? displayLink(referralLink) : 'Link indisponível no momento'}
              </span>
              <div className="pd-link-actions">
                <Button
                  variant="contained"
                  disableElevation
                  startIcon={copied === 'link' ? <CheckIcon /> : <ContentCopyOutlinedIcon />}
                  onClick={handleCopyLink}
                  disabled={!referralLink}
                  sx={{ textTransform: 'none', fontWeight: 700, minWidth: 132 }}
                >
                  {copied === 'link' ? 'Copiado' : 'Copiar link'}
                </Button>
                <IconButton
                  component="a"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!referralLink}
                  aria-label="Enviar link no WhatsApp"
                  className="pd-wa"
                >
                  <WhatsAppIcon />
                </IconButton>
              </div>
            </div>
          )}

          {shareCode && (
            <p className="pd-code">
              Código para digitar na contratação:{' '}
              <button type="button" className="pd-code-chip" onClick={handleCopyCode} aria-label={`Copiar código ${shareCode}`}>
                {shareCode}
                {copied === 'code' ? <CheckIcon sx={{ fontSize: 13 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
              </button>
            </p>
          )}

          <dl className="pd-stats">
            <div>
              <dt>Clientes indicados</dt>
              <dd>{firstLoad ? '–' : total}</dd>
            </div>
            <div>
              <dt>Ativos</dt>
              <dd>{firstLoad ? '–' : (dashboard?.activeClients ?? converted)}</dd>
            </div>
            <div>
              <dt>Receita gerada</dt>
              <dd className="is-money">{firstLoad ? '–' : formatCurrency(dashboard?.generatedRevenue)}</dd>
            </div>
            <div>
              <dt>Comissão acumulada</dt>
              <dd>{firstLoad ? '–' : formatCurrency(dashboard?.accumulatedCommission)}</dd>
            </div>
            <div>
              <dt>Saldo pendente</dt>
              <dd>{firstLoad ? '–' : formatCurrency(dashboard?.pendingBalance ?? (toNumber(dashboard?.pendingCommissions) + reserved))}</dd>
            </div>
            <div>
              <dt>Disponível</dt>
              <dd className="is-money">{firstLoad ? '–' : formatCurrency(dashboard?.availableBalance ?? dashboard?.availableCommissions)}</dd>
            </div>
            <div>
              <dt>Total recebido</dt>
              <dd>{firstLoad ? '–' : formatCurrency(dashboard?.totalReceived)}</dd>
            </div>
          </dl>

          <p className="pd-foot">
            Próximo pagamento: {firstLoad ? '–' : (dashboard?.nextPayoutDate ? formatDate(dashboard.nextPayoutDate) : 'após aprovação')}
            <Link to={PATHS.PARTNERS_PAYOUTS} className="pd-foot-link">Ver pagamentos</Link>
          </p>
        </section>

        <div className="pd-grid">
          <PartnerLeaderboard
            leaderboard={leaderboard}
            loading={leaderboardLoading}
            error={leaderboardError}
            onRetry={loadLeaderboard}
          />
          <PartnerEarningsChart
            earnings={earnings}
            loading={earningsLoading}
            error={earningsError}
            range={range}
            onRangeChange={setRange}
          />
        </div>

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
