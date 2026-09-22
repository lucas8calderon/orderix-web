import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { formatDateTime, statusLabel } from '../crmConstants';

const TYPE_TITLE = {
  CREATED: 'Lead cadastrado',
  UPDATED: 'Lead atualizado',
  STATUS_CHANGED: 'Status alterado',
  CONTACT_REGISTERED: 'Contato realizado',
  ARCHIVED: 'Lead arquivado',
  RESTORED: 'Lead restaurado',
  NOTE: 'Observação',
  MESSAGE: 'Mensagem',
  AUTOMATION: 'Automação',
};

export function CrmActivityTimeline({ activities, loading }) {
  if (loading) {
    return <Typography variant="body2" color="text.secondary">Carregando histórico...</Typography>;
  }
  if (!activities || activities.length === 0) {
    return <Typography variant="body2" color="text.secondary">Nenhum evento registrado.</Typography>;
  }

  return (
    <Stack className="crm-timeline" spacing={0}>
      {activities.map((activity, index) => (
        <Box key={activity.id} className="crm-timeline-item" sx={{ display: 'flex', gap: 1.5, pb: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                mt: 0.5,
                flexShrink: 0,
              }}
            />
            {index < activities.length - 1 && (
              <Box sx={{ width: '2px', flex: 1, bgcolor: 'divider', mt: 0.5 }} />
            )}
          </Box>
          <Box sx={{ pb: 0.5, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(activity.createdAt)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {TYPE_TITLE[activity.type] || activity.description}
            </Typography>
            {activity.type === 'STATUS_CHANGED' && (activity.previousStatus || activity.newStatus) ? (
              <Typography variant="body2" color="text.secondary">
                {statusLabel(activity.previousStatus)} → {statusLabel(activity.newStatus)}
              </Typography>
            ) : activity.type === 'CONTACT_REGISTERED' && activity.contactType ? (
              <Typography variant="body2" color="text.secondary">
                {activity.contactType}
                {activity.description && activity.description.includes('—')
                  ? ` · ${activity.description.split('—').slice(1).join('—').trim()}`
                  : ''}
              </Typography>
            ) : activity.type !== 'CREATED' ? (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {activity.description}
              </Typography>
            ) : null}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
