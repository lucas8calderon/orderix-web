import React, { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { followUpIndicator } from '../crmConstants';

const TONE_SX = {
  overdue: { color: 'error.main', marker: '🔴' },
  dueSoon: { color: 'warning.main', marker: '🟠' },
  today: { color: 'warning.main', marker: '🟠' },
  onTime: { color: 'success.main', marker: '🟢' },
  upcoming: { color: 'info.main', marker: '🔵' },
  missing: { color: 'text.secondary', marker: '⚪' },
  none: { color: 'text.secondary', marker: '' },
};

/** Atualiza o countdown a cada minuto (sem poll de API). */
export function CrmFollowUpIndicator({ lead, compact = false }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const indicator = followUpIndicator(lead, now);
  if (!indicator.label) return null;
  const tone = TONE_SX[indicator.tone] || TONE_SX.missing;
  const emphasize = indicator.tone === 'overdue' || indicator.tone === 'dueSoon' || indicator.tone === 'today';

  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start" className={`crm-followup is-${indicator.tone}`}>
      <Typography component="span" aria-hidden="true" sx={{ lineHeight: 1.4 }}>
        {tone.marker}
      </Typography>
      <Typography
        variant={compact ? 'caption' : 'body2'}
        sx={{ color: tone.color, fontWeight: emphasize ? 700 : 500 }}
      >
        {indicator.label}
      </Typography>
    </Stack>
  );
}
