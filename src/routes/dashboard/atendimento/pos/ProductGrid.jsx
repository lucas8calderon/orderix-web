import { Box, Typography } from '@mui/material';
import { ProductCard } from './ProductCard';

const gridSx = {
  listStyle: 'none',
  p: 0,
  m: 0,
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(160px, 1fr))' },
  gap: 1.5,
};

function Cards({ products, highlightedId, onAdd, label }) {
  return (
    <Box component="ul" aria-label={label} sx={gridSx}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          highlighted={String(highlightedId) === String(product.id)}
          onAdd={onAdd}
        />
      ))}
    </Box>
  );
}

export function ProductGrid({ products, groups, highlightedId, query, categorySelected, onAdd }) {
  if (!products.length) {
    const message = query.trim()
      ? `Nenhum produto encontrado para “${query.trim()}”.`
      : categorySelected
        ? 'Nenhum produto nesta categoria.'
        : 'Nenhum produto disponível nesta loja.';
    return (
      <Typography aria-live="polite" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        {message}
      </Typography>
    );
  }

  if (groups && groups.length > 1) {
    return (
      <Box aria-label="Produtos" role="group" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {groups.map((group) => (
          <Box key={group.id} component="section" aria-labelledby={`pos-group-${group.id}`}>
            <Typography
              id={`pos-group-${group.id}`}
              component="h3"
              sx={{ fontWeight: 800, fontSize: 15, mb: 1, color: 'var(--color-text-secondary)' }}
            >
              {group.name}
            </Typography>
            <Cards products={group.products} highlightedId={highlightedId} onAdd={onAdd} label={group.name} />
          </Box>
        ))}
      </Box>
    );
  }

  return <Cards products={products} highlightedId={highlightedId} onAdd={onAdd} label="Produtos" />;
}
