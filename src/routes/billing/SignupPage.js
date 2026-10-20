import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Check,
  ClipboardList,
  CreditCard,
  Gauge,
  Info,
  LayoutDashboard,
  Lock,
  Percent,
  ShieldCheck,
  Smartphone,
  Store,
  TabletSmartphone,
  UtensilsCrossed,
  WalletCards,
  X,
} from 'lucide-react';
import { formatPrice, getPlanTier, getSignupPlanOptions, TEST_PLAN } from '../../config/pricingTiers';
import { capturePartnerRef, getStoredPartnerRef } from '../../services/partnerReferral';
import { PATHS } from '../../services/accessControl';
import WeperMark from '../home/components/WeperMark';
import ecosystemDevicesWebp from '../../assets/images/landing/ecosystem-devices.webp';
import ecosystemDevicesJpg from '../../assets/images/landing/ecosystem-devices.jpg';
import '../home/styles/Rebrand.css';
import './SignupPage.css';

export const SIGNUP_PIX_POLL_MS = 5000;
const SIGNUP_RESULT_STORAGE_KEY = 'weper.signupResult';

function isStagingHost() {
  if (typeof window === 'undefined') return false;
  return String(window.location.hostname || '').toLowerCase().includes('staging');
}

/** Só fatura pública Asaas (/i/…). Evita cair no login do portal Asaas. */
export function isPublicAsaasInvoiceUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (!host.endsWith('asaas.com')) return false;
    return parsed.pathname.includes('/i/');
  } catch {
    return false;
  }
}

