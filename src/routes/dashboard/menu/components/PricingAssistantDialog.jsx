import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  InputAdornment,
  Slide,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../utils/currencyInput';
import {
  DEFAULT_DESIRED_MARGIN,
  calculatePricingIndicators,
  calculateSuggestedPrice,
  canApplyPricing,
  createEmptyCostRow,
  formatMoneyBrl,
  formatPercentBrl,
  parseNonNegativeNumber,
  sumCosts,
} from '../utils/pricingAssistant';

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

function FieldLabel({ children, tooltip }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
      <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {children}
      </Typography>
      {tooltip ? (
        <Tooltip title={tooltip} arrow enterTouchDelay={0}>
          <IconButton
            size="small"
            aria-label={`Sobre: ${children}`}
            sx={{ p: 0.25, color: 'var(--color-text-secondary)' }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}

function IndicatorRow({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 2,
        py: 0.75,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
        {value}
      </Typography>
    </Box>
  );
}

function parsePercentInput(raw) {
  return parseNonNegativeNumber(raw);
}

export function PricingAssistantDialog({
  open,
  onClose,
  onApply,
  currentPrice = null,
}) {
  const [costRows, setCostRows] = useState([createEmptyCostRow()]);
  const [desiredMargin, setDesiredMargin] = useState(String(DEFAULT_DESIRED_MARGIN));
  const [variableFees, setVariableFees] = useState('');
  const [adjustedPrice, setAdjustedPrice] = useState('');
  const [adjustedTouched, setAdjustedTouched] = useState(false);

  const dialogProps = useDialogResponsiveProps({
    paperSx: {
      borderRadius: { xs: 0, sm: '16px' },
      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.14)',
    },
  });

  useEffect(() => {
    if (!open) return;
    setCostRows([createEmptyCostRow()]);
    setDesiredMargin(String(DEFAULT_DESIRED_MARGIN));
    setVariableFees('');
    setAdjustedPrice('');
    setAdjustedTouched(false);
  }, [open]);

  const totalCost = useMemo(() => sumCosts(costRows), [costRows]);
  const desiredMarginPct = parsePercentInput(desiredMargin);
  const variableFeesPct = parsePercentInput(variableFees) ?? 0;
  const marginSumInvalid = desiredMarginPct != null
    && Number.isFinite(variableFeesPct)
    && (desiredMarginPct + variableFeesPct) >= 100;

  const suggestedPrice = useMemo(() => {
    if (desiredMarginPct == null) return null;
    return calculateSuggestedPrice(totalCost, desiredMarginPct, variableFeesPct);
  }, [totalCost, desiredMarginPct, variableFeesPct]);

  useEffect(() => {
    if (!open) return;
    if (adjustedTouched) return;
    if (suggestedPrice == null) {
      setAdjustedPrice('');
      return;
    }
    setAdjustedPrice(suggestedPrice);
  }, [open, suggestedPrice, adjustedTouched]);

  const applyPrice = adjustedTouched
    ? (adjustedPrice === '' ? null : Number(adjustedPrice))
    : suggestedPrice;

  const indicators = useMemo(() => {
    if (applyPrice == null || desiredMarginPct == null) return null;
    return calculatePricingIndicators(applyPrice, totalCost, variableFeesPct);
  }, [applyPrice, totalCost, variableFeesPct, desiredMarginPct]);

  const canApply = canApplyPricing({
    totalCost,
    desiredMarginPct: desiredMarginPct ?? NaN,
    variableFeesPct,
    applyPrice: applyPrice ?? NaN,
  });

  const validationMessage = (() => {
    if (totalCost <= 0) {
      return 'Informe ao menos um custo com valor maior que zero para calcular o preço.';
    }
    if (desiredMarginPct == null) {
      return 'Informe a margem desejada em percentual.';
    }
    if (marginSumInvalid) {
      return 'A margem desejada somada às taxas precisa ser menor que 100%.';
    }
    if (adjustedTouched && (applyPrice == null || !(applyPrice > 0))) {
      return 'Informe um preço ajustado válido maior que zero.';
    }
    return '';
  })();

  const updateCostRow = (key, patch) => {
    setCostRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const handleApply = () => {
    if (!canApply) return;
    onApply(Number(applyPrice));
  };

  return (
    <Dialog
      aria-labelledby="pricing-assistant-title"
      open={open}
      TransitionComponent={Transition}
      keepMounted={false}
      onClose={onClose}
      maxWidth="md"
      {...dialogProps}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'var(--color-primary-soft)',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
          >
            <CalculateOutlinedIcon />
          </Box>
          <Box>
            <Typography
              id="pricing-assistant-title"
              component="h2"
              variant="h5"
              sx={{ fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.3 }}
            >
              Descubra quanto cobrar pelo seu produto
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Informe seus custos e descubra um preço de venda para alcançar a margem desejada.
            </Typography>
          </Box>
        </Box>

        {currentPrice != null && Number.isFinite(Number(currentPrice)) && Number(currentPrice) > 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Preço atual do produto:{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatMoneyBrl(currentPrice)}
            </Box>
            {' '}(apenas referência)
          </Typography>
        ) : (
          <Box sx={{ mb: 1 }} />
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
            gap: { xs: 2.5, md: 3 },
            alignItems: 'start',
          }}
        >
          <Box>
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              1. Quanto custa produzir?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Adicione os custos dos ingredientes, embalagem e outros gastos do produto.
            </Typography>

            {costRows.map((row, index) => (
              <Box
                key={row.key}
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 1,
                  alignItems: 'flex-start',
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <TextField
                  fullWidth
                  label="Custo"
                  placeholder="Ex.: Queijo"
                  value={row.name}
                  onChange={(e) => updateCostRow(row.key, { name: e.target.value })}
                  inputProps={{ 'aria-label': `Nome do custo ${index + 1}` }}
                />
                <TextField
                  label="Valor"
                  placeholder="0,00"
                  value={formatCurrencyInput(row.value)}
                  onChange={(e) => updateCostRow(row.key, { value: parseCurrencyInput(e.target.value) })}
                  inputMode="numeric"
                  autoComplete="off"
                  sx={{ width: { xs: '100%', sm: 150 }, flexShrink: 0 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    'aria-label': `Valor do custo ${index + 1}`,
                  }}
                />
                <IconButton
                  aria-label={`Remover custo ${index + 1}`}
                  onClick={() => setCostRows((prev) => (
                    prev.length <= 1
                      ? [createEmptyCostRow()]
                      : prev.filter((item) => item.key !== row.key)
                  ))}
                  sx={{
                    minHeight: 56,
                    minWidth: 44,
                    color: 'var(--color-text-secondary)',
                    alignSelf: { xs: 'flex-end', sm: 'stretch' },
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={() => setCostRows((prev) => [...prev, createEmptyCostRow()])}
              sx={{
                mt: 0.5,
                mb: 2,
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--color-primary)',
              }}
            >
              Adicionar custo
            </Button>

            <Box
              sx={{
                borderRadius: '12px',
                backgroundColor: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                px: 2,
                py: 1.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Custo total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formatMoneyBrl(totalCost)}
              </Typography>
            </Box>

            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              2. Quanto deseja ganhar?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Defina a margem desejada e, se quiser, as taxas variáveis da venda.
            </Typography>

            <Box sx={{ mb: 2 }}>
              <FieldLabel
                tooltip="É o percentual do preço de venda que você deseja manter após descontar os custos informados e as taxas variáveis. Não representa necessariamente o lucro líquido."
              >
                Margem desejada (%)
              </FieldLabel>
              <TextField
                fullWidth
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(e.target.value)}
                placeholder="40"
                inputMode="decimal"
                autoComplete="off"
                error={desiredMargin !== '' && desiredMarginPct == null}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{
                  'aria-label': 'Margem desejada em percentual',
                }}
              />
            </Box>

            <Box>
              <FieldLabel
                tooltip="Informe o percentual estimado de impostos, taxas de pagamento e outras despesas proporcionais à venda. Não inclua custos já informados na lista acima."
              >
                Taxas e despesas variáveis (%)
              </FieldLabel>
              <TextField
                fullWidth
                value={variableFees}
                onChange={(e) => setVariableFees(e.target.value)}
                placeholder="Ex.: 5"
                inputMode="decimal"
                autoComplete="off"
                error={variableFees !== '' && parsePercentInput(variableFees) == null}
                helperText="Opcional. Não inclui despesas fixas do negócio."
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{
                  'aria-label': 'Taxas e despesas variáveis em percentual',
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              borderRadius: '16px',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              p: { xs: 2, sm: 2.5 },
              position: { md: 'sticky' },
              top: { md: 8 },
            }}
          >
            <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              Resultado da precificação
            </Typography>

            <Box
              sx={{
                borderRadius: '14px',
                backgroundColor: 'rgba(22, 163, 74, 0.08)',
                border: '1px solid rgba(22, 163, 74, 0.18)',
                px: 2,
                py: 2,
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <SellOutlinedIcon sx={{ color: 'var(--color-success)', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--color-success)' }}>
                  Preço de venda sugerido
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
              >
                {suggestedPrice != null ? formatMoneyBrl(suggestedPrice) : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Margem de contribuição estimada — não é lucro líquido. Despesas fixas podem não estar contempladas.
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <IndicatorRow label="CMV estimado" value={formatPercentBrl(indicators?.cmvPercent)} />
              <IndicatorRow
                label="Margem de contribuição"
                value={formatPercentBrl(indicators?.contributionMarginPercent)}
              />
              <IndicatorRow
                label="Margem em reais"
                value={formatMoneyBrl(indicators?.contributionMarginAmount)}
              />
            </Box>

            <Typography component="h4" variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Ajustar o preço (opcional)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
              Arredonde para um valor comercial e veja o impacto na sua margem.
            </Typography>

            {suggestedPrice != null ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Preço calculado: {formatMoneyBrl(suggestedPrice)}
                {adjustedTouched && applyPrice != null
                  ? ` · Será aplicado: ${formatMoneyBrl(applyPrice)}`
                  : ' · Será aplicado o preço calculado'}
              </Typography>
            ) : null}

            <TextField
              fullWidth
              label="Preço ajustado"
              placeholder="0,00"
              value={formatCurrencyInput(adjustedPrice)}
              onChange={(e) => {
                setAdjustedTouched(true);
                setAdjustedPrice(parseCurrencyInput(e.target.value));
              }}
              disabled={suggestedPrice == null && totalCost <= 0}
              inputMode="numeric"
              autoComplete="off"
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{
                inputMode: 'numeric',
                'aria-label': 'Preço ajustado em reais',
              }}
            />

            {validationMessage ? (
              <Alert severity="info" sx={{ mt: 2, borderRadius: '12px' }}>
                {validationMessage}
              </Alert>
            ) : null}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: '1px solid var(--color-border)',
          gap: 1,
          flexWrap: 'wrap',
          '& > button': { minHeight: 44, flex: { xs: '1 1 140px', sm: '0 0 auto' } },
        }}
      >
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!canApply}
          onClick={handleApply}
          sx={{
            backgroundColor: 'var(--color-primary)',
            '&:hover': { backgroundColor: 'var(--color-primary-dark)' },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Usar este preço
        </Button>
      </DialogActions>
    </Dialog>
  );
}
