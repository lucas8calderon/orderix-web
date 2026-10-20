import { Chip } from '@mui/material';
import { STATUS_KINDS } from './partnerConstants';

const TONE_COLORS = {
  success: ['var(--status-success-text)', 'var(--status-success-bg)'],
  warning: ['var(--status-warning-text)', 'var(--status-warning-bg)'],
  danger: ['var(--status-danger-text)', 'var(--status-danger-bg)'],
  info: ['var(--status-info-text)', 'var(--status-info-bg)'],
  neutral: ['var(--status-neutral-text)', 'var(--status-neutral-bg)'],
};

/**
 * Etiqueta de status. `kind`: referral | commission | payout | partner.
 * Valores desconhecidos aparecem como vieram da API, em tom neutro.
 */
export function PartnerStatusChip({ kind, value }) {
  if (!value) return <span aria-label="Sem status">—</span>;
  const meta = STATUS_KINDS[kind]?.[value] || { label: value, tone: 'neutral' };
  const [color, backgroundColor] = TONE_COLORS[meta.tone] || TONE_COLORS.neutral;
  return (
    <Chip
      size="small"
      label={meta.label}
      sx={{ color, backgroundColor, fontWeight: 600, borderRadius: '999px' }}
    />
  );
}

export default PartnerStatusChip;
