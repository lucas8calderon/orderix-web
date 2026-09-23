import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { PATHS } from '../../../services/accessControl';
import { openWhatsApp } from '../../home/landingAssets';
import DeliveryTrackingView from '../../public-delivery/DeliveryTrackingView';
import '../../public-delivery/PublicDelivery.css';
import { DEMO_EVENTS, trackDemoEvent } from '../demoAnalytics';
import { DEMO_STORES_SECTION_ID } from '../demoStores';

export default function DemoSuccess({ order, onContinue, onCta }) {
  const otherStoresPath = `${PATHS.DEMO}#${DEMO_STORES_SECTION_ID}`;

  const handleCta = () => {
    trackDemoEvent(DEMO_EVENTS.CTA_CLICKED, { slug: order.slug, cta: 'whatsapp' });
    openWhatsApp('Olá! Quero a Weper no meu negócio.');
    if (onCta) onCta();
  };

  const handleOtherStoresClick = () => {
    trackDemoEvent(DEMO_EVENTS.CTA_CLICKED, { slug: order.slug, cta: 'other_demo_stores' });
  };

  return (
    <section className="demo-success demo-success--tracking" aria-live="polite">
      <div className="delivery-page delivery-tracking-page demo-tracking-page">
        <div className="delivery-tracking-container demo-tracking-container">
          <DeliveryTrackingView
            order={order}
            subtitle="Pedido simulado · demonstração"
            lastUpdatedLabel="Demonstração"
            onGoHome={onContinue}
            homeButtonLabel="Voltar ao início"
            banner={(
              <p className="demo-tracking-badge" role="status">
                Demonstração — nenhum pedido real foi enviado
              </p>
            )}
            actions={(
              <div className="demo-tracking-actions">
                <Button variant="contained" fullWidth onClick={handleCta}>
                  Quero a Weper no meu negócio
                </Button>
                <Button variant="outlined" fullWidth onClick={onContinue}>
                  Continuar explorando
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to={otherStoresPath}
                  onClick={handleOtherStoresClick}
                >
                  Outras lojas de demonstração
                </Button>
              </div>
            )}
            onHelpClick={handleCta}
            helpTitle="Quer isso no seu negócio?"
            helpDescription="Fale com a Weper no WhatsApp e tire suas dúvidas."
            helpAriaLabel="Falar com a Weper no WhatsApp"
            footer={(
              <Link to={PATHS.HOME}>Cardápio digital por Weper</Link>
            )}
          />
        </div>
      </div>
    </section>
  );
}
