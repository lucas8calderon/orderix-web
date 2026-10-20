import React, { useState } from 'react';
import { Box, Collapse, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { formatPercent } from '../crmConstants';

const PRIMARY = [
  { key: 'totalLeads', label: 'Leads' },
  { key: 'noFirstContact', label: 'Sem 1º contato', tone: 'warn' },
  { key: 'followUpsToday', label: 'Hoje' },
  { key: 'followUpsOverdue', label: 'Atrasados', tone: 'overdue' },
  { key: 'dueIn24h', label: '24h' },
  { key: 'won', label: 'Ganhos', tone: 'success' },
];

const SECONDARY = [
  { key: 'contactsMade', label: 'Contatos' },
  { key: 'withResponse', label: 'Com resposta' },
  { key: 'waitingResponse', label: 'Aguardando' },
  { key: 'interested', label: 'Interessados' },
  { key: 'demos', label: 'Demos' },
  { key: 'proposals', label: 'Propostas' },
  { key: 'dueSoon', label: 'Vencem em 4h', tone: 'warn' },
  { key: 'lost', label: 'Perdidos' },
];

function MetricValue({ label, value, tone }) {
  const color = tone === 'overdue'
    ? 'error.main'
    : tone === 'success'
      ? 'success.main'
      : tone === 'warn'
        ? 'warning.main'
        : 'text.primary';
  return (
    <Box sx={{ minWidth: 72 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.2 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color, letterSpacing: '-0.03em' }}>
        {value ?? 0}
      </Typography>
    </Box>
  );
}

export function CrmMetrics({ metrics }) {
  const data = metrics || {};
  const [open, setOpen] = useState(false);

  return (
    <Paper
      elevation={0}
      className="crm-metrics"
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.25,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1.5, md: 3 }}
        alignItems="center"
        sx={{ overflowX: 'auto' }}
      >
        {PRIMARY.map((item) => (
          <MetricValue key={item.key} label={item.label} value={data[item.key]} tone={item.tone} />
        ))}
        <Box sx={{ minWidth: 88, pr: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Conversão
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            {formatPercent(data.conversionRate)}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 88, pr: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Resposta
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
            {formatPercent(data.responseRate)}
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={open ? 'Ocultar indicadores' : 'Mais indicadores'}>
          <IconButton size="small" onClick={() => setOpen((prev) => !prev)} aria-label="Mais indicadores">
            <ExpandMoreIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </IconButton>
        </Tooltip>
      </Stack>
      <Collapse in={open}>
        <Stack
          direction="row"
          spacing={{ xs: 1.5, md: 3 }}
          sx={{ mt: 1.25, pt: 1.25, borderTop: '1px solid', borderColor: 'divider', overflowX: 'auto' }}
        >
          {SECONDARY.map((item) => (
            <MetricValue key={item.key} label={item.label} value={data[item.key]} tone={item.tone} />
          ))}
          <Box sx={{ minWidth: 88 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Tentativas (média)
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
              {Number(data.avgContactAttempts || 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 1,
              })}
            </Typography>
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
}
