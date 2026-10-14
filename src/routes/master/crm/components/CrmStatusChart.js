import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { statusChartRows } from '../crmStatusChart';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <Paper elevation={2} sx={{ px: 1.25, py: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.name}</Typography>
      <Typography variant="caption" color="text.secondary">
        {row.value} {row.value === 1 ? 'prospecção' : 'prospecções'} · {row.share}%
      </Typography>
    </Paper>
  );
}

export function CrmStatusChart({ metrics }) {
  const rows = statusChartRows(metrics);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Prospecções por status
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Distribuição de todas as prospecções ativas
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {total} {total === 1 ? 'lead' : 'leads'}
        </Typography>
      </Stack>
      {total === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Nenhuma prospecção para exibir.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: { xs: 320, md: 380 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={rows}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={148}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                {rows.map((row) => (
                  <Cell key={row.id} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
