import React, { useState } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { CrmFollowUps } from './CrmFollowUps';

export function CrmActionCenter({ metrics, onFilterToday, onFilterOverdue }) {
  const overdue = metrics?.followUpsOverdue ?? 0;
  const today = metrics?.followUpsToday ?? 0;
  const [open, setOpen] = useState(false);
  const hasActions = overdue > 0 || today > 0;

  return (
    <Paper
      elevation={0}
      className="crm-action-center"
      sx={{
        px: 1.75,
        py: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: hasActions ? 'divider' : 'transparent',
        bgcolor: hasActions ? 'background.paper' : 'transparent',
        minHeight: hasActions ? 64 : 0,
      }}
    >
      {!hasActions ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleOutlineIcon fontSize="small" color="success" />
          <Typography variant="body2" color="text.secondary">
            Tudo em dia. Nenhum retorno pendente para hoje.
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Ações necessárias</Typography>
          {overdue > 0 && (
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
              onClick={onFilterOverdue}
            >
              <span aria-hidden="true">🔴 </span>
              {overdue} {overdue === 1 ? 'retorno atrasado' : 'retornos atrasados'}
            </Typography>
          )}
          {today > 0 && (
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer' }}
              onClick={onFilterToday}
            >
              <span aria-hidden="true">🟠 </span>
              {today} {today === 1 ? 'retorno para hoje' : 'retornos para hoje'}
            </Typography>
          )}
          <Button
            size="small"
            onClick={() => setOpen((prev) => !prev)}
            sx={{ textTransform: 'none', alignSelf: 'flex-start', minHeight: 32, px: 0 }}
          >
            {open ? 'Ocultar retornos' : 'Ver retornos'}
          </Button>
          {open && <CrmFollowUps metrics={metrics} compact />}
        </Stack>
      )}
    </Paper>
  );
}
