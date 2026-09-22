import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Button } from '@mui/material';
import { formatCurrency } from '../../../services/accessControl';
import { openWhatsApp } from '../../home/landingAssets';
import { DEMO_EVENTS, trackDemoEvent } from '../demoAnalytics';

export default function DemoSuccess({ order, onContinue, onCta }) {
  const handleCta = () => {
    trackDemoEvent(DEMO_EVENTS.CTA_CLICKED, { slug: order.slug, cta: 'whatsapp' });
    openWhatsApp('Olá! Quero a Weper no meu negócio.');
    if (onCta) onCta();
  };

  return (
    <section className="demo-success" aria-live="polite">
      <CheckCircleRoundedIcon className="demo-success__icon" />
      <p className="demo-success__eyebrow">Pedido simulado</p>
      <h2>{`Pedido ${order.displayId}`}</h2>
      <p className="demo-success__copy">
        {order.storeName} recebeu o pedido de demonstração.
        {' '}
        Total {formatCurrency(order.totals.total)}.
      </p>
      <ol className="demo-success__steps">
        {order.steps.map((step) => (
          <li key={step.id} className={step.done ? 'is-done' : ''}>
            <span />
            {step.label}
          </li>
        ))}
      </ol>
      <div className="demo-success__actions">
        <Button variant="contained" onClick={handleCta}>
          Quero a Weper no meu negócio
        </Button>
        <Button variant="outlined" onClick={onContinue}>
          Continuar explorando
        </Button>
      </div>
    </section>
  );
}
