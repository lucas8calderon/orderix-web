import { useMemo, useState } from 'react';
import {
  BusinessOutlined as BusinessIcon,
  CreditCardOutlined as PayIcon,
  DeliveryDiningOutlined as DeliveryIcon,
  GroupsOutlined as TeamIcon,
  QrCode2Outlined as QrIcon,
  ScheduleOutlined as HoursIcon,
  StorefrontOutlined as StoreIcon,
  PercentOutlined as FeeIcon,
  HubOutlined as IntegrationIcon,
  PlaceOutlined as PlaceIcon,
  PhoneOutlined as PhoneIcon,
  BadgeOutlined as BadgeIcon,
  CategoryOutlined as CategoryIcon,
  PhotoCameraOutlined as CameraIcon,
  EditOutlined as EditIcon,
  ChevronRight as ChevronIcon,
  LightbulbOutlined as TipIcon,
} from '@mui/icons-material';
import { getCurrentUser } from '../../../../services/authService';
import {
  createDefaultSchedule,
  isStoreOpenNow,
  normalizeSchedule,
} from '../../../../services/storeHoursService';

const WEPER_TIPS = [
  {
    id: 'menu',
    title: 'Deixe seu cardápio sempre atualizado',
    text: 'Produtos indisponíveis confundem o cliente. Revise o estoque e a publicação do cardápio digital com frequência.',
  },
  {
    id: 'hours',
    title: 'Horário certo evita pedido fora do turno',
    text: 'Mantenha os horários de funcionamento alinhados com a operação real da loja. O Delivery e o cardápio usam essa informação.',
  },
  {
    id: 'payments',
    title: 'Confira as formas de pagamento ativas',
    text: 'Pix, cartão e dinheiro aparecem no atendimento conforme o que você marcar em Vendas e Pagamentos.',
  },
];

function storeStatus(settings) {
  const schedule = normalizeSchedule(settings?.schedule?.length ? settings.schedule : createDefaultSchedule());
  const hoursReady = schedule.some((day) => day.enabled && Array.isArray(day.intervals) && day.intervals.length > 0);
  const paymentsReady = Object.values(settings?.paymentMethods || {}).some(Boolean);
  const nameReady = Boolean((settings?.storeName || '').trim());
  const deliveryOn = Boolean(settings?.deliveryEnabled);
  const menuOn = Boolean(settings?.publicMenuEnabled);
  return [
    { ok: nameReady, label: nameReady ? 'Informações da loja preenchidas' : 'Nome da loja ainda não veio do servidor', section: 'empresa' },
    { ok: hoursReady, label: hoursReady ? 'Horários de funcionamento configurados' : 'Horários ainda não configurados', section: 'horarios' },
    { ok: paymentsReady, label: paymentsReady ? 'Pelo menos uma forma de pagamento ativa' : 'Nenhuma forma de pagamento ativa', section: 'vendas' },
    { ok: deliveryOn, label: deliveryOn ? 'Delivery configurado' : 'Delivery desligado', section: 'delivery' },
    { ok: menuOn, label: menuOn ? 'Cardápio digital publicado' : 'Cardápio digital não publicado', section: 'cardapio-digital' },
    { ok: false, pending: true, label: 'Perfis de equipe ainda não são salvos no servidor', section: 'permissoes' },
  ];
}

function storeSegment(settings) {
  const raw = settings?.storeSegment
    || settings?.businessType
    || settings?.companyInfo?.segment
    || settings?.companyInfo?.category
    || '';
  const value = String(raw).trim();
  return value || null;
}

/**
 * Hub da Visão Geral.
 * `nav` é renderizado entre o card de identidade e os atalhos (como no layout de referência).
 */
