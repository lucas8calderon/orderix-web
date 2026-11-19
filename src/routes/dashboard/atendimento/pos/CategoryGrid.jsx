import CheckIcon from '@mui/icons-material/Check';
import { Box, ButtonBase, Typography } from '@mui/material';
import { resolveMenuImage } from '../../menu/utils/defaultMenuImage';

/** Fileira horizontal de categorias: foto, nome e quantidade. */
export function CategoryGrid({ categories, counts, value, onSelect, dimmed = false }) {
  if (!categories?.length) return null;
  return (
    <Box
      component="ul"
      aria-label="Categorias do cardápio"
      sx={{
        listStyle: 'none',
        p: 0.25,
        m: 0,
        minWidth: 0,
        maxWidth: '100%',
        display: 'flex',
        gap: 1.25,
        overflowX: 'auto',
        overflowY: 'hidden',
        opacity: dimmed ? 0.55 : 1,
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {categories.map((category) => {
        const count = counts?.[category.id] || 0;
        const available = category.available !== false;
        const selected = value === category.id;
        return (
          <Box component="li" key={category.id} sx={{ flex: '0 0 auto' }}>
            <ButtonBase
              onClick={() => onSelect(category.id)}
              aria-pressed={selected}
              aria-label={available ? `Ver produtos de ${category.name}` : `Ver produtos de ${category.name}, indisponível`}
              sx={{
                width: 136,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                textAlign: 'left',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '2px solid',
                borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                boxShadow: 'var(--color-shadow)',
                opacity: available ? 1 : 0.88,
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { boxShadow: 'var(--color-shadow-hover)' },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={resolveMenuImage(category.image)}
                  alt=""
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: 92,
                    objectFit: 'cover',
                    backgroundColor: 'var(--color-surface-muted)',
                  }}
                />
                {selected ? (
                  <Box
                    component="span"
                    aria-hidden="true"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 22,
                      height: 22,
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'var(--color-primary)',
                      color: '#fff',
                    }}
                  >
                    <CheckIcon sx={{ fontSize: 16 }} />
                  </Box>
                ) : null}
                {!available ? (
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: 8,
                      px: 1,
                      py: 0.25,
                      borderRadius: '999px',
                      fontSize: 12,
                      fontWeight: 700,
                      color: 'var(--status-danger-text)',
                      bgcolor: 'var(--status-danger-bg)',
                    }}
                  >
                    Indisponível
                  </Box>
                ) : null}
              </Box>
              <Box sx={{ px: 1.25, pt: 1, pb: 1.15 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 14,
                    lineHeight: 1.25,
                    color: available ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                  noWrap
                  title={category.name}
                >
                  {category.name}
                </Typography>
                <Typography sx={{ mt: 0.25, fontSize: 12, lineHeight: 1.3, color: 'var(--color-text-secondary)' }}>
                  {count} {count === 1 ? 'produto' : 'produtos'}
                </Typography>
              </Box>
            </ButtonBase>
          </Box>
        );
      })}
    </Box>
  );
}
