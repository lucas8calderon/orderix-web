import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from 'lucide-react';
import { getPublicMenuBySlug } from '../../services/publicMenuService';
import { API_BASE_URL } from '../../services/apiConfig';
import { scheduleForDisplay } from '../../services/storeHoursService';
import StoreClosedHoursCard from '../../commons/components/StoreClosedHoursCard';
import { defaultMenuImage, DEFAULT_MENU_IMAGE_PATH } from '../dashboard/menu/utils/defaultMenuImage';
import PublicMenuProductCard from './components/PublicMenuProductCard';
import SelectionStateFilter from './components/SelectionStateFilter';
import SelectionBottomBar from './components/SelectionBottomBar';
import MySelectionPanel from './components/MySelectionPanel';
import { useMenuSelection } from './selection/useMenuSelection';
import { DIGITAL_MENU_EVENTS, trackDigitalMenuEvent } from './selection/menuSelectionAnalytics';
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

export default function PublicMenu() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'selected' — filtro de estado, NÃO categoria
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const storeKey = menu?.slug || slug;
  const selection = useMenuSelection(storeKey, menu?.categories || [], {
    catalogReady: Boolean(menu),
  });

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
    setViewMode('all');
    setSearchQuery('');
    setSelectionOpen(false);

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

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    if (!menu?.categories?.length) return [];

    const matchSearch = (product) => {
      if (!normalizedQuery) return true;
      const hay = `${product.name || ''} ${product.observation || ''} ${product.portion || ''}`.toLowerCase();
      return hay.includes(normalizedQuery);
    };

    if (viewMode === 'selected') {
      const selectedIds = new Set(selection.items.map((i) => String(i.productId)));
      return menu.categories
        .map((category) => ({
          ...category,
          products: (category.products || []).filter(
            (product) => selectedIds.has(String(product.id)) && matchSearch(product)
          ),
        }))
        .filter((category) => category.products.length > 0);
    }

    const source = activeCategoryId
      ? menu.categories.filter((c) => c.id === activeCategoryId)
      : menu.categories;

    return source
      .map((category) => ({
        ...category,
        products: (category.products || []).filter(matchSearch),
      }))
      .filter((category) => category.products.length > 0);
  }, [menu, activeCategoryId, viewMode, normalizedQuery, selection.items]);

  const isOpen = Boolean(menu?.open);
  const scheduleRows = scheduleForDisplay(menu?.schedule);
  const hasSelectionBar = selection.selectedCount > 0;

  const openSelection = () => {
    setSelectionOpen(true);
    trackDigitalMenuEvent(DIGITAL_MENU_EVENTS.SELECTION_OPENED, {
      storeId: storeKey,
      count: selection.selectedCount,
    });
  };

  const handleIncrease = (productId) => {
    const product = selection.productById.get(String(productId))
      ?? selection.productById.get(productId);
    selection.increaseQuantity(productId, {
      available: product?.isAvailable !== false,
    });
  };

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
    <Box className={`public-menu-page${hasSelectionBar ? ' has-selection-bar' : ''}`}>
      <header className="public-menu-header">
        <Container maxWidth="sm">
          <Box className="public-menu-store-row">
            <Typography component="h1" className="public-menu-store-name">
              {menu.storeName}
            </Typography>
            <Chip
              label={isOpen ? 'Aberto' : 'Fechado'}
              size="small"
              className={`public-menu-status-chip ${isOpen ? 'is-open' : 'is-closed'}`}
            />
          </Box>
          <Typography className="public-menu-subtitle">Cardápio digital</Typography>
        </Container>
      </header>

      {!isOpen ? (
        <Container maxWidth="sm">
          <StoreClosedHoursCard
            title="O estabelecimento está fechado no momento"
            copy="Você pode ver o cardápio, mas não é possível enviar pedido."
            scheduleRows={scheduleRows}
            variant="menu"
          />
        </Container>
      ) : null}

      <Container maxWidth="sm" className="public-menu-toolbar">
        <TextField
          fullWidth
          size="small"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar no cardápio"
          inputProps={{ 'aria-label': 'Buscar no cardápio' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} aria-hidden="true" />
              </InputAdornment>
            ),
          }}
        />
        <SelectionStateFilter
          mode={viewMode}
          selectedCount={selection.selectedCount}
          onChange={setViewMode}
        />
      </Container>

      {viewMode === 'all' && menu.categories?.length > 0 ? (
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
      ) : null}

      <Container maxWidth="sm" className="public-menu-content">
        {visibleCategories.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {viewMode === 'selected'
              ? (selection.selectedCount === 0
                ? 'Nenhum item selecionado ainda.'
                : 'Nenhum item selecionado corresponde à busca.')
              : 'Nenhum item disponível no momento.'}
          </Typography>
        ) : (
          visibleCategories.map((category) => (
            <section key={category.id} className="public-menu-section">
              <Typography component="h2" className="public-menu-category-title">
                {category.name}
              </Typography>
              <Box className="public-menu-product-list">
                {(category.products || []).map((product) => (
                  <PublicMenuProductCard
                    key={product.id}
                    product={product}
                    imageSrc={resolvePublicImage(product.image)}
                    selected={selection.isSelected(product.id)}
                    quantity={selection.quantityOf(product.id)}
                    onSelect={selection.selectProduct}
                    onIncrease={handleIncrease}
                    onDecrease={selection.decreaseQuantity}
                    onRemove={selection.removeProduct}
                  />
                ))}
              </Box>
            </section>
          ))
        )}
      </Container>

      <SelectionBottomBar
        itemCount={selection.selectedCount}
        onOpen={openSelection}
      />

      <MySelectionPanel
        open={selectionOpen}
        onClose={() => setSelectionOpen(false)}
        selectedItems={selection.selectedItems}
        selectedCount={selection.selectedCount}
        estimatedTotal={selection.estimatedTotal}
        onIncrease={handleIncrease}
        onDecrease={selection.decreaseQuantity}
        onRemove={selection.removeProduct}
        onClear={() => {
          selection.clearSelection();
          setSelectionOpen(false);
        }}
        onRequestClearConfirm={() => setClearConfirmOpen(true)}
      />

      <Dialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        aria-labelledby="clear-selection-title"
      >
        <DialogTitle id="clear-selection-title">Limpar seleção?</DialogTitle>
        <DialogContent>
          <Typography>
            Remover todos os {selection.selectedCount} itens da sua seleção?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearConfirmOpen(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              selection.clearSelection();
              setClearConfirmOpen(false);
              setSelectionOpen(false);
            }}
          >
            Limpar seleção
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
