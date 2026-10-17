import { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import {
  choiceHint,
  groupLimits,
  priceMode,
  selectedIds,
  toggleChoice,
} from '../utils/mandatoryChoices';

function formatMoney(value, formatCurrency) {
  if (typeof formatCurrency === 'function') return formatCurrency(value);
  const number = Number(value);
  if (!Number.isFinite(number)) return '';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function MandatoryChoiceList({
  groups = [],
  selections = {},
  onChange,
  formatCurrency,
}) {
  const [queries, setQueries] = useState({});

  return (
    <>
      {(groups || []).map((group) => {
        const { min } = groupLimits(group);
        const chosen = selectedIds(selections, group.id);
        const query = queries[group.id] || '';
        const items = (group.items || []).filter((item) => {
          if (!query.trim()) return true;
          const hay = `${item.name || ''} ${item.description || ''}`.toLowerCase();
          return hay.includes(query.trim().toLowerCase());
        });
        return (
          <Box key={group.id || group.name} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2">{group.name}</Typography>
                <Typography variant="body2" color="text.secondary">{choiceHint(group)}</Typography>
                {priceMode(group) === 'HIGHEST' ? (
                  <Typography variant="body2" color="text.secondary">
                    O valor final será o de maior valor.
                  </Typography>
                ) : null}
              </Box>
              {min > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{chosen.length} / {min}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: 'grey.800',
                      color: 'common.white',
                      fontWeight: 700,
                    }}
                  >
                    OBRIGATÓRIO
                  </Typography>
                </Box>
              ) : null}
            </Box>
            {(group.items || []).length > 8 ? (
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar opção"
                value={query}
                onChange={(event) => setQueries((prev) => ({ ...prev, [group.id]: event.target.value }))}
                sx={{ mt: 1 }}
                inputProps={{ 'aria-label': `Buscar em ${group.name}` }}
              />
            ) : null}
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
              {items.map((item) => {
                const active = chosen.some((id) => String(id) === String(item.id));
                return (
                  <Box
                    component="li"
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 1,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                      {item.description ? (
                        <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                      ) : null}
                      <Typography variant="body2">+ {formatMoney(item.price, formatCurrency)}</Typography>
                    </Box>
                    <button
                      type="button"
                      aria-pressed={active}
                      aria-label={`${active ? 'Remover' : 'Escolher'} ${item.name}`}
                      onClick={() => onChange(group.id, toggleChoice(group, selections, item.id))}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        border: '1px solid #c9a27a',
                        background: active ? '#8a4b08' : 'transparent',
                        color: active ? '#fff' : '#8a4b08',
                        fontSize: 22,
                        lineHeight: 1,
                        cursor: 'pointer',
                      }}
                    >
                      {active ? '✓' : '+'}
                    </button>
                  </Box>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </>
  );
}
