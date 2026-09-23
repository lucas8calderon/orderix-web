import { PageHeader } from '../../../commons/components/PageHeader';
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { PLAN_LABELS, PLANS, formatCurrency } from '../../../services/accessControl';

export function MasterPlans({ stores = [] }) {
  const planIds = Object.keys(PLANS);

  return (
    <Box>
      <PageHeader title="Planos" description="Consulte a distribuição das lojas e o valor recorrente por plano." />
      <Grid container spacing={2}>
        {planIds.map((planId) => {
          const planStores = stores.filter((store) => store.plan === planId);
          const revenue = planStores.reduce((sum, store) => sum + (Number(store.price) || 0), 0);
          return (
            <Grid item xs={12} sm={4} key={planId}>
              <Paper
                elevation={0}
                sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {PLAN_LABELS[planId] || planId}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {formatCurrency(PLANS[planId].price)} / mês
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {planStores.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  restaurantes · {formatCurrency(revenue)} recorrente
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default MasterPlans;
