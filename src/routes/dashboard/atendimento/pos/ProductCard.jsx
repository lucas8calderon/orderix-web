import AddIcon from '@mui/icons-material/Add';
import { Box, IconButton, Typography } from '@mui/material';
import { formatCurrency } from '../../../../services/accessControl';
import { resolveMenuImage } from '../../menu/utils/defaultMenuImage';
import { formatProductPrice } from '../../menu/utils/productVariations';
import { canAddProduct, productCode, productNeedsCustomization } from './catalogView';

function productSummary(product) {
  return String(product?.observation || product?.description || '').trim();
}

export function ProductCard({ product, highlighted = false, onAdd }) {
  const sellable = canAddProduct(product);
  const code = productCode(product);
  const summary = productSummary(product);
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.25,
        minWidth: 0,
        p: 1.25,
        borderRadius: '16px',
        border: '1px solid',
        borderColor: highlighted ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        opacity: sellable ? 1 : 0.72,
        boxShadow: highlighted ? '0 0 0 3px var(--color-primary-soft)' : 'var(--color-shadow)',
      }}
    >
      <Box sx={{ position: 'relative', flex: '0 0 auto', width: 80, height: 80 }}>
        <Box
          component="img"
          src={resolveMenuImage(product.image)}
          alt=""
          sx={{
            display: 'block',
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: '12px',
            backgroundColor: 'var(--color-surface-muted)',
          }}
        />
        {code ? (
          <Box
            component="span"
            title={code}
            sx={{
              position: 'absolute',
              left: 6,
              top: 6,
              maxWidth: 'calc(100% - 12px)',
              px: 0.6,
              py: 0.15,
              borderRadius: '6px',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.3,
              color: '#fff',
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {code}
          </Box>
        ) : null}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          title={product.name}
          noWrap
          sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: 'var(--color-text-primary)' }}
        >
          {product.name}
        </Typography>
        {!sellable ? (
          <Typography sx={{ mt: 0.25, fontSize: 12, fontWeight: 700, lineHeight: 1.3, color: 'var(--status-danger-text)' }}>
            Indisponível
          </Typography>
        ) : null}
        {summary ? (
          <Typography
            title={summary}
            sx={{
              mt: 0.25,
              fontSize: 12,
              lineHeight: 1.35,
              color: 'var(--color-text-secondary)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {summary}
          </Typography>
        ) : null}
        <Typography sx={{ mt: 0.5, fontWeight: 800, fontSize: 15, lineHeight: 1.2, color: 'var(--color-text-primary)' }}>
          {formatProductPrice(product, formatCurrency)}
        </Typography>
      </Box>

      <IconButton
        aria-label={actionLabel}
        disabled={!sellable}
        onClick={() => onAdd?.(product)}
        sx={{
          flex: '0 0 auto',
          width: 36,
          height: 36,
          bgcolor: 'var(--color-primary-fixed)',
          color: 'var(--color-primary)',
          '&:hover': { bgcolor: 'var(--color-primary)', color: 'var(--color-on-primary)' },
          '&.Mui-disabled': {
            bgcolor: 'var(--color-surface-muted)',
            color: 'var(--color-text-secondary)',
          },
        }}
      >
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
