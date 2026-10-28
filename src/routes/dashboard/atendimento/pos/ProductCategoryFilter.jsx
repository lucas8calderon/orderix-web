import { Box, Chip } from '@mui/material';
import { ALL_CATEGORIES, OTHER_CATEGORY } from './catalogView';

function CategoryChip({ label, selected, onSelect }) {
  return (
    <Chip
      label={label}
      clickable
      variant={selected ? 'filled' : 'outlined'}
      aria-pressed={selected}
      onClick={onSelect}
      sx={{
        flex: '0 0 auto',
        height: 36,
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

export function ProductCategoryFilter({ chips, hasOthers, value, onChange }) {
  if ((!chips || chips.length === 0) && !hasOthers) return null;
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        role="toolbar"
        aria-label="Categorias"
        sx={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 0.5,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
        }}
      >
        <CategoryChip
          label="Todas"
          selected={value === ALL_CATEGORIES}
          onSelect={() => onChange(ALL_CATEGORIES)}
        />
        {(chips || []).map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            selected={value === category.id}
            onSelect={() => onChange(category.id)}
          />
        ))}
        {hasOthers ? (
          <CategoryChip
            label="Outros"
            selected={value === OTHER_CATEGORY}
            onSelect={() => onChange(OTHER_CATEGORY)}
          />
        ) : null}
      </Box>
    </Box>
  );
}
