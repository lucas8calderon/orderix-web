import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Lock, MessageCircle, User } from 'lucide-react';
import { formatPrice, PRICING_TIERS } from '../../config/pricingTiers';
import { PATHS } from '../../services/accessControl';
import { trackGenerateLead, trackPlanSelected } from '../../analytics/analyticsService';
import { WeperMark } from '../home/components/WeperMark';
import {
  attemptKey,
  captureSubscriptionLead,
  leadIsReady,
  maskWhatsApp,
  validateName,
  validateWhatsApp,
} from '../../services/subscriptionLead';
import './SubscriptionCaptureModal.css';

function bandLabel(tier) {
  return tier.label.replace(' até ', ' a ');
}

function StoreArt() {
  return (
    <svg className="lead-modal__art" viewBox="0 0 168 132" aria-hidden="true">
      <path d="M128 18l4 8 8 2-8 3-2 8-3-8-8-2 8-3 1-8z" fill="#93C5FD" />
      <path d="M146 36l2 5 5 1-5 2-1 5-2-5-5-1 5-2 1-5z" fill="#BFDBFE" />
      <rect x="28" y="46" width="104" height="72" rx="16" fill="#DBEAFE" />
      <path d="M24 58c8-16 16-16 24 0 8-16 16-16 24 0 8-16 16-16 24 0 8-16 16-16 24 0 8-16 16-16 24 0v10H24V58z" fill="#2563EB" />
      <path d="M36 58c6-10 12-10 18 0 6-10 12-10 18 0 6-10 12-10 18 0 6-10 12-10 18 0 6-10 12-10 18 0v6H36V58z" fill="#60A5FA" />
      <rect x="46" y="78" width="28" height="22" rx="4" fill="#EFF6FF" />
      <rect x="82" y="78" width="28" height="22" rx="4" fill="#EFF6FF" />
      <rect x="68" y="96" width="22" height="22" rx="4" fill="#1D4ED8" />
      <circle cx="118" cy="34" r="16" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="3" />
      <path d="M118 24c-2 4-2 6 0 10 3 0 6-2 7-5-3 0-5-2-7-5z" fill="#2563EB" />
      <circle cx="132" cy="96" r="16" fill="#2563EB" />
      <path d="M124 96l5 5 11-12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SubscriptionCaptureModal({ plan, open, onClose, onReady, onPlanChange }) {
  const titleId = useId();
  const nameRef = useRef(null);
  const [selectedCode, setSelectedCode] = useState(plan?.code);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [touched, setTouched] = useState(false);
  const selected = PRICING_TIERS.find((item) => item.code === selectedCode) || plan;
  const ready = Boolean(selected) && leadIsReady(name, whatsapp);

  useEffect(() => {
    if (open && plan?.code) setSelectedCode(plan.code);
  }, [open, plan?.code]);

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

  if (!open || !selected) return null;

  function choose(next) {
    if (pending || next.code === selected.code) return;
    setSelectedCode(next.code);
    trackPlanSelected(next.code, 'subscription_modal');
    onPlanChange?.(next);
  }

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
        planCode: selected.code,
        marketingOptIn: false,
        source: 'homepage_modal',
        idempotencyKey: attemptKey(`home:${selected.code}`),
      });
      if (lead.created) trackGenerateLead('subscription_modal', selected.code);
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
        <div className="lead-modal__brand">
          <WeperMark size={28} />
        </div>
        <button className="lead-modal__close" type="button" aria-label="Fechar" onClick={onClose} disabled={pending}>
          ×
        </button>
        <div className="lead-modal__hero">
          <div>
            <h2 id={titleId}>
              Você está a um <span className="lead-modal__mark">passo</span> de começar!
            </h2>
            <p className="lead-modal__subtitle">Preencha seus dados para continuar com a assinatura da Weper.</p>
          </div>
          <StoreArt />
        </div>
        <div className="lead-modal__field lead-modal__select">
          <label htmlFor="lead-plan">Quanto sua loja fatura por mês?</label>
          <div className="lead-modal__control">
            <select
              id="lead-plan"
              value={selected.code}
              disabled={pending}
              onChange={(event) => {
                const next = PRICING_TIERS.find((item) => item.code === event.target.value);
                if (next) choose(next);
              }}
            >
              {PRICING_TIERS.map((item) => (
                <option key={item.code} value={item.code}>{bandLabel(item)}</option>
              ))}
            </select>
            <ChevronDown size={18} aria-hidden="true" />
          </div>
        </div>
        <div className="lead-modal__plan">
          <span className="lead-modal__badge">Plano {selected.number}</span>
          <div className="lead-modal__plan-copy">
            <strong>{bandLabel(selected)}</strong>
            <span>Faturamento mensal desta faixa</span>
          </div>
          <div className="lead-modal__price">
            {formatPrice(selected.monthlyPrice)}
            <small> /mês</small>
          </div>
        </div>
        <form onSubmit={submit}>
          <div className="lead-modal__field">
            <label htmlFor="lead-name">Nome completo</label>
            <div className={`lead-modal__control${nameError ? ' is-invalid' : ''}`}>
              <User size={18} aria-hidden="true" />
              <input
                id="lead-name"
                ref={nameRef}
                type="text"
                value={name}
                autoComplete="name"
                placeholder="Digite seu nome"
                aria-invalid={nameError ? 'true' : 'false'}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => setTouched(true)}
              />
            </div>
            {nameError ? <span className="lead-modal__error">{nameError}</span> : null}
          </div>
          <div className="lead-modal__field">
            <label htmlFor="lead-whatsapp">WhatsApp</label>
            <div className={`lead-modal__control${phoneError ? ' is-invalid' : ''}`}>
              <MessageCircle size={18} aria-hidden="true" />
              <input
                id="lead-whatsapp"
                type="tel"
                value={whatsapp}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                aria-invalid={phoneError ? 'true' : 'false'}
                onChange={(event) => setWhatsapp(maskWhatsApp(event.target.value))}
                onBlur={() => setTouched(true)}
              />
            </div>
            {phoneError ? <span className="lead-modal__error">{phoneError}</span> : null}
          </div>
          {error ? <p className="lead-modal__error" role="alert">{error}</p> : null}
          <button className="lead-modal__submit" type="submit" disabled={!ready || pending}>
            {pending ? 'Registrando…' : 'Continuar'}
          </button>
          <p className="lead-modal__privacy">
            <span><Lock size={14} aria-hidden="true" /> Seus dados estão protegidos.</span>
            <Link to={PATHS.PRIVACY} target="_blank" rel="noreferrer">Política de Privacidade</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
