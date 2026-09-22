import React from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { followUpDelayLabel } from '../crmConstants';
import { openWhatsApp } from '../whatsappTemplate';

function FollowUpList({ title, leads, emptyLabel }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', flex: 1 }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1.25}>
        {(leads || []).length === 0 && (
          <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>
        )}
        {(leads || []).map((lead) => (
          <Stack
            key={lead.id}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            sx={{ py: 0.5 }}
          >
            <div>
              <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{lead.businessName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {followUpDelayLabel(lead) || 'Retorno: Hoje'}
              </Typography>
            </div>
            <Button
              size="small"
              disabled={!lead.phone}
              onClick={() => openWhatsApp(lead.whatsAppUrl || lead.phone)}
              sx={{ textTransform: 'none', minHeight: 36 }}
            >
              WhatsApp
            </Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

export function CrmFollowUps({ metrics, compact = false }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      sx={{ mb: compact ? 0 : 2 }}
    >
      <FollowUpList
        title="Retornos de hoje"
        leads={metrics?.followUpsTodayLeads}
        emptyLabel="Nenhum retorno para hoje."
      />
      <FollowUpList
        title="Retornos atrasados"
        leads={metrics?.followUpsOverdueLeads}
        emptyLabel="Nenhum follow-up atrasado."
      />
    </Stack>
  );
}
