import { Box, Chip } from '@mui/material';
import { ALL_CATEGORIES, OTHER_CATEGORY } from './catalogView';

function CategoryChip({ label, count, selected, onSelect }) {
  return (
    <Chip
      label={count != null ? `${label} · ${count}` : label}
      clickable
      variant={selected ? 'filled' : 'outlined'}
      aria-pressed={selected}
      aria-label={label}
      onClick={onSelect}
      sx={{
        flex: '0 0 auto',
        height: 40,
        borderRadius: '999px',
        fontWeight: selected ? 700 : 600,
        ...(selected
          ? {
              bgcolor: 'var(--color-primary)',
              color: '#fff',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }
          : {
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
              bgcolor: 'var(--color-surface)',
              '&:hover': { bgcolor: 'var(--color-primary-soft)' },
            }),
      }}
    />
  );
}

// No celular os chips rolam na horizontal; a partir do tablet quebram linha para todas ficarem visíveis.
export function ProductCategoryFilter({ chips, hasOthers, value, onChange, counts, disabled = false }) {
  if ((!chips || chips.length === 0) && !hasOthers) return null;
  const count = (id) => (counts ? counts[id] || 0 : undefined);
  return (
    <Box sx={{ minWidth: 0, opacity: disabled ? 0.55 : 1 }}>
      <Box
        role="toolbar"
        aria-label="Categorias"
        sx={{
          display: 'flex',
          flexWrap: { xs: 'nowrap', sm: 'wrap' },
          gap: 1,
          overflowX: { xs: 'auto', sm: 'visible' },
          overflowY: 'hidden',
          pb: 0.5,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          maskImage: { xs: 'linear-gradient(to right, #000 85%, transparent)', sm: 'none' },
        }}
      >
        <CategoryChip
          label="Todas"
          count={count(ALL_CATEGORIES)}
          selected={value === ALL_CATEGORIES}
          onSelect={() => onChange(ALL_CATEGORIES)}
        />
        {(chips || []).map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            count={count(category.id)}
            selected={value === category.id}
            onSelect={() => onChange(category.id)}
          />
        ))}
        {hasOthers ? (
          <CategoryChip
            label="Outros"
            count={count(OTHER_CATEGORY)}
            selected={value === OTHER_CATEGORY}
            onSelect={() => onChange(OTHER_CATEGORY)}
          />
        ) : null}
      </Box>
    </Box>
  );
}
