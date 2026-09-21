import React, { lazy, Suspense } from 'react';
import { Box, Typography, Tooltip, Chip, CircularProgress } from '@mui/material';
import { PercentOutlined as PercentIcon } from '@mui/icons-material';
import { SettingsSectionCard } from './SettingsSectionCard';
import { formatCurrencyInput } from '../../../../utils/currencyInput';

const LazySlider = lazy(() =>
  import('@mui/material/Slider').then((mod) => ({ default: mod.default }))
);

export function FeesSection({ settings, onSettingChange, onSave, onNavigate, sliderStyles, saving }) {
  return (
    <div className="settings-section-stack">
      <SettingsSectionCard
        icon={PercentIcon}
        title="Taxa de Serviço"
        description="Percentual aplicado automaticamente aos pedidos do salão."
        actionLabel={saving ? 'Salvando...' : 'Salvar'}
        onAction={() => onSave('serviceFee')}
        actionDisabled={saving}
      >
        <Box className="setting-item">
          <Typography className="setting-label">Percentual da taxa de serviço</Typography>
          <Box className="slider-container">
            <Suspense
              fallback={(
                <Box display="flex" justifyContent="center" p={2} flex={1}>
                  <CircularProgress size={24} />
                </Box>
              )}
            >
              <LazySlider
                value={settings.serviceFee}
                onChange={(e, value) => onSettingChange('serviceFee', null, value)}
                min={0}
                max={20}
                step={1}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 10, label: '10%' },
                  { value: 20, label: '20%' },
                ]}
                className="custom-slider"
                sx={sliderStyles}
              />
            </Suspense>
            <Typography className="slider-value">{settings.serviceFee}%</Typography>
          </Box>
          <Tooltip title="A taxa de serviço será aplicada automaticamente aos pedidos.">
            <Chip label="Aplicada no fechamento da conta" size="small" color="info" variant="outlined" />
          </Tooltip>
        </Box>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Regras de Delivery (somente leitura)"
        description="Taxa de entrega, pedido mínimo e tempo estimado ficam na seção Delivery."
        actionLabel="Ir para Delivery"
        actionVariant="edit"
        onAction={() => onNavigate('delivery')}
      >
        <Box className="overview-metrics">
          <div>
            <span className="overview-fact__label">Taxa de entrega</span>
            <strong>
              {formatCurrencyInput(settings?.deliveryFee ?? 0)
                ? `R$ ${formatCurrencyInput(settings?.deliveryFee ?? 0)}`
                : 'R$ 0,00'}
            </strong>
          </div>
          <div>
            <span className="overview-fact__label">Pedido mínimo</span>
            <strong>
              {formatCurrencyInput(settings?.deliveryMinOrder ?? 0)
                ? `R$ ${formatCurrencyInput(settings?.deliveryMinOrder ?? 0)}`
                : 'R$ 0,00'}
            </strong>
          </div>
          <div>
            <span className="overview-fact__label">Tempo estimado</span>
            <strong>
              {settings?.deliveryEstimatedMinutes
                ? `${settings.deliveryEstimatedMinutes} min`
                : '—'}
            </strong>
          </div>
        </Box>
      </SettingsSectionCard>
    </div>
  );
}
