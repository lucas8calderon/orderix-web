import { Box, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const FLOOR_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'free', label: 'Livres' },
  { id: 'busy', label: 'Em uso' },
];

export function filterFloorItems(items, { status = 'all', query = '' } = {}) {
  const term = String(query || '').trim();
  return (items || []).filter((item) => {
    const busy = item?.isAvailable === false;
    if (status === 'free' && busy) return false;
    if (status === 'busy' && !busy) return false;
    if (term && !String(item?.number ?? '').includes(term)) return false;
    return true;
  });
}

/** Filtro de mesas e comandas: livres, em uso e busca pelo número. */
export function FloorFilterBar({ items, status, onStatus, query, onQuery, searchLabel }) {
  const busy = (items || []).filter((item) => item?.isAvailable === false).length;
  const counts = { all: (items || []).length, free: (items || []).length - busy, busy };
  return (
    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={status}
        onChange={(_event, value) => {
          if (value) onStatus(value);
        }}
        aria-label="Filtrar por situação"
        className="floor-filter"
      >
        {FLOOR_FILTERS.map((filter) => (
          <ToggleButton key={filter.id} value={filter.id} aria-label={filter.label}>
            {filter.label} · {counts[filter.id]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <TextField
        size="small"
        type="search"
        value={query}
        onChange={(event) => onQuery(event.target.value.replace(/\D/g, ''))}
        placeholder="Nº"
        inputProps={{ 'aria-label': searchLabel, inputMode: 'numeric' }}
        sx={{ width: 110 }}
      />
    </Box>
  );
}
