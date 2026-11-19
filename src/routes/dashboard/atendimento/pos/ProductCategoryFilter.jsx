import { Box, Chip } from '@mui/material';

function CategoryChip({ label, count, selected, onSelect, unavailable = false }) {
  return (
    <Chip
      clickable
      variant={selected ? 'filled' : 'outlined'}
      aria-pressed={selected}
      aria-label={unavailable ? `${label} indisponível` : label}
      onClick={onSelect}
      label={(
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          <span>{label}</span>
          <Box
            component="span"
            sx={{
              minWidth: 18,
              height: 18,
              px: 0.6,
              borderRadius: '999px',
              fontSize: 12,
              fontWeight: 700,
              lineHeight: '18px',
              textAlign: 'center',
              color: selected ? '#fff' : 'var(--color-text-secondary)',
              bgcolor: selected ? 'rgba(255,255,255,0.22)' : 'transparent',
            }}
          >
            {count}
          </Box>
        </Box>
      )}
      sx={{
        flex: '0 0 auto',
        height: 36,
        borderRadius: '999px',
        fontWeight: selected ? 700 : 600,
        ...(selected
          ? {
              bgcolor: 'var(--color-primary)',
              color: '#fff',
              borderColor: 'var(--color-primary)',
              '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            }
          : {
              color: unavailable ? 'var(--status-danger-text)' : 'var(--color-text-primary)',
              borderColor: unavailable ? 'var(--status-danger-text)' : 'var(--color-border)',
              bgcolor: 'var(--color-surface)',
              '&:hover': { bgcolor: unavailable ? 'var(--status-danger-bg)' : 'var(--color-primary-soft)' },
            }),
      }}
    />
  );
}

export function ProductCategoryFilter({ categories, value, onChange, counts, disabled = false }) {
  if (!categories?.length) return null;
  return (
    <Box sx={{ minWidth: 0, maxWidth: '100%', opacity: disabled ? 0.55 : 1 }}>
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
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category.id}
            label={category.name}
            count={counts?.[category.id] || 0}
            selected={value === category.id}
            unavailable={category.available === false}
            onSelect={() => onChange(category.id)}
          />
        ))}
      </Box>
    </Box>
  );
}
