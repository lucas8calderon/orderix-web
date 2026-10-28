import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton, Typography } from '@mui/material';
import { formatCurrency } from '../../../../services/accessControl';
import { resolveMenuImage } from '../../menu/utils/defaultMenuImage';
import { formatProductPrice } from '../../menu/utils/productVariations';
import { canAddProduct, productCode, productNeedsCustomization } from './catalogView';

export function ProductCard({ product, highlighted = false, onAdd }) {
  const sellable = canAddProduct(product);
  const code = productCode(product);
  const custom = productNeedsCustomization(product);
  const actionLabel = sellable
    ? (custom ? `Personalizar ${product.name}` : `Adicionar ${product.name}`)
    : `${product.name} indisponível`;

  return (
    <Box
      component="li"
      className={highlighted ? 'counter-product is-added' : 'counter-product'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: highlighted ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        overflow: 'hidden',
        opacity: sellable ? 1 : 0.72,
        boxShadow: highlighted ? '0 0 0 3px var(--color-primary-soft)' : 'none',
      }}
    >
      <Box sx={{ position: 'relative', backgroundColor: 'var(--color-surface-muted, #f8fafc)' }}>
        <Box
          component="img"
          src={resolveMenuImage(product.image)}
          alt=""
          sx={{
            display: 'block',
            width: '100%',
            height: 132,
            objectFit: 'contain',
          }}
        />
        {!sellable ? (
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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, p: 1.25, pt: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }} noWrap title={product.name}>
            {product.name}
          </Typography>
          {code ? (
            <Typography variant="caption" color="text.secondary" noWrap>
              {code}
            </Typography>
          ) : null}
          <Typography sx={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 14 }}>
            {formatProductPrice(product, formatCurrency)}
          </Typography>
        </Box>
        <IconButton
          aria-label={actionLabel}
          disabled={!sellable}
          onClick={() => onAdd?.(product)}
          sx={{
            width: 36,
            height: 36,
            bgcolor: sellable ? 'var(--color-primary)' : 'transparent',
            color: sellable ? '#fff' : 'text.disabled',
            '&:hover': { bgcolor: 'var(--color-primary-dark)' },
            '&.Mui-disabled': { bgcolor: 'var(--color-surface-muted, #f1f5f9)' },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
