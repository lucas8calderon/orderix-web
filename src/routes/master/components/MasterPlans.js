import { PageHeader } from '../../../commons/components/PageHeader';
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { PLANS, formatCurrency } from '../../../services/accessControl';

function PlanCard({ plan, stores }) {
  const planStores = stores.filter((store) => store.plan === plan.id);
  const revenue = planStores.reduce((sum, store) => sum + (Number(store.price) || 0), 0);

  return (
    <Grid item xs={12} sm={6} lg={4}>
      <Paper
        elevation={0}
        sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', height: '100%' }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {plan.label}
        </Typography>
        {plan.volumeLabel ? (
          <Typography variant="body2" color="text.secondary">
            {plan.volumeLabel}
          </Typography>
        ) : null}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {formatCurrency(plan.price)} / mês
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {planStores.length}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          estabelecimentos · {formatCurrency(revenue)} recorrente
        </Typography>
      </Paper>
    </Grid>
  );
}

export function MasterPlans({ stores = [] }) {
  return (
    <Box>
      <PageHeader
        title="Planos"
        description="Planos 1 a 5, conforme o faturamento informado. No site o cliente vê apenas a mensalidade."
      />
      <Grid container spacing={2}>
        {Object.values(PLANS).map((plan) => (
          <PlanCard key={plan.id} plan={plan} stores={stores} />
        ))}
      </Grid>
    </Box>
  );
}

export default MasterPlans;
