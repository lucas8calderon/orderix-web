import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../config/pricingTiers';
import { PATHS } from '../../services/accessControl';
import { trackGenerateLead } from '../../analytics/analyticsService';
import {
  attemptKey,
  captureSubscriptionLead,
  leadIsReady,
  maskWhatsApp,
  validateName,
  validateWhatsApp,
} from '../../services/subscriptionLead';
import './SubscriptionCaptureModal.css';

export default function SubscriptionCaptureModal({ plan, open, onClose, onReady }) {
  const titleId = useId();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [touched, setTouched] = useState(false);
  const ready = Boolean(plan) && leadIsReady(name, whatsapp);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 30);
    const onKey = (event) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, pending]);

  if (!open || !plan) return null;

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setTouched(true);
    setError('');
    if (!ready) return;
    setPending(true);
    try {
      const lead = await captureSubscriptionLead({
        name,
        whatsapp,
        planCode: plan.code,
        marketingOptIn,
        source: 'homepage_modal',
        idempotencyKey: attemptKey(`home:${plan.code}`),
      });
      if (lead.created) trackGenerateLead('subscription_modal', plan.code);
      onReady(lead);
    } catch (requestError) {
      const message = requestError?.response?.data?.message
        || 'Não foi possível registrar seus dados. Eles continuam nesta tela.';
      setError(message);
    } finally {
      setPending(false);
    }
  }

  const nameError = touched ? validateName(name) : '';
  const phoneError = touched ? validateWhatsApp(whatsapp) : '';

  return (
    <div
      className="lead-modal__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
    >
      <div
        className="lead-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button className="lead-modal__close" type="button" aria-label="Fechar" onClick={onClose} disabled={pending}>
          ×
        </button>
        <h2 id={titleId}>Você está a um passo de começar!</h2>
        <p className="lead-modal__subtitle">Preencha seus dados para continuar com a assinatura da Weper.</p>
        <div className="lead-modal__plan">
          <div>
            <strong>{plan.label}</strong>
            <span>Faturamento mensal desta faixa</span>
          </div>
          <div className="lead-modal__price">
            {formatPrice(plan.monthlyPrice)}
            <small> /mês</small>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="lead-modal__field">
            <label htmlFor="lead-name">Nome</label>
            <input
              id="lead-name"
              ref={nameRef}
              value={name}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
              onBlur={() => setTouched(true)}
            />
            {nameError ? <span className="lead-modal__error">{nameError}</span> : null}
          </div>
          <div className="lead-modal__field">
            <label htmlFor="lead-whatsapp">WhatsApp</label>
            <input
              id="lead-whatsapp"
              value={whatsapp}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              onChange={(event) => setWhatsapp(maskWhatsApp(event.target.value))}
              onBlur={() => setTouched(true)}
            />
            {phoneError ? <span className="lead-modal__error">{phoneError}</span> : null}
          </div>
          <label className="lead-modal__check">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(event) => setMarketingOptIn(event.target.checked)}
            />
            <span>Autorizo contatos promocionais da Weper. A contratação não depende desta autorização.</span>
          </label>
          <p className="lead-modal__privacy">
            <Link to={PATHS.PRIVACY} target="_blank" rel="noreferrer">Política de Privacidade</Link>
          </p>
          {error ? <p className="lead-modal__error" role="alert">{error}</p> : null}
          <button className="lead-modal__submit" type="submit" disabled={!ready || pending}>
            {pending ? 'Registrando…' : 'Continuar para pagamento'}
          </button>
        </form>
      </div>
    </div>
  );
}
