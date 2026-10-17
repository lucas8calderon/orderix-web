import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatPrice } from '../../config/pricingTiers';
import {
  PARTNER_COMMISSION_RATES,
  PARTNER_DEFAULT_PERIOD,
  PARTNER_DEFAULT_RATE,
  PARTNER_DEFAULT_STORES,
  PARTNER_DISCLAIMER,
  PARTNER_MAX_STORES,
  PARTNER_MIN_STORES,
  PARTNER_PERIODS,
  getPartnerPlans,
  getPartnerReferencePlan,
  simulatePartnerEarnings,
} from './partnerProgram';

function prefersReducedMotion() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function formatAxisMoney(value) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1000) {
    const compact = (number / 1000).toLocaleString('pt-BR', {
      maximumFractionDigits: number >= 10000 ? 0 : 1,
    });
    return `${compact} mil`;
  }
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function axisInterval(months) {
  if (months <= 12) return 0;
  if (months <= 24) return 1;
  return 2;
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="wp-partners-tooltip">
      <strong>{row.label}</strong>
      <span>{formatPrice(row.accumulated)} acumulados</span>
    </div>
  );
}

function Choice({ name, value, checked, onChange, children }) {
  return (
    <label className={`wp-partners-choice ${checked ? 'is-selected' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span>{children}</span>
    </label>
  );
}

export default function PartnersSimulator() {
  const plans = useMemo(() => getPartnerPlans(), []);
  const reference = useMemo(() => getPartnerReferencePlan(plans), [plans]);
  const [planId, setPlanId] = useState(reference.id);
  const [stores, setStores] = useState(PARTNER_DEFAULT_STORES);
  const [rate, setRate] = useState(PARTNER_DEFAULT_RATE);
  const [period, setPeriod] = useState(PARTNER_DEFAULT_PERIOD);
  const [barsReady, setBarsReady] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const plan = plans.find((item) => item.id === planId) || reference;
  const result = useMemo(() => simulatePartnerEarnings({
    monthlyPrice: plan.monthlyPrice,
    stores,
    ratePercent: rate,
    months: period,
  }), [plan.monthlyPrice, stores, rate, period]);

  useEffect(() => {
    if (reducedMotion) {
      setBarsReady(true);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setBarsReady(true));
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion]);

  const sliderProgress = `${((stores - PARTNER_MIN_STORES) / (PARTNER_MAX_STORES - PARTNER_MIN_STORES)) * 100}%`;
  const finalLabel = `No mês ${result.months}, a projeção acumulada ilustrativa é ${formatPrice(result.accumulatedCommission)}.`;

  return (
    <section id="simulador" className="wp-section wp-partners-simulator" aria-labelledby="partner-simulator-title">
      <div className="wp-container">
        <div className="wp-section-heading">
          <div>
            <span className="wp-kicker">SIMULE SEM COMPROMISSO</span>
            <h2 id="partner-simulator-title">Veja uma estimativa<br /><em>antes de começar.</em></h2>
          </div>
          <p>Escolha uma mensalidade pública da Weper, a quantidade de estabelecimentos e um percentual ilustrativo. Os números mudam na hora.</p>
        </div>

        <div className="wp-partners-simulator-grid">
          <form className="wp-partners-controls" onSubmit={(event) => event.preventDefault()}>
            <fieldset className="wp-partners-fieldset" aria-describedby="partner-plan-note">
              <legend>Plano da assinatura</legend>
              <div className="wp-partners-plans">
                {plans.map((item) => (
                  <Choice
                    key={item.id}
                    name="partner-plan"
                    value={item.id}
                    checked={item.id === plan.id}
                    onChange={() => setPlanId(item.id)}
                  >
                    <strong>{formatPrice(item.monthlyPrice)}</strong>
                    <small>/mês</small>
                    <em>{item.label}</em>
                  </Choice>
                ))}
              </div>
              <p id="partner-plan-note">Mensalidades públicas da Weper, conforme a faixa de volume do estabelecimento.</p>
            </fieldset>

            <div className="wp-partners-slider-block">
              <div className="wp-partners-slider-head">
                <label htmlFor="partner-stores">Quantidade de estabelecimentos</label>
                <output htmlFor="partner-stores">{stores}</output>
              </div>
              <input
                id="partner-stores"
                className="wp-partners-slider"
                type="range"
                min={PARTNER_MIN_STORES}
                max={PARTNER_MAX_STORES}
                step="1"
                value={stores}
                onChange={(event) => setStores(Number(event.target.value))}
                style={{ '--slider-progress': sliderProgress }}
                aria-valuetext={`${stores} ${stores === 1 ? 'estabelecimento' : 'estabelecimentos'}`}
              />
              <div className="wp-partners-slider-scale" aria-hidden="true">
                <span>{PARTNER_MIN_STORES}</span>
                <span>{PARTNER_MAX_STORES}</span>
              </div>
            </div>

            <fieldset className="wp-partners-fieldset" aria-describedby="partner-rate-note">
              <legend>Percentual de comissão</legend>
              <div className="wp-partners-rates">
                {PARTNER_COMMISSION_RATES.map((item) => (
                  <Choice
                    key={item}
                    name="partner-rate"
                    value={String(item)}
                    checked={item === rate}
                    onChange={() => setRate(item)}
                  >
                    {item}%
                  </Choice>
                ))}
              </div>
              <p id="partner-rate-note">Percentuais ilustrativos para simulação. Nem todos estarão disponíveis comercialmente.</p>
            </fieldset>

            <fieldset className="wp-partners-fieldset">
              <legend>Período da projeção</legend>
              <div className="wp-partners-periods">
                {PARTNER_PERIODS.map((item) => (
                  <Choice
                    key={item}
                    name="partner-period"
                    value={String(item)}
                    checked={item === period}
                    onChange={() => setPeriod(item)}
                  >
                    {item} meses
                  </Choice>
                ))}
              </div>
            </fieldset>
          </form>

          <div className="wp-partners-output">
            <div className="wp-partners-highlight">
              <p>Comissão mensal estimada</p>
              <strong>{formatPrice(result.monthlyCommission)}</strong>
              <span>Comissão acumulada em {result.months} meses: {formatPrice(result.accumulatedCommission)}</span>
            </div>

            <dl className="wp-partners-results">
              <dt id="partner-result-per-store">Comissão estimada por estabelecimento/mês</dt>
              <dd aria-labelledby="partner-result-per-store">{formatPrice(result.commissionPerStore)}</dd>
              <dt id="partner-result-stores">Total de estabelecimentos</dt>
              <dd aria-labelledby="partner-result-stores">{result.stores}</dd>
              <dt id="partner-result-revenue">Receita mensal total das assinaturas simuladas</dt>
              <dd aria-labelledby="partner-result-revenue">{formatPrice(result.subscriptionRevenue)}</dd>
              <dt id="partner-result-monthly">Comissão mensal estimada</dt>
              <dd aria-labelledby="partner-result-monthly">{formatPrice(result.monthlyCommission)}</dd>
              <dt id="partner-result-accumulated">Comissão acumulada no período</dt>
              <dd aria-labelledby="partner-result-accumulated">{formatPrice(result.accumulatedCommission)}</dd>
              <dt id="partner-result-annual">Projeção anual equivalente</dt>
              <dd aria-labelledby="partner-result-annual">{formatPrice(result.annualEquivalent)}</dd>
            </dl>

            <figure className="wp-partners-figure">
              <div className="wp-partners-chart" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={result.series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: '#5e6c82' }}
                      axisLine={false}
                      tickLine={false}
                      interval={axisInterval(result.months)}
                    />
                    <YAxis
                      tickFormatter={formatAxisMoney}
                      tick={{ fontSize: 11, fill: '#5e6c82' }}
                      axisLine={false}
                      tickLine={false}
                      width={64}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
                    <Bar
                      dataKey="accumulated"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                      isAnimationActive={!reducedMotion}
                    >
                      {result.series.map((row) => (
                        <Cell
                          key={row.month}
                          fill={row.month === result.months ? '#1D4ED8' : '#93C5FD'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <figcaption>
                <p className="wp-partners-chart-caption">{finalLabel}</p>
                <div className="wp-partners-sr">
                  <table>
                    <caption>Comissão acumulada mês a mês</caption>
                    <thead>
                      <tr>
                        <th scope="col">Mês</th>
                        <th scope="col">Valor acumulado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.series.map((row) => (
                        <tr key={row.month}>
                          <th scope="row">{row.label}</th>
                          <td>{formatPrice(row.accumulated)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figcaption>
            </figure>

            <div className="wp-partners-bars-block">
              <h3>Comparação por período</h3>
              <ul className="wp-partners-bars" aria-label="Ganhos acumulados por período">
                {result.progress.map((item) => (
                  <li key={item.months}>
                    <span>{item.months} meses</span>
                    <span className="wp-partners-track">
                      <span
                        className="wp-partners-fill"
                        style={{ width: barsReady ? `${item.share * 100}%` : '0%' }}
                      />
                    </span>
                    <strong>{formatPrice(item.accumulated)}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="wp-partners-disclaimer" role="note">
              <p>{PARTNER_DISCLAIMER}</p>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
