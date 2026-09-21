import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  StorefrontOutlined as StoreIcon,
  ScheduleOutlined as ScheduleIcon,
  QrCode2Outlined as QrCodeIcon,
  PercentOutlined as PercentIcon,
  CreditCardOutlined as CreditCardIcon,
  DeliveryDiningOutlined as DeliveryIcon,
  PeopleOutline as PeopleIcon,
  BusinessOutlined as BusinessIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { getCurrentUser } from '../../../../services/authService';
import {
  createDefaultSchedule,
  formatDayHours,
  isStoreOpenNow,
  normalizeSchedule,
  WEEKDAY_OPTIONS,
} from '../../../../services/storeHoursService';
import { buildPublicMenuUrl } from '../../../../services/publicMenuService';
import { buildDeliveryUrl } from '../../../../services/deliveryService';
import { formatCurrencyInput } from '../../../../utils/currencyInput';
import { SettingsSectionCard } from './SettingsSectionCard';

function formatMoney(value) {
  const formatted = formatCurrencyInput(value ?? 0);
  return formatted ? `R$ ${formatted}` : 'R$ 0,00';
}

export function GeneralSection({ settings, onNavigate }) {
  const user = getCurrentUser();
  const storeName = settings?.storeName || user?.storeName || 'Sua loja';
  const schedule = useMemo(
    () => normalizeSchedule(settings?.schedule?.length ? settings.schedule : createDefaultSchedule()),
    [settings?.schedule]
  );
  const openNow = useMemo(() => isStoreOpenNow({ schedule }), [schedule]);
  const todayOption = WEEKDAY_OPTIONS.find((d) => {
    const jsDay = new Date().getDay(); // 0=Sun
    const weekday = jsDay === 0 ? 7 : jsDay;
    return d.id === weekday;
  });
  const todayHours = schedule.find((d) => d.weekday === todayOption?.id);
  const menuUrl = buildPublicMenuUrl(settings?.slug);
  const deliveryUrl = buildDeliveryUrl(settings?.slug);
  const logo = settings?.deliveryLogoUrl;
  const phone = settings?.companyInfo?.phone || '—';
  const cnpj = settings?.companyInfo?.cnpj || '—';
  const address = settings?.storeAddress || settings?.companyInfo?.address || '';

  return (
    <div className="settings-overview-grid">
      <SettingsSectionCard
        icon={StoreIcon}
        title="Informações da Loja"
        actionLabel="Editar"
        actionVariant="edit"
        onAction={() => onNavigate('empresa')}
      >
        <Box className="overview-store">
          <Box className="overview-store__brand">
            {logo ? (
              <Box
                component="img"
                src={logo}
                alt=""
                className="overview-store__logo"
              />
            ) : (
              <Box className="overview-store__logo overview-store__logo--placeholder" aria-hidden>
                {storeName.slice(0, 1).toUpperCase()}
              </Box>
            )}
            <Box className="overview-store__meta">
              <Typography className="overview-store__name">{storeName}</Typography>
              <Box className="overview-store__badges">
                <Chip
                  size="small"
                  label={openNow ? 'Aberto agora' : 'Fechado no momento'}
                  color={openNow ? 'success' : 'default'}
                  className="status-chip"
                />
                {settings?.deliveryEstimatedMinutes ? (
                  <Typography className="overview-store__eta" variant="body2">
                    <TimeIcon fontSize="inherit" />
                    {settings.deliveryEstimatedMinutes} min
                  </Typography>
                ) : null}
              </Box>
              {address ? (
                <Typography variant="caption" color="text.secondary" className="overview-store__address">
                  {address}
                </Typography>
              ) : null}
            </Box>
          </Box>
          <Box className="overview-store__facts">
            <div>
              <span className="overview-fact__label">Tipo de operação</span>
              <strong>{settings?.deliveryEnabled ? 'Delivery ativo' : 'Salão / balcão'}</strong>
            </div>
            <div>
              <span className="overview-fact__label">CNPJ</span>
              <strong>{cnpj}</strong>
            </div>
            <div>
              <span className="overview-fact__label">Telefone</span>
              <strong>{phone}</strong>
            </div>
          </Box>
        </Box>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={ScheduleIcon}
        title="Horários de funcionamento"
        actionLabel="Editar"
        actionVariant="edit"
        onAction={() => onNavigate('horarios')}
      >
        <Chip
          size="small"
          label={openNow ? 'Aberto agora' : 'Fechado no momento'}
          color={openNow ? 'success' : 'default'}
          sx={{ mb: 1.5 }}
        />
        <Typography variant="body2" color="text.secondary">
          Hoje ({todayOption?.label || '—'}): {formatDayHours(todayHours || { enabled: false, intervals: [] })}
        </Typography>
        <Box className="overview-hours-preview">
          {schedule.slice(0, 3).map((day) => {
            const label = WEEKDAY_OPTIONS.find((o) => o.id === day.weekday)?.label || day.weekday;
            return (
              <div key={day.weekday} className="overview-hours-preview__row">
                <span>{label}</span>
                <span>{formatDayHours(day)}</span>
              </div>
            );
          })}
        </Box>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={QrCodeIcon}
        title="Cardápio Digital (QR)"
        actionLabel="Editar"
        actionVariant="edit"
        onAction={() => onNavigate('cardapio-digital')}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          Status:{' '}
          <strong>{settings?.publicMenuEnabled ? 'Publicado' : 'Despublicado'}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="overview-ellipsis">
          {menuUrl || 'Slug da loja ainda não disponível.'}
        </Typography>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={DeliveryIcon}
        title="Delivery"
        actionLabel="Editar"
        actionVariant="edit"
        onAction={() => onNavigate('delivery')}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          Status:{' '}
          <strong>{settings?.deliveryEnabled ? 'Habilitado' : 'Pausado'}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Taxa {formatMoney(settings?.deliveryFee)} · Mínimo {formatMoney(settings?.deliveryMinOrder)}
          {settings?.deliveryEstimatedMinutes
            ? ` · ${settings.deliveryEstimatedMinutes} min`
            : ''}
        </Typography>
        {deliveryUrl ? (
          <Typography variant="caption" color="text.secondary" className="overview-ellipsis" sx={{ mt: 1, display: 'block' }}>
            {deliveryUrl}
          </Typography>
        ) : null}
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={PercentIcon}
        title="Taxas e Regras"
        actionLabel="Editar"
        actionVariant="edit"
        onAction={() => onNavigate('taxas')}
      >
        <Box className="overview-metrics">
          <div>
            <span className="overview-fact__label">Taxa de serviço</span>
            <strong>{settings?.serviceFee ?? 0}%</strong>
          </div>
          <div>
            <span className="overview-fact__label">Tempo estimado</span>
            <strong>
              {settings?.deliveryEstimatedMinutes
                ? `${settings.deliveryEstimatedMinutes} min`
                : '—'}
            </strong>
          </div>
          <div>
            <span className="overview-fact__label">Pedido mínimo</span>
            <strong>{formatMoney(settings?.deliveryMinOrder)}</strong>
          </div>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          Tempo e pedido mínimo são gerenciados em Delivery.
        </Typography>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={CreditCardIcon}
        title="Pagamentos"
        description="Momento da cobrança, meios aceitos e adquirente."
        actionLabel="Abrir"
        actionVariant="link"
        onAction={() => onNavigate('pagamentos')}
        compact
        className="settings-card--nav"
      />

      <SettingsSectionCard
        icon={PeopleIcon}
        title="Equipe e Permissões"
        description="Perfis de acesso e permissões por função."
        actionLabel="Abrir"
        actionVariant="link"
        onAction={() => onNavigate('permissoes')}
        compact
        className="settings-card--nav"
      />

      <SettingsSectionCard
        icon={BusinessIcon}
        title="Empresa"
        description="Dados fiscais, endereço e telefone."
        actionLabel="Abrir"
        actionVariant="link"
        onAction={() => onNavigate('empresa')}
        compact
        className="settings-card--nav"
      />
    </div>
  );
}
