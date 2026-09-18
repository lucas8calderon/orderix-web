import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Chip,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import { getPublicMenuBySlug } from '../../services/publicMenuService';
import { API_BASE_URL } from '../../services/apiConfig';
import { defaultMenuImage, DEFAULT_MENU_IMAGE_PATH } from '../dashboard/menu/utils/defaultMenuImage';
import './PublicMenu.css';

function resolvePublicImage(image) {
  if (!image || !String(image).trim() || image === DEFAULT_MENU_IMAGE_PATH) {
    return defaultMenuImage;
  }
  const value = String(image).trim();
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  if (value.startsWith('/')) {
    return `${API_BASE_URL}${value}`;
  }
  return value;
}

function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PublicMenu() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setMenu(null);
    setActiveCategoryId(null);

    getPublicMenuBySlug(slug)
      .then((response) => {
        if (cancelled) return;
        if (response.status === 304 || !response.data) {
          setNotFound(true);
          return;
        }
        setMenu(response.data);
        const firstId = response.data.categories?.[0]?.id ?? null;
        setActiveCategoryId(firstId);
        if (response.data.storeName) {
          document.title = `${response.data.storeName} · Cardápio`;
        }
      })
      .catch((error) => {
        if (cancelled) return;
        if (error?.response?.status === 404) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visibleCategories = useMemo(() => {
    if (!menu?.categories?.length) return [];
    if (!activeCategoryId) return menu.categories;
    const selected = menu.categories.find((c) => c.id === activeCategoryId);
    return selected ? [selected] : menu.categories;
  }, [menu, activeCategoryId]);

  if (loading) {
    return (
      <Box className="public-menu-state">
        <CircularProgress sx={{ color: 'var(--color-primary)' }} />
      </Box>
    );
  }

  if (notFound || !menu) {
    return (
      <Box className="public-menu-state">
        <Typography variant="h5" className="public-menu-empty-title">
          Cardápio indisponível
        </Typography>
        <Typography color="text.secondary">
          Este cardápio não está publicado ou o link é inválido.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="public-menu-page">
      <header className="public-menu-header">
        <Container maxWidth="sm">
          <Typography component="h1" className="public-menu-store-name">
            {menu.storeName}
          </Typography>
          <Typography className="public-menu-subtitle">Cardápio digital</Typography>
        </Container>
      </header>

      {menu.categories?.length > 0 && (
        <Box className="public-menu-chips" role="navigation" aria-label="Categorias">
          <Container maxWidth="sm" className="public-menu-chips-inner">
            {menu.categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                clickable
                color={category.id === activeCategoryId ? 'primary' : 'default'}
                onClick={() => setActiveCategoryId(category.id)}
                className="public-menu-chip"
              />
            ))}
          </Container>
        </Box>
      )}

      <Container maxWidth="sm" className="public-menu-content">
        {visibleCategories.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            Nenhum item disponível no momento.
          </Typography>
        ) : (
          visibleCategories.map((category) => (
            <section key={category.id} className="public-menu-section">
              <Typography component="h2" className="public-menu-category-title">
                {category.name}
              </Typography>
              <Box className="public-menu-product-list">
                {(category.products || []).map((product) => (
                  <article
                    key={product.id}
                    className={`public-menu-product${product.isAvailable === false ? ' is-unavailable' : ''}`}
                  >
                    <img
                      src={resolvePublicImage(product.image)}
                      alt=""
                      className="public-menu-product-image"
                      loading="lazy"
                    />
                    <Box className="public-menu-product-body">
                      <Box className="public-menu-product-top">
                        <Typography className="public-menu-product-name">{product.name}</Typography>
                        <Typography className="public-menu-product-price">
                          {formatPrice(product.value)}
                        </Typography>
                      </Box>
                      {product.portion ? (
                        <Typography className="public-menu-product-meta">{product.portion}</Typography>
                      ) : null}
                      {product.observation ? (
                        <Typography className="public-menu-product-obs">{product.observation}</Typography>
                      ) : null}
                      {product.isAvailable === false ? (
                        <Typography className="public-menu-unavailable-label">Indisponível</Typography>
                      ) : null}
                    </Box>
                  </article>
                ))}
              </Box>
            </section>
          ))
        )}
      </Container>
    </Box>
  );
}