export function SettingsOverview({ settings, onNavigate, nav = null }) {
  const user = getCurrentUser();
  const storeName = settings?.storeName || user?.storeName || 'Sua loja';
  const [tipIndex, setTipIndex] = useState(0);
  const openNow = useMemo(() => {
    const schedule = normalizeSchedule(settings?.schedule?.length ? settings.schedule : createDefaultSchedule());
    return isStoreOpenNow({ schedule });
  }, [settings?.schedule]);
  const status = useMemo(() => storeStatus(settings), [settings]);
  const pending = status.filter((item) => !item.ok).length;
  const logo = settings?.deliveryLogoUrl || settings?.companyInfo?.logoUrl || '';
  const banner = settings?.deliveryCoverUrl || '';
  const address = settings?.storeAddress || settings?.companyInfo?.address || '';
  const phone = settings?.companyInfo?.phone || '';
  const cnpj = settings?.companyInfo?.cnpj || '';
  const segment = storeSegment(settings);
  const tip = WEPER_TIPS[tipIndex % WEPER_TIPS.length];
  const methodLabels = {
    PIX: 'PIX',
    DEBIT: 'Débito',
    CREDIT: 'Crédito',
    CASH: 'Dinheiro',
    VOUCHER: 'Vale',
    OTHER: 'Outro',
  };
  const methods = Object.entries(settings?.paymentMethods || {})
    .filter(([, on]) => on)
    .map(([key]) => methodLabels[key] || key)
    .join(', ');

  return (
    <div className="settings-hub">
      <section className="settings-identity" aria-label="Identidade da loja">
        <div className="settings-identity__card">
          <div className="settings-identity__main">
            <button
              type="button"
              className="settings-identity__logo-wrap"
              onClick={() => onNavigate('empresa')}
              aria-label="Alterar logo"
            >
              {logo ? (
                <img className="settings-identity__logo" src={logo} alt="" />
              ) : (
                <div className="settings-identity__logo settings-identity__logo--empty" aria-hidden>
                  {storeName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="settings-identity__camera" aria-hidden>
                <CameraIcon fontSize="inherit" />
              </span>
            </button>
            <div className="settings-identity__meta">
              <div className="settings-identity__title-row">
                <h2>{storeName}</h2>
                <span className="settings-pill is-ok">Loja ativa</span>
              </div>
              <ul className="settings-identity__facts">
                {segment ? (
                  <li>
                    <CategoryIcon fontSize="inherit" aria-hidden />
                    <span>{segment}</span>
                  </li>
                ) : null}
                <li>
                  <PlaceIcon fontSize="inherit" aria-hidden />
                  <span>{address || 'Endereço ainda não informado'}</span>
                </li>
                {phone ? (
                  <li>
                    <PhoneIcon fontSize="inherit" aria-hidden />
                    <span>{phone}</span>
                  </li>
                ) : null}
                {cnpj ? (
                  <li>
                    <BadgeIcon fontSize="inherit" aria-hidden />
                    <span>{cnpj}</span>
                  </li>
                ) : null}
              </ul>
              <p className="settings-identity__hint">
                Telefone e CNPJ são editados em Empresa
                {phone || cnpj ? ' e ainda podem ser só rascunho local.' : '.'}
              </p>
              <button
                type="button"
                className="settings-identity__edit"
                onClick={() => onNavigate('empresa')}
              >
                <EditIcon fontSize="small" />
                Editar informações
              </button>
            </div>
          </div>
        </div>
        <div className={`settings-identity__banner${banner ? '' : ' is-empty'}`}>
          {banner ? (
            <img src={banner} alt="Banner da loja" />
          ) : (
            <button type="button" onClick={() => onNavigate('delivery')}>
              <CameraIcon fontSize="small" />
              Adicionar banner da loja
            </button>
          )}
          {banner ? (
            <button
              type="button"
              className="settings-identity__banner-edit"
              onClick={() => onNavigate('delivery')}
              aria-label="Alterar banner"
            >
              <CameraIcon fontSize="small" />
            </button>
          ) : null}
        </div>
      </section>

      {nav}

      <div className="settings-hub-grid">
        <HubCard
          icon={HoursIcon}
          tone="green"
          title="Horários"
          text="Configure os dias e horários de funcionamento."
          status={openNow ? 'Aberto agora' : 'Fechado agora'}
          onClick={() => onNavigate('horarios')}
        />
        <HubCard
          icon={PayIcon}
          tone="blue"
          title="Pagamentos"
          text="Configure formas de pagamento e regras de cobrança."
          status={methods || 'Nenhuma forma ativa'}
          onClick={() => onNavigate('vendas')}
        />
        <HubCard
          icon={DeliveryIcon}
          tone="purple"
          title="Delivery"
          text="Configure entrega, retirada, taxas e tempo estimado."
          status={settings?.deliveryEnabled ? 'Delivery ativo' : 'Delivery desligado'}
          onClick={() => onNavigate('delivery')}
        />
        <HubCard
          icon={QrIcon}
          tone="orange"
          title="Cardápio Digital"
          text="Configure publicação, QR Code e o link do cardápio."
          status={settings?.publicMenuEnabled ? 'Publicado' : 'Não publicado'}
          onClick={() => onNavigate('cardapio-digital')}
        />
      </div>

      <div className="settings-hub-split">
        <section className="settings-quick">
          <div className="settings-block-head">
            <h3>Configurações rápidas</h3>
            <button type="button" className="settings-linkish" onClick={() => onNavigate('operacao')}>
              Ver todas
            </button>
          </div>
          <div className="settings-quick-grid">
            <QuickCard
              icon={FeeIcon}
              title="Taxas e Regras"
              text="Taxa de serviço do salão. Entrega fica no Delivery."
              onClick={() => onNavigate('operacao')}
            />
            <QuickCard
              icon={TeamIcon}
              title="Equipe e Permissões"
              text="Perfis de acesso. Ainda não são gravados no servidor."
              onClick={() => onNavigate('permissoes')}
            />
            <QuickCard
              icon={BusinessIcon}
              title="Dados da Empresa"
              text="CNPJ, telefone e logo. Dados fiscais ainda locais."
              onClick={() => onNavigate('empresa')}
            />
            <QuickCard
              icon={IntegrationIcon}
              title="Integrações"
              text="Mercado Pago e InfinitePay, quando o canal usar."
              onClick={() => onNavigate('integracoes')}
            />
          </div>
        </section>
        <section className="settings-status">
          <div className="settings-block-head">
            <h3>Status da sua loja</h3>
            <span className={`settings-pill${pending ? '' : ' is-ok'}`}>
              {pending === 0 ? 'Tudo certo' : pending === 1 ? '1 pendência' : `${pending} pendências`}
            </span>
          </div>
          <ul>
            {status.map((item) => (
              <li key={item.label}>
                <button type="button" onClick={() => onNavigate(item.section)}>
                  <span className={item.ok ? 'is-ok' : 'is-warn'} aria-hidden>{item.ok ? '✓' : '!'}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="settings-hub-split settings-hub-split--bottom">
        <section className="settings-visual">
          <div className="settings-block-head">
            <h3>Personalização visual</h3>
          </div>
          <p>Defina o logo e o banner da sua loja. Os uploads já existentes em Empresa e Delivery são reutilizados.</p>
          <div className="settings-visual__row">
            <figure>
              {logo ? <img src={logo} alt="" /> : <span>{storeName.slice(0, 1)}</span>}
              <figcaption>
                <strong>Logo da loja</strong>
                <small>512×512 recomendado</small>
                <button type="button" onClick={() => onNavigate('empresa')}>Alterar logo</button>
              </figcaption>
            </figure>
            <figure>
              {banner ? <img src={banner} alt="" /> : <span>Banner</span>}
              <figcaption>
                <strong>Banner da loja</strong>
                <small>1600×600 recomendado</small>
                <button type="button" onClick={() => onNavigate('delivery')}>Alterar banner</button>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="settings-tips" aria-label="Dicas da Weper">
          <div className="settings-block-head">
            <h3>Dicas da Weper</h3>
            <div className="settings-tips__nav">
              <span>{tipIndex + 1}/{WEPER_TIPS.length}</span>
              <button
                type="button"
                aria-label="Dica anterior"
                onClick={() => setTipIndex((i) => (i + WEPER_TIPS.length - 1) % WEPER_TIPS.length)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Próxima dica"
                onClick={() => setTipIndex((i) => (i + 1) % WEPER_TIPS.length)}
              >
                ›
              </button>
            </div>
          </div>
          <div className="settings-tips__body">
            <TipIcon className="settings-tips__icon" aria-hidden />
            <div>
              <strong>{tip.title}</strong>
              <p>{tip.text}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HubCard({ icon: Icon, title, text, status, onClick, tone }) {
  return (
    <button type="button" className={`settings-hub-card tone-${tone}`} onClick={onClick}>
      <span className="settings-hub-card__top">
        <span className="settings-hub-card__icon" aria-hidden><Icon /></span>
        <ChevronIcon className="settings-hub-card__chevron" fontSize="small" aria-hidden />
      </span>
      <strong>{title}</strong>
      <span>{text}</span>
      <em>{status}</em>
    </button>
  );
}

function QuickCard({ icon: Icon, title, text, onClick }) {
  return (
    <button type="button" className="settings-quick-card" onClick={onClick}>
      <Icon fontSize="small" />
      <strong>{title}</strong>
      <span>{text}</span>
    </button>
  );
}

export function SettingsModuleIntro({ icon: Icon = StoreIcon, title, text }) {
  return (
    <div className="settings-module-intro">
      {Icon ? <Icon /> : null}
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
