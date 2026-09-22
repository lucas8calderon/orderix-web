import React from 'react';
import { Stack, Typography } from '@mui/material';
import { followUpIndicator } from '../crmConstants';

const TONE_SX = {
  overdue: { color: 'error.main', marker: '🔴' },
  today: { color: 'warning.main', marker: '🟠' },
  upcoming: { color: 'info.main', marker: '🔵' },
  missing: { color: 'text.secondary', marker: '⚪' },
  none: { color: 'text.secondary', marker: '' },
};

export function CrmFollowUpIndicator({ lead, compact = false }) {
  const indicator = followUpIndicator(lead);
  if (!indicator.label) return null;
  const tone = TONE_SX[indicator.tone] || TONE_SX.missing;
  return (
    <Stack direction="row" spacing={0.75} alignItems="flex-start" className={`crm-followup is-${indicator.tone}`}>
      <Typography component="span" aria-hidden="true" sx={{ lineHeight: 1.4 }}>
        {tone.marker}
      </Typography>
      <Typography
        variant={compact ? 'caption' : 'body2'}
        sx={{ color: tone.color, fontWeight: indicator.tone === 'overdue' || indicator.tone === 'today' ? 700 : 500 }}
      >
        {indicator.label}
      </Typography>
    </Stack>
  );
}
