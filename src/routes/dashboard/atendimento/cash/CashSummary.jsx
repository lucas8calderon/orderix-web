import { Box, Divider, Typography } from '@mui/material';
import { formatCurrency } from '../../../../services/accessControl';
import { cashTime, methodLabel } from './cashView';

function Row({ label, value, strong = false, tone }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.4 }}>
      <Typography sx={{ color: strong ? 'text.primary' : 'text.secondary', fontWeight: strong ? 800 : 400 }}>{label}</Typography>
      <Typography sx={{ fontWeight: strong ? 800 : 600, color: tone }}>{value}</Typography>
    </Box>
  );
}

/** Resumo do caixa: vendas por forma de pagamento e conta do dinheiro na gaveta. */
export function CashSummary({ session }) {
  const summary = session?.summary;
  if (!summary) return null;
  const movements = session.movements || [];
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Vendas no período</Typography>
      {(summary.byMethod || []).length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 0.5 }}>Nenhum pedido fechado ainda.</Typography>
      ) : (
        (summary.byMethod || []).map((item) => (
          <Row
            key={item.method}
            label={`${methodLabel(item.method)} · ${item.orders} ${item.orders === 1 ? 'pedido' : 'pedidos'}`}
            value={formatCurrency(item.amount)}
          />
        ))
      )}
      <Row strong label={`Total vendido · ${summary.ordersCount} ${summary.ordersCount === 1 ? 'pedido' : 'pedidos'}`} value={formatCurrency(summary.salesTotal)} />

      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Dinheiro na gaveta</Typography>
      <Row label="Abertura (troco)" value={formatCurrency(session.openingAmount)} />
      <Row label="Vendas em dinheiro" value={`+ ${formatCurrency(summary.cashSales)}`} />
      <Row label="Suprimentos" value={`+ ${formatCurrency(summary.supplies)}`} />
      <Row label="Sangrias" value={`− ${formatCurrency(summary.withdrawals)}`} />
      <Row strong label="Esperado na gaveta" value={formatCurrency(summary.expectedCash)} />

      {movements.length ? (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>Movimentos</Typography>
          {movements.map((movement) => (
            <Row
              key={movement.id}
              label={`${cashTime(movement.createdAt)} · ${movement.type === 'SUPPLY' ? 'Suprimento' : 'Sangria'}${movement.reason ? ` · ${movement.reason}` : ''}`}
              value={`${movement.type === 'SUPPLY' ? '+' : '−'} ${formatCurrency(movement.amount)}`}
            />
          ))}
        </>
      ) : null}
    </Box>
  );
}
