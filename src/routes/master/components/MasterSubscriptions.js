import { PageHeader } from '../../../commons/components/PageHeader';
import React from 'react';
import {
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  PLAN_LABELS,
  SUBSCRIPTION_STATUS_LABELS,
  formatDate,
} from '../../../services/accessControl';
import { statusColor } from './MasterOverview';

export function MasterSubscriptions({ stores = [] }) {
  return (
    <Box>
      <PageHeader title="Assinaturas" description="Acompanhe a situação e o vencimento das assinaturas." />
      <Paper
        elevation={0}
        sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' }, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Restaurante</TableCell>
                <TableCell>Plano</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Vencimento</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store.id} hover>
                  <TableCell sx={{ wordBreak: 'break-word' }}>{store.name}</TableCell>
                  <TableCell>{PLAN_LABELS[store.plan] || store.plan || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        SUBSCRIPTION_STATUS_LABELS[store.subscriptionStatus]
                        || store.subscriptionStatus
                        || '—'
                      }
                      color={statusColor(store.subscriptionStatus)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(store.expiresAt)}</TableCell>
                </TableRow>
              ))}
              {stores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    Nenhuma assinatura cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <Stack spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' }, p: 1.5 }}>
          {stores.length === 0 && (
            <Typography align="center" sx={{ py: 4 }} color="text.secondary">
              Nenhuma assinatura cadastrada.
            </Typography>
          )}
          {stores.map((store) => (
            <Paper
              key={store.id}
              elevation={0}
              sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
            >
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                    {store.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={
                      SUBSCRIPTION_STATUS_LABELS[store.subscriptionStatus]
                      || store.subscriptionStatus
                      || '—'
                    }
                    color={statusColor(store.subscriptionStatus)}
                  />
                </Stack>
                <Typography variant="body2">
                  {PLAN_LABELS[store.plan] || store.plan || '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Vencimento: {formatDate(store.expiresAt)}
                </Typography>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

export default MasterSubscriptions;
