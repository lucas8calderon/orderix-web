import { Box, ButtonBase, Typography } from '@mui/material';
import { resolveMenuImage } from '../../menu/utils/defaultMenuImage';

/** Primeira tela do PDV: um card por categoria, como no app do garçom. */
export function CategoryGrid({ categories, counts, onSelect }) {
  if (!categories.length) {
    return (
      <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        Nenhum produto disponível nesta loja.
      </Typography>
    );
  }
  return (
    <Box
      component="ul"
      aria-label="Categorias do cardápio"
      sx={{
        listStyle: 'none',
        p: 0,
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(180px, 1fr))' },
        gap: 1.5,
      }}
    >
      {categories.map((category) => {
        const count = counts?.[category.id] || 0;
        return (
          <Box component="li" key={category.id} sx={{ minWidth: 0 }}>
            <ButtonBase
              onClick={() => onSelect(category.id)}
              aria-label={`Ver produtos de ${category.name}`}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)' },
              }}
            >
              <Box
                component="img"
                src={resolveMenuImage(category.image)}
                alt=""
                sx={{ display: 'block', width: '100%', height: { xs: 110, sm: 130 }, objectFit: 'cover', backgroundColor: 'var(--color-surface-muted, #f8fafc)' }}
              />
              <Box sx={{ px: 1.5, py: 1.1, backgroundColor: 'var(--color-primary)', color: '#fff', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25 }} noWrap title={category.name}>
                  {category.name}
                </Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.85 }}>
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
