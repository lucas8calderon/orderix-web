import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { PRICING_TIERS, formatPrice } from '../../config/pricingTiers';
import { capturePartnerRef, getStoredPartnerRef } from '../../services/partnerReferral';
import '../home/styles/Rebrand.css';

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

export default function SignupPage() {
  const [params] = useSearchParams();
  useEffect(() => {
    capturePartnerRef(params.toString() ? `?${params.toString()}` : window.location.search);
  }, [params]);
  const initialPlan = useMemo(() => {
    const requested = params.get('plan');
    return PRICING_TIERS.some((tier) => tier.code === requested) ? requested : 'PLAN_01';
  }, [params]);
  const [planCode, setPlanCode] = useState(initialPlan);
  const [billingType, setBillingType] = useState('PIX');
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);
  const plan = PRICING_TIERS.find((tier) => tier.code === planCode) || PRICING_TIERS[0];
  const card = billingType === 'CREDIT_CARD';

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
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
      card: card ? {
        holderName: form.holderName.trim() || form.name.trim(),
        number: form.number.trim(),
        expiryMonth: form.expiryMonth.trim(),
        expiryYear: form.expiryYear.trim(),
        ccv: form.ccv.trim(),
        email: form.email.trim(),
        cpfCnpj: form.document.trim(),
        postalCode: form.postalCode.trim(),
        addressNumber: form.addressNumber.trim(),
        phone: form.phone.trim(),
      } : undefined,
    };
    setPending(true);
    try {
      const response = await axios.post('/api/public/billing/signup', payload);
      setResult(response.data);
      setForm((current) => ({ ...current, number: '', ccv: '' }));
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Não foi possível iniciar a contratação.';
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="wp-site">
      <section className="wp-section">
        <div className="wp-container" style={{ maxWidth: 720 }}>
          <Link to="/">Voltar</Link>
          <h1>Contratar a Weper</h1>
          <p>O responsável financeiro pode ser pessoa física ou jurídica. Não pedimos o CNPJ do estabelecimento. A loja só abre depois da confirmação do pagamento.</p>
          {result ? (
            <div>
              <h2>Pagamento em confirmação</h2>
              <p>Abrir a fatura ou voltar desta página não ativa a loja. O convite chega depois que o pagamento for confirmado.</p>
              {result.pixPayload ? <p data-testid="pix-payload">{result.pixPayload}</p> : null}
              {result.invoiceUrl ? <p><a href={result.invoiceUrl}>Abrir a fatura</a></p> : null}
              <p>{result.storeActive ? 'Aguardando a confirmação do pagamento.' : 'A loja ainda não está ativa.'}</p>
            </div>
          ) : (
            <form onSubmit={submit}>
              <label htmlFor="plan">Faixa</label>
              <select id="plan" value={planCode} onChange={(event) => setPlanCode(event.target.value)}>
                {PRICING_TIERS.map((tier) => (
                  <option key={tier.code} value={tier.code}>{tier.label} — {formatPrice(tier.monthlyPrice)}</option>
                ))}
              </select>
              <p>Mensalidade de {formatPrice(plan.monthlyPrice)}. O valor enviado é o do catálogo.</p>
              <fieldset>
                <legend>Responsável financeiro</legend>
                <label><input type="radio" name="person" checked={form.person === 'FISICA'} onChange={() => update('person', 'FISICA')} /> Pessoa física</label>
                <label><input type="radio" name="person" checked={form.person === 'JURIDICA'} onChange={() => update('person', 'JURIDICA')} /> Pessoa jurídica</label>
                <label htmlFor="name">Nome</label>
                <input id="name" value={form.name} onChange={(event) => update('name', event.target.value)} required />
                <label htmlFor="document">{form.person === 'JURIDICA' ? 'CNPJ do responsável' : 'CPF do responsável'}</label>
                <input id="document" value={form.document} onChange={(event) => update('document', event.target.value)} required />
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
              </fieldset>
              <fieldset>
                <legend>Pagamento</legend>
                <label><input type="radio" name="billing" checked={!card} onChange={() => setBillingType('PIX')} /> Pix</label>
                <label><input type="radio" name="billing" checked={card} onChange={() => setBillingType('CREDIT_CARD')} /> Cartão</label>
              </fieldset>
              {card ? (
                <fieldset>
                  <legend>Titular do cartão</legend>
                  <label htmlFor="phone">Telefone</label>
                  <input id="phone" value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                  <label htmlFor="postalCode">CEP</label>
                  <input id="postalCode" value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} />
                  <label htmlFor="addressNumber">Número</label>
                  <input id="addressNumber" value={form.addressNumber} onChange={(event) => update('addressNumber', event.target.value)} />
                  <label htmlFor="holderName">Nome impresso</label>
                  <input id="holderName" value={form.holderName} onChange={(event) => update('holderName', event.target.value)} />
                  <label htmlFor="cardNumber">Número do cartão</label>
                  <input id="cardNumber" autoComplete="off" value={form.number} onChange={(event) => update('number', event.target.value)} />
                  <label htmlFor="expiryMonth">Mês</label>
                  <input id="expiryMonth" value={form.expiryMonth} onChange={(event) => update('expiryMonth', event.target.value)} />
                  <label htmlFor="expiryYear">Ano</label>
                  <input id="expiryYear" value={form.expiryYear} onChange={(event) => update('expiryYear', event.target.value)} />
                  <label htmlFor="ccv">CVV</label>
                  <input id="ccv" autoComplete="off" value={form.ccv} onChange={(event) => update('ccv', event.target.value)} />
                </fieldset>
              ) : null}
              {error ? <p role="alert">{error}</p> : null}
              <button className="wp-button wp-button--primary" type="submit" disabled={pending}>
                {pending ? 'Enviando' : 'Iniciar contratação'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
