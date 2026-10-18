import { PageHeader } from '../../../commons/components/PageHeader';
import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { LEGACY_PLANS, PLANS, formatCurrency } from '../../../services/accessControl';

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
  const commercialPlans = Object.values(PLANS);
  const legacyPlans = Object.values(LEGACY_PLANS).filter((plan) =>
    stores.some((store) => store.plan === plan.id)
  );

  return (
    <Box>
      <PageHeader
        title="Planos"
        description="Faixas internas conforme o faturamento informado. No site o cliente vê apenas a mensalidade."
      />
      <Grid container spacing={2}>
        {commercialPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} stores={stores} />
        ))}
      </Grid>

      {legacyPlans.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Planos anteriores
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Estabelecimentos ainda em Básico, Profissional ou Premium. Ao editar, escolha a faixa I a V do faturamento informado.
          </Typography>
          <Grid container spacing={2}>
            {legacyPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} stores={stores} />
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

export default MasterPlans;