function readStoredSignupResult() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(SIGNUP_RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.signupId) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSignupResult(value) {
  if (typeof window === 'undefined') return;
  try {
    if (!value) {
      window.sessionStorage.removeItem(SIGNUP_RESULT_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(SIGNUP_RESULT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sessionStorage indisponível: segue só em memória.
  }
}

const EMPTY = {
  person: 'FISICA',
  name: '',
  document: '',
  email: '',
  phone: '',
  postalCode: '',
  addressNumber: '',
  holderName: '',
  number: '',
  expiryMonth: '',
  expiryYear: '',
  ccv: '',
};

const FEATURES = [
  {
    title: 'Delivery próprio',
    description: 'Receba pedidos diretamente dos seus clientes, sem comissões por venda cobradas pela Weper.',
    Icon: Bike,
  },
  {
    title: 'Cardápio Digital',
    description: 'Apresente seus produtos com a identidade da sua marca.',
    Icon: TabletSmartphone,
  },
  {
    title: 'Autoatendimento',
    description: 'Ofereça mais autonomia e praticidade aos seus clientes.',
    Icon: Smartphone,
  },
  {
    title: 'Mesas e Comandas',
    description: 'Organize os atendimentos e tenha mais controle da operação.',
    Icon: UtensilsCrossed,
  },
  {
    title: 'Aplicativo de Garçom',
    description: 'Agilize o lançamento e o acompanhamento dos pedidos.',
    Icon: ClipboardList,
  },
  {
    title: 'Painel de Cozinha (KDS)',
    description: 'Acompanhe cada pedido em tempo real.',
    Icon: LayoutDashboard,
  },
  {
    title: 'Controle de Estoque',
    description: 'Monitore seus produtos e reduza desperdícios.',
    Icon: Store,
  },
  {
    title: 'Relatórios e Dashboard',
    description: 'Acompanhe vendas, faturamento e desempenho.',
    Icon: Gauge,
  },
  {
    title: 'Integrações de Pagamento',
    description: 'Conecte soluções de pagamento compatíveis com sua operação.',
    Icon: WalletCards,
  },
];

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function maskCpf(value) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCnpj(value) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

function maskCep(value) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

function maskCardNumber(value) {
  const digits = onlyDigits(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function CheckoutSteps({ phase }) {
  const steps = [
    { id: 'dados', label: 'Seus dados' },
    { id: 'pagamento', label: 'Pagamento' },
    { id: 'confirmacao', label: 'Confirmação' },
  ];
  const activeIndex = phase === 'result' ? 2 : 0;

  return (
    <div className="ct-steps" aria-label="Etapas da contratação">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        return (
          <div key={step.id} style={{ display: 'contents' }}>
            {index > 0 ? (
              <span className={`ct-step-line${isDone || isActive ? ' is-done' : ''}`} aria-hidden="true" />
            ) : null}
            <div className={`ct-step${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}>
              <span className="ct-step-index">{index + 1}</span>
              <span className="ct-step-label">{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SignupPage() {
  const [params] = useSearchParams();
  useEffect(() => {
    capturePartnerRef(params.toString() ? `?${params.toString()}` : window.location.search);
  }, [params]);

  const requestedPlan = params.get('plan');
  const testPlanRequested = requestedPlan === TEST_PLAN.code;
  const includeTestPlan = testPlanRequested || isStagingHost();

  const signupPlans = useMemo(
    () => getSignupPlanOptions({ includeTest: includeTestPlan }),
    [includeTestPlan],
  );

  const initialPlan = useMemo(() => {
    if (!requestedPlan) return '';
    return getPlanTier(requestedPlan) && (requestedPlan !== TEST_PLAN.code || includeTestPlan)
      ? requestedPlan
      : '';
  }, [requestedPlan, includeTestPlan]);

  const [planCode, setPlanCode] = useState(initialPlan);
  const [billingType, setBillingType] = useState('PIX');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(() => readStoredSignupResult());
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(() => Boolean(readStoredSignupResult()?.paid));
  const pollRef = useRef(null);

  const plan = getPlanTier(planCode);
  const planSelected = Boolean(plan) && signupPlans.some((tier) => tier.code === planCode);
  const isTestPlan = plan?.code === TEST_PLAN.code;
  const card = billingType === 'CREDIT_CARD';
  const isPj = form.person === 'JURIDICA';
  const showPublicInvoice = Boolean(result?.invoiceUrl)
    && !result?.pixPayload
    && isPublicAsaasInvoiceUrl(result.invoiceUrl);

  useEffect(() => {
    persistSignupResult(result ? { ...result, paid: paymentConfirmed } : null);
  }, [result, paymentConfirmed]);

  useEffect(() => {
    if (!result?.signupId || paymentConfirmed) return undefined;

    let cancelled = false;

    async function pollStatus() {
      try {
        const response = await axios.get(`/api/public/billing/signup/${result.signupId}/status`);
        if (cancelled) return;
        if (response.data?.paid) {
          setPaymentConfirmed(true);
          setResult((current) => (current ? { ...current, storeActive: Boolean(response.data.storeActive) } : current));
        }
      } catch {
        // Mantém a tela de Pix; webhook/reconciliação continua no servidor.
      }
    }

    pollStatus();
    pollRef.current = window.setInterval(pollStatus, SIGNUP_PIX_POLL_MS);
    return () => {
      cancelled = true;
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [result?.signupId, paymentConfirmed]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateDocument(value) {
    update('document', isPj ? maskCnpj(value) : maskCpf(value));
  }

  function selectPlan(code) {
    setPlanCode(code);
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setError('');
    if (!planSelected) {
      setError('Selecione a faixa de faturamento para continuar.');
      return;
    }
    if (card && (!form.phone.trim() || !form.postalCode.trim() || !form.addressNumber.trim())) {
      setError('No cartão, informe telefone, CEP e número do responsável financeiro.');
      return;
    }
    if (card && (!form.number.trim() || !form.ccv.trim() || !form.expiryMonth.trim() || !form.expiryYear.trim())) {
      setError('Informe os dados do cartão para repasse. Eles não ficam salvos nesta tela.');
      return;
    }
    const partnerReferralCode = getStoredPartnerRef() || undefined;
    const payload = {
      planCode,
      billingType,
      name: form.name.trim(),
      document: form.document.trim(),
      email: form.email.trim(),
      phone: card ? form.phone.trim() : undefined,
      postalCode: card ? form.postalCode.trim() : undefined,
      addressNumber: card ? form.addressNumber.trim() : undefined,
      partnerReferralCode,
      card: card
        ? {
            holderName: form.holderName.trim() || form.name.trim(),
            number: onlyDigits(form.number),
            expiryMonth: form.expiryMonth.trim(),
            expiryYear: form.expiryYear.trim(),
            ccv: form.ccv.trim(),
            email: form.email.trim(),
            cpfCnpj: form.document.trim(),
            postalCode: form.postalCode.trim(),
            addressNumber: form.addressNumber.trim(),
            phone: form.phone.trim(),
          }
        : undefined,
    };
    setPending(true);
    try {
      const response = await axios.post('/api/public/billing/signup', payload);
      setPaymentConfirmed(false);
      setResult(response.data);
      setForm((current) => ({ ...current, number: '', ccv: '' }));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Não foi possível iniciar a contratação.';
      setError(message);
    } finally {
      setPending(false);
    }
  }

  async function copyPix() {
    if (!result?.pixPayload) return;
    try {
      await navigator.clipboard.writeText(result.pixPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="wp-site ct-page">
      <header className="ct-header">
        <div className="ct-header-inner">
          <Link to="/" className="ct-brand" aria-label="Weper — voltar ao site">
            <WeperMark size={34} showWordmark={false} />
            <span className="ct-brand-copy">
              <strong>Weper</strong>
              <span>Do pedido ao resultado</span>
            </span>
          </Link>
          <div className="ct-header-actions">
            <div className="ct-secure-pill">
              <Lock size={16} aria-hidden="true" />
              <span>
                Ambiente seguro
                <small>Seus dados protegidos</small>
              </span>
            </div>
            <Link to="/" className="ct-back-link">
              <ArrowLeft size={16} aria-hidden="true" />
              Voltar para o site
            </Link>
          </div>
        </div>
      </header>

      <div className="ct-shell">
        <div className="ct-layout">
          <section className="ct-intro" aria-labelledby="ct-hero-title">
            <span className="ct-badge">SUA OPERAÇÃO SEM LIMITES</span>
            <h1 id="ct-hero-title">
              Todas as ferramentas para o seu estabelecimento,{' '}
              <em>SEM COMISSÕES POR VENDA.</em>
            </h1>
            <p className="ct-lead">
              Com a Weper, você tem uma plataforma completa para vender mais, organizar sua operação e fortalecer sua própria marca.
              Diferentemente de marketplaces como iFood, Keeta e 99Food, a Weper não cobra comissões por pedido.
            </p>

            <aside className="ct-diff-card">
              <div className="ct-diff-icon" aria-hidden="true">
                <Percent size={22} />
              </div>
              <div>
                <h2>Seu negócio vende. O resultado fica com você!</h2>
                <ul>
                  <li><Check size={16} aria-hidden="true" /> 0% de comissão cobrada pela Weper.</li>
                  <li><Check size={16} aria-hidden="true" /> Sem taxas por pedido cobradas pela Weper.</li>
                  <li><Check size={16} aria-hidden="true" /> Sem percentual sobre o faturamento.</li>
                  <li><Check size={16} aria-hidden="true" /> Mais autonomia para o estabelecimento.</li>
                  <li><Check size={16} aria-hidden="true" /> Mensalidade transparente.</li>
                </ul>
              </div>
            </aside>

            <div className="ct-mini-benefits" aria-label="Benefícios resumidos">
              <article className="ct-mini-benefit">
                <strong>Sem comissões por venda</strong>
                <span>Mais previsibilidade para o seu negócio.</span>
              </article>
              <article className="ct-mini-benefit">
                <strong>Tudo em um só lugar</strong>
                <span>Ferramentas integradas para sua operação.</span>
              </article>
              <article className="ct-mini-benefit">
                <strong>Suporte especializado</strong>
                <span>Estamos aqui para ajudar você a começar.</span>
              </article>
            </div>
          </section>

          <section className="ct-checkout" aria-labelledby="ct-checkout-title">
            <div className="ct-card">
              <CheckoutSteps phase={result ? 'result' : 'form'} />

              {result ? (
                <div className="ct-result">
                  <h2 id="ct-checkout-title">
                    {paymentConfirmed ? 'Pagamento confirmado' : 'Pague com Pix para ativar'}
                  </h2>
                  {paymentConfirmed ? (
                    <>
                      <p>
                        Recebemos a confirmação. O convite com a senha chega no e-mail informado.
                        Só então use o login da Weper — não é preciso entrar agora.
                      </p>
                      <p className="ct-status" data-testid="signup-paid">
                        {result.storeActive
                          ? 'Loja liberada. Verifique seu e-mail para o convite.'
                          : 'Pagamento ok. Aguardamos o e-mail de convite para o primeiro acesso.'}
                      </p>
                      <p>
                        <Link className="ct-invoice-link" to={PATHS.LOGIN}>
                          Já recebi o convite — ir ao login
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Escaneie o QR ou copie o código no app do banco. Fique nesta página até a confirmação.
                        O convite e o login só ficam disponíveis depois do pagamento.
                      </p>
                      {result.pixPayload ? (
                        <div className="ct-pix-box">
                          <QRCodeSVG value={result.pixPayload} size={180} level="M" includeMargin />
                          <p className="ct-pix-code" data-testid="pix-payload">{result.pixPayload}</p>
                          <button type="button" className="ct-copy-btn" onClick={copyPix}>
                            {copied ? 'Código copiado' : 'Copiar código Pix'}
                          </button>
                        </div>
                      ) : null}
                      {showPublicInvoice ? (
                        <p>
                          <a className="ct-invoice-link" href={result.invoiceUrl} target="_blank" rel="noreferrer">
                            Abrir fatura pública
                            <ArrowRight size={16} aria-hidden="true" />
                          </a>
                        </p>
                      ) : null}
                      <p className="ct-status" data-testid="signup-waiting">
                        Aguardando o pagamento do Pix. A loja ainda não está ativa.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <h2 id="ct-checkout-title">Contratar a Weper</h2>
                  <p className="ct-card-lead">
                    Escolha seu plano e preencha seus dados para ativar sua assinatura. Sua loja será liberada após a confirmação do pagamento.
                  </p>
                  {isTestPlan ? (
                    <p className="ct-alert" role="status">
                      Plano de homologação Asaas (R$ 10,00). Não é oferta comercial.
                    </p>
                  ) : null}

                  <form className="ct-form" onSubmit={submit}>
                    <div className="ct-field">
                      <div className="ct-field-label-row">
                        <label htmlFor="plan">
                          {isTestPlan
                            ? 'Plano selecionado'
                            : 'Qual é o faturamento mensal do seu estabelecimento?'}
                        </label>
                        <span
                          className="ct-hint"
                          title="O faturamento mensal determina a faixa de mensalidade da sua assinatura."
                        >
                          <Info size={16} aria-hidden="true" />
                          <span className="sr-only">
                            O faturamento mensal determina a faixa de mensalidade da sua assinatura.
                          </span>
                        </span>
                      </div>
                      <select
                        id="plan"
                        value={planCode}
                        onChange={(event) => selectPlan(event.target.value)}
                        required
                        className={planSelected ? undefined : 'is-placeholder'}
                        aria-invalid={Boolean(error && !planSelected)}
                      >
                        <option value="" disabled>
                          Selecione a faixa de faturamento
                        </option>
                        {signupPlans.map((tier) => (
                          <option key={tier.code} value={tier.code}>
                            {tier.label} — {formatPrice(tier.monthlyPrice)}/mês
                          </option>
                        ))}
                      </select>
                    </div>

                    <div
                      className={`ct-plan-summary${planSelected ? '' : ' is-empty'}`}
                      aria-live="polite"
                    >
                      <div className="ct-plan-summary-top">
                        <div>
                          <span>{isTestPlan ? 'Plano de teste' : 'Seu plano Weper'}</span>
                          {planSelected ? (
                            <strong>
                              {formatPrice(plan.monthlyPrice)}
                              <small>/mês</small>
                            </strong>
                          ) : (
                            <strong className="ct-plan-summary-placeholder">Selecione um plano</strong>
                          )}
                        </div>
                        {planSelected ? (
                          <span className="ct-plan-badge">{isTestPlan ? 'Homologação' : 'Plano completo'}</span>
                        ) : null}
                      </div>
                      {planSelected ? (
                        <ul>
                          {isTestPlan ? (
                            <>
                              <li><Check size={15} aria-hidden="true" /> Validação do fluxo Asaas (Pix ou cartão).</li>
                              <li><Check size={15} aria-hidden="true" /> Cobrança de R$ 10,00 — sandbox ou conta Weper.</li>
                              <li><Check size={15} aria-hidden="true" /> Loja liberada após confirmação do pagamento.</li>
                            </>
                          ) : (
                            <>
                              <li><Check size={15} aria-hidden="true" /> Funcionalidades incluídas no plano.</li>
                              <li><Check size={15} aria-hidden="true" /> Sem comissões da Weper por venda.</li>
                              <li><Check size={15} aria-hidden="true" /> Suporte conforme o plano.</li>
                              <li><Check size={15} aria-hidden="true" /> Atualizações da plataforma.</li>
                            </>
                          )}
                        </ul>
                      ) : null}
                    </div>

                    <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                      <legend className="ct-legend" style={{ marginBottom: 8 }}>Responsável financeiro</legend>
                      <div className="ct-person-toggle">
                        <label>
                          <input
                            type="radio"
                            name="person"
                            checked={form.person === 'FISICA'}
                            onChange={() => {
                              setForm((current) => ({
                                ...current,
                                person: 'FISICA',
                                document: maskCpf(current.document),
                              }));
                            }}
                          />
                          Pessoa física
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="person"
                            checked={form.person === 'JURIDICA'}
                            onChange={() => {
                              setForm((current) => ({
                                ...current,
                                person: 'JURIDICA',
                                document: maskCnpj(current.document),
                              }));
                            }}
                          />
                          Pessoa jurídica
                        </label>
                      </div>
                    </fieldset>

                    <div className="ct-field">
                      <label htmlFor="name">Nome completo</label>
                      <input
                        id="name"
                        value={form.name}
                        onChange={(event) => update('name', event.target.value)}
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="ct-field-row">
                      <div className="ct-field">
                        <label htmlFor="document">{isPj ? 'CNPJ' : 'CPF'}</label>
                        <input
                          id="document"
                          value={form.document}
                          onChange={(event) => updateDocument(event.target.value)}
                          inputMode="numeric"
                          autoComplete="off"
                          placeholder={isPj ? '00.000.000/0000-00' : '000.000.000-00'}
                          required
                        />
                      </div>
                      <div className="ct-field">
                        <label htmlFor="email">E-mail</label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={(event) => update('email', event.target.value)}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <p className="ct-legend" style={{ marginBottom: 8 }}>Forma de pagamento</p>
                      <div className="ct-pay-options" role="radiogroup" aria-label="Forma de pagamento">
                        <button
                          type="button"
                          className={`ct-pay-option ct-pay-option--pix${billingType === 'PIX' ? ' is-selected' : ''}`}
                          onClick={() => setBillingType('PIX')}
                          aria-pressed={billingType === 'PIX'}
                        >
                          <strong>
                            <WalletCards size={18} aria-hidden="true" />
                            Pix
                          </strong>
                          <span>Pagamento rápido e seguro.</span>
                        </button>
                        <button
                          type="button"
                          className={`ct-pay-option ct-pay-option--card${card ? ' is-selected' : ''}`}
                          onClick={() => setBillingType('CREDIT_CARD')}
                          aria-pressed={card}
                        >
                          <strong>
                            <CreditCard size={18} aria-hidden="true" />
                            Cartão de crédito
                          </strong>
                          <span>Pague com seu cartão de crédito.</span>
                        </button>
                      </div>
                      <div className="sr-only">
                        <label>
                          <input
                            type="radio"
                            name="billing"
                            checked={!card}
                            onChange={() => setBillingType('PIX')}
                          />
                          Pix
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="billing"
                            checked={card}
                            onChange={() => setBillingType('CREDIT_CARD')}
                          />
                          Cartão
                        </label>
                      </div>
                    </div>

                    {card ? (
                      <div className="ct-card-fields">
                        <p>
                          Dados do cartão são enviados apenas para processar a assinatura. Eles não ficam salvos nesta tela.
                        </p>
                        <div className="ct-field">
                          <label htmlFor="holderName">Nome do titular</label>
                          <input
                            id="holderName"
                            value={form.holderName}
                            onChange={(event) => update('holderName', event.target.value)}
                            autoComplete="cc-name"
                          />
                        </div>
                        <div className="ct-field">
                          <label htmlFor="cardNumber">Número do cartão</label>
                          <input
                            id="cardNumber"
                            autoComplete="off"
                            value={form.number}
                            onChange={(event) => update('number', maskCardNumber(event.target.value))}
                            inputMode="numeric"
                          />
                        </div>
                        <div className="ct-field-row">
                          <div className="ct-field">
                            <label htmlFor="expiryMonth">Mês</label>
                            <input
                              id="expiryMonth"
                              value={form.expiryMonth}
                              onChange={(event) => update('expiryMonth', onlyDigits(event.target.value).slice(0, 2))}
                              placeholder="MM"
                              inputMode="numeric"
                            />
                          </div>
                          <div className="ct-field">
                            <label htmlFor="expiryYear">Ano</label>
                            <input
                              id="expiryYear"
                              value={form.expiryYear}
                              onChange={(event) => update('expiryYear', onlyDigits(event.target.value).slice(0, 4))}
                              placeholder="AAAA"
                              inputMode="numeric"
                            />
                          </div>
                        </div>
                        <div className="ct-field">
                          <label htmlFor="ccv">CVV</label>
                          <input
                            id="ccv"
                            autoComplete="off"
                            value={form.ccv}
                            onChange={(event) => update('ccv', onlyDigits(event.target.value).slice(0, 4))}
                            inputMode="numeric"
                          />
                        </div>
                        <div className="ct-field">
                          <label htmlFor="phone">Telefone</label>
                          <input
                            id="phone"
                            value={form.phone}
                            onChange={(event) => update('phone', maskPhone(event.target.value))}
                            inputMode="tel"
                            autoComplete="tel"
                          />
                        </div>
                        <div className="ct-field-row">
                          <div className="ct-field">
                            <label htmlFor="postalCode">CEP</label>
                            <input
                              id="postalCode"
                              value={form.postalCode}
                              onChange={(event) => update('postalCode', maskCep(event.target.value))}
                              inputMode="numeric"
                              autoComplete="postal-code"
                            />
                          </div>
                          <div className="ct-field">
                            <label htmlFor="addressNumber">Número</label>
                            <input
                              id="addressNumber"
                              value={form.addressNumber}
                              onChange={(event) => update('addressNumber', event.target.value)}
                              autoComplete="address-line2"
                            />
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {error ? <p className="ct-alert" role="alert">{error}</p> : null}

                    <button className="ct-submit" type="submit" disabled={pending || !planSelected}>
                      {pending ? 'Enviando…' : 'Continuar para o pagamento'}
                      {!pending ? <ArrowRight size={18} aria-hidden="true" /> : null}
                    </button>

                    <div className="ct-trust">
                      <article>
                        <ShieldCheck size={16} aria-hidden="true" />
                        <strong>Ambiente seguro</strong>
                        <span>Seus dados são protegidos.</span>
                      </article>
                      <article>
                        <Lock size={16} aria-hidden="true" />
                        <strong>Privacidade</strong>
                        <span>Informações utilizadas para sua contratação.</span>
                      </article>
                      <article>
                        <CreditCard size={16} aria-hidden="true" />
                        <strong>Pagamento seguro</strong>
                        <span>Processado por parceiro financeiro.</span>
                      </article>
                    </div>

                    <p className="ct-legal">
                      Ao continuar, você concorda com os{' '}
                      <Link to={PATHS.TERMS}>Termos de Uso</Link>
                      {' '}e a{' '}
                      <Link to={PATHS.PRIVACY}>Política de Privacidade</Link>.
                    </p>
                  </form>
                </>
              )}
            </div>
          </section>

          <section className="ct-more" aria-label="Mais sobre a Weper">
            <div>
              <h2 className="ct-section-title">Tudo o que você precisa para operar</h2>
              <div className="ct-features">
                {FEATURES.map(({ title, description, Icon }) => (
                  <article key={title} className="ct-feature">
                    <div className="ct-feature-icon" aria-hidden="true">
                      <Icon size={20} />
                    </div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </div>

            <figure className="ct-mockups">
              <picture>
                <source srcSet={ecosystemDevicesWebp} type="image/webp" />
                <img
                  src={ecosystemDevicesJpg}
                  alt="Weper em notebook, smartphone e tablet — dashboard, cardápio e operação"
                  width={1200}
                  height={720}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption className="ct-mockups-caption">
                Dashboard, aplicativo e cardápio digital em uma só plataforma.
              </figcaption>
            </figure>

            <div className="ct-compare">
              <div className="ct-compare-grid">
                <div className="ct-compare-col ct-compare-col--market">
                  <h3>Marketplaces de delivery</h3>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                    Exemplos: iFood, Keeta e 99Food
                  </p>
                  <ul>
                    <li><X size={15} aria-hidden="true" /> Podem cobrar comissões por venda.</li>
                    <li><X size={15} aria-hidden="true" /> Podem aplicar taxas conforme o contrato.</li>
                    <li><X size={15} aria-hidden="true" /> O estabelecimento depende das regras do marketplace.</li>
                  </ul>
                </div>
                <div className="ct-compare-vs" aria-hidden="true">VS</div>
                <div className="ct-compare-col ct-compare-col--weper">
                  <h3>Weper</h3>
                  <ul>
                    <li><Check size={15} aria-hidden="true" /> 0% de comissão da Weper sobre vendas.</li>
                    <li><Check size={15} aria-hidden="true" /> Sem taxas por pedido cobradas pela Weper.</li>
                    <li><Check size={15} aria-hidden="true" /> Mensalidade definida pelo plano.</li>
                    <li><Check size={15} aria-hidden="true" /> Delivery próprio.</li>
                    <li><Check size={15} aria-hidden="true" /> Maior autonomia comercial.</li>
                    <li><Check size={15} aria-hidden="true" /> Fortalecimento da marca do estabelecimento.</li>
                  </ul>
                </div>
              </div>
              <p className="ct-compare-note">
                Taxas de processamento de pagamentos cobradas por instituições financeiras podem ser aplicáveis.
              </p>
            </div>

            <div className="ct-benefit-row">
              <article className="ct-benefit-card">
                <Percent size={20} aria-hidden="true" />
                <strong>Sem comissões por venda</strong>
                <span>Mais previsibilidade para o seu negócio.</span>
              </article>
              <article className="ct-benefit-card">
                <LayoutDashboard size={20} aria-hidden="true" />
                <strong>Tudo em um só lugar</strong>
                <span>Ferramentas integradas para sua operação.</span>
              </article>
              <article className="ct-benefit-card">
                <ShieldCheck size={20} aria-hidden="true" />
                <strong>Suporte especializado</strong>
                <span>Estamos aqui para ajudar você a começar.</span>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
