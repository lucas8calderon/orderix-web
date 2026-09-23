import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Snackbar,
  TextField,
  Typography,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatCurrency } from '../../services/accessControl';
import { formatDayHours, scheduleForDisplay } from '../../services/storeHoursService';
import { createDeliveryOrder, getDeliveryCatalog } from '../../services/deliveryService';
import { createDeliveryPixPayment } from '../../services/deliveryPaymentService';
import DeliveryCardCheckout from './components/DeliveryCardCheckout';
import { listDeliveryCustomerAddresses } from '../../services/deliveryCustomerService';
import { readDeliveryCustomerSession } from '../../services/deliveryCustomerSession';
import { cepDigits, formatCepInput, isValidCep } from '../../utils/cepInput';
import { formatPhoneInput, isValidBrazilianPhone, phoneDigits } from '../../utils/phoneInput';
import { CEP_NOT_FOUND, lookupCep } from '../../services/viaCepService';
import {
  addCartItem,
  cartTotals,
  clearCart,
  readCart,
  removeCartItem,
  updateCartQuantity,
  writeCart,
} from '../../services/deliveryCart';
import { readLastOrder, writeLastOrder } from '../../services/deliveryLastOrder';
import useCategoryScrollSpy from './hooks/useCategoryScrollSpy';
import DeliveryBottomNav from './components/DeliveryBottomNav';
import DeliveryCartBar from './components/DeliveryCartBar';
import DeliveryCartPanel from './components/DeliveryCartPanel';
import DeliveryCategoryNav from './components/DeliveryCategoryNav';
import DeliveryFeaturedRow from './components/DeliveryFeaturedRow';
import DeliveryMenuSearch from './components/DeliveryMenuSearch';
import DeliveryMenuSkeleton from './components/DeliveryMenuSkeleton';
import DeliveryProductCard from './components/DeliveryProductCard';
import DeliveryPromoBanners from './components/DeliveryPromoBanners';
import DeliveryStoreHeader from './components/DeliveryStoreHeader';
import DeliveryAccountBar from './components/DeliveryAccountBar';
import DeliveryAuthDialog from './components/DeliveryAuthDialog';
import DeliveryPaymentGroups from './components/DeliveryPaymentGroups';
import DeliveryPixCheckout from './components/DeliveryPixCheckout';
import { collectFeaturedProducts, collectPromoBanners } from './utils/catalogHighlights';
import { draftLineTotal } from './utils/draftLineTotal';
import {
  defaultFulfillment,
  offersDelivery,
  resolveFulfillmentModes,
} from './utils/fulfillmentModes';
import { productTags, resolveDeliveryImage } from './utils/resolveDeliveryImage';
import './PublicDelivery.css';

const emptyCheckout = {
  customerName: '',
  customerPhone: '',
  fulfillment: 'DELIVERY',
  postalCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  reference: '',
  paymentMethod: 'PIX',
  onlinePayment: false,
  needsChange: false,
  changeFor: '',
  addressId: '',
  saveAddress: true,
};

export default function PublicDelivery() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(() => readCart(slug));
  const [lastOrder, setLastOrder] = useState(() => readLastOrder(slug));
  const [selected, setSelected] = useState(null);
  const [draftQty, setDraftQty] = useState(1);
  const [draftObs, setDraftObs] = useState('');
  const [draftExtras, setDraftExtras] = useState({});
  const [draftSelections, setDraftSelections] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkout, setCheckout] = useState(emptyCheckout);
  const [checkoutError, setCheckoutError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [customer, setCustomer] = useState(() => readDeliveryCustomerSession());
  const [addresses, setAddresses] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [cepLookup, setCepLookup] = useState({ status: 'idle', message: '' });
  const lastLookedUpCep = useRef('');
  const [pixOpen, setPixOpen] = useState(false);
  const [pixPayment, setPixPayment] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [cardOrder, setCardOrder] = useState(null);
  const [pixError, setPixError] = useState('');
  const [pixCreating, setPixCreating] = useState(false);

  useEffect(() => {
    const sync = () => setCustomer(readDeliveryCustomerSession());
    window.addEventListener('weper-delivery-customer-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('weper-delivery-customer-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    getDeliveryCatalog(slug)
      .then((response) => {
        if (!cancelled) {
          setCatalog(response.data);
          if (response.data?.storeName) {
            document.title = `${response.data.storeName} · Delivery`;
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setCatalog(null);
          setError(err?.response?.data?.message || 'Delivery indisponível no momento.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug, reloadToken]);

  const fulfillmentModes = useMemo(() => resolveFulfillmentModes(catalog), [catalog]);

  useEffect(() => {
    if (!catalog) return;
    setCheckout((prev) => {
      const nextMode = fulfillmentModes.includes(prev.fulfillment)
        ? prev.fulfillment
        : defaultFulfillment(fulfillmentModes);
      return nextMode === prev.fulfillment ? prev : { ...prev, fulfillment: nextMode };
    });
  }, [catalog, fulfillmentModes]);

  useEffect(() => {
    writeCart(slug, cart);
  }, [slug, cart]);

  useEffect(() => {
    setLastOrder(readLastOrder(slug));
  }, [slug]);

  useEffect(() => {
    if (!customer) {
      setAddresses([]);
      return undefined;
    }
    let cancelled = false;
    listDeliveryCustomerAddresses()
      .then((response) => {
        if (!cancelled) setAddresses(response.data || []);
      })
      .catch(() => {
        if (!cancelled) setAddresses([]);
      });
    return () => { cancelled = true; };
  }, [customer]);

  useEffect(() => {
    if (!checkoutOpen || !customer) return;
    setCheckout((prev) => {
      const next = { ...prev };
      if (!next.customerName) next.customerName = customer.name || '';
      if (!next.customerPhone) next.customerPhone = formatPhoneInput(customer.phone || '');
      const preferred = addresses.find((item) => item.isDefault) || addresses[0];
      const alreadyTypingAddress = Boolean(cepDigits(next.postalCode));
      if (preferred && !next.addressId && next.fulfillment === 'DELIVERY' && !alreadyTypingAddress) {
        next.addressId = String(preferred.id);
        next.postalCode = formatCepInput(preferred.postalCode || '');
        next.street = preferred.street || '';
        next.number = preferred.number || '';
        next.complement = preferred.complement || '';
        next.neighborhood = preferred.neighborhood || '';
        next.city = preferred.city || '';
        next.state = preferred.state || '';
        next.reference = preferred.reference || '';
        next.saveAddress = false;
      }
      return next;
    });
  }, [checkoutOpen, customer, addresses]);

  useEffect(() => {
    if (!checkoutOpen || checkout.fulfillment !== 'DELIVERY' || checkout.addressId) {
      setCepLookup({ status: 'idle', message: '' });
      return undefined;
    }
    const cep = cepDigits(checkout.postalCode);
    if (cep.length !== 8) {
      lastLookedUpCep.current = '';
      setCepLookup({ status: 'idle', message: '' });
      return undefined;
    }
    if (lastLookedUpCep.current === cep) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCepLookup({ status: 'loading', message: 'Consultando CEP...' });
      lookupCep(cep, { signal: controller.signal })
        .then((found) => {
          if (controller.signal.aborted) return;
          lastLookedUpCep.current = cep;
          setCheckout((prev) => {
            if (cepDigits(prev.postalCode) !== cep || prev.addressId) return prev;
            return {
              ...prev,
              postalCode: found.postalCode || prev.postalCode,
              street: found.street,
              neighborhood: found.neighborhood,
              city: found.city,
              state: found.state,
            };
          });
          setCepLookup({
            status: 'ok',
            message: found.street ? 'Endereço encontrado. Confira o número.' : 'CEP encontrado. Informe rua e número.',
          });
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          lastLookedUpCep.current = '';
          setCepLookup({
            status: 'error',
            message: err?.code === CEP_NOT_FOUND
              ? 'CEP não encontrado. Confira ou preencha o endereço.'
              : 'Não foi possível consultar o CEP. Preencha o endereço.',
          });
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [checkoutOpen, checkout.fulfillment, checkout.addressId, checkout.postalCode]);

  const filteredCategories = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (catalog?.categories || [])
      .map((category) => ({
        ...category,
        products: (category.products || []).filter((product) => {
          if (!term) return true;
          return `${product.name} ${product.observation || ''}`.toLowerCase().includes(term);
        }),
      }))
      .filter((category) => category.products.length > 0);
  }, [catalog, query]);

  const categoryIds = useMemo(
    () => filteredCategories.map((category) => category.id),
    [filteredCategories]
  );

  const { activeId, scrollToCategory } = useCategoryScrollSpy(categoryIds, {
    enabled: !loading && !query.trim() && categoryIds.length > 0,
  });

  const featuredProducts = useMemo(() => collectFeaturedProducts(catalog), [catalog]);
  const promoBanners = useMemo(() => collectPromoBanners(catalog), [catalog]);
  const totals = cartTotals(cart, {
    deliveryFee: catalog?.deliveryFee,
    fulfillment: checkout.fulfillment,
  });
  const closed = catalog && (!catalog.acceptingOrders || !catalog.open);
  const selectedTotal = selected ? draftLineTotal(selected, draftQty, draftExtras, draftSelections) : 0;
  const storePrimary = catalog?.primaryColor || catalog?.themeColor;
  const deliverySelected = checkout.fulfillment === 'DELIVERY' && offersDelivery(fulfillmentModes);

  const openProduct = (product) => {
    if (product.isAvailable === false || closed) return;
    setSelected(product);
    setDraftQty(1);
    setDraftObs('');
    setDraftExtras({});
    setDraftSelections({});
  };

  const addSelected = () => {
    const extras = (selected.extras || [])
      .filter((extra) => draftExtras[extra.id])
      .map((extra) => ({
        productExtraId: extra.id,
        name: extra.name,
        price: extra.price,
        quantity: 1,
      }));
    const mandatorySelections = (selected.mandatoryGroups || [])
      .map((group) => {
        const selectedItemId = draftSelections[group.id];
        const item = (group.items || []).find((entry) => String(entry.id) === String(selectedItemId));
        if (!item) return null;
        return {
          productId: selected.id,
          mandatoryGroupId: group.id,
          selectedItemId: item.id,
          price: item.price,
        };
      })
      .filter(Boolean);
    if ((selected.mandatoryGroups || []).length && mandatorySelections.length !== selected.mandatoryGroups.length) {
      return;
    }
    setCart((prev) => addCartItem(prev, {
      productId: selected.id,
      name: selected.name,
      unitPrice: selected.value,
      quantity: draftQty,
      observation: draftObs.trim(),
      extras,
      mandatorySelections,
    }));
    setSelected(null);
    setToast({ open: true, message: 'Adicionado ao carrinho' });
  };

  const openAuthenticatedCheckout = () => {
    setCheckout((prev) => ({
      ...prev,
      onlinePayment: Boolean(catalog?.onlinePixEnabled),
      paymentMethod: 'PIX',
    }));
    setCheckoutOpen(true);
  };

  const beginCheckout = () => {
    setCartOpen(false);
    if (!customer) {
      setPendingCheckout(true);
      setAuthOpen(true);
      return;
    }
    openAuthenticatedCheckout();
  };

  const validateCheckout = () => {
    if (!customer) return 'Entre ou crie uma conta para continuar.';
    if (!checkout.customerName.trim()) return 'Informe o nome.';
    if (!isValidBrazilianPhone(checkout.customerPhone)) return 'Informe um telefone válido.';
    if (deliverySelected) {
      if (!isValidCep(checkout.postalCode)) return 'Informe um CEP válido.';
      if (!checkout.street.trim() || !checkout.number.trim() || !checkout.neighborhood.trim() || !checkout.city.trim() || checkout.state.trim().length !== 2) {
        return 'Preencha o endereço de entrega.';
      }
    }
    if (Number(catalog?.minOrder || 0) > 0 && totals.subtotal < Number(catalog.minOrder)) {
      return `Pedido mínimo de ${formatCurrency(catalog.minOrder)}.`;
    }
    if (checkout.paymentMethod === 'CASH' && checkout.needsChange) {
      const changeFor = Number(checkout.changeFor);
      if (!(changeFor > totals.total)) return 'O troco precisa ser maior que o total.';
    }
    return '';
  };

  const submitOrder = async () => {
    const message = validateCheckout();
    if (message) {
      setCheckoutError(message);
      return;
    }
    setSubmitting(true);
    setCheckoutError('');
    try {
      const payload = {
        customerName: checkout.customerName.trim(),
        customerPhone: phoneDigits(checkout.customerPhone),
        fulfillment: checkout.fulfillment,
        paymentMethod: checkout.paymentMethod,
        onlinePayment: Boolean(
          (catalog?.onlinePixEnabled && checkout.onlinePayment && checkout.paymentMethod === 'PIX')
          || (catalog?.onlineCardEnabled && checkout.onlinePayment && checkout.paymentMethod === 'CREDIT')
        ),
        changeFor: !checkout.onlinePayment && checkout.paymentMethod === 'CASH' && checkout.needsChange
          ? Number(checkout.changeFor)
          : null,
        postalCode: cepDigits(checkout.postalCode),
        street: checkout.street,
        number: checkout.number,
        complement: checkout.complement,
        neighborhood: checkout.neighborhood,
        city: checkout.city,
        state: checkout.state,
        reference: checkout.reference,
        addressId: checkout.addressId ? Number(checkout.addressId) : null,
        saveAddress: Boolean(customer) && deliverySelected && !checkout.addressId && checkout.saveAddress,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          observation: item.observation,
          extras: (item.extras || []).map((extra) => ({
            productExtraId: extra.productExtraId,
            quantity: extra.quantity || 1,
          })),
          mandatorySelections: (item.mandatorySelections || []).map((selection) => ({
            productId: selection.productId,
            mandatoryGroupId: selection.mandatoryGroupId,
            selectedItemId: selection.selectedItemId,
          })),
        })),
      };
      const idempotencyKey = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      const response = await createDeliveryOrder(slug, payload, idempotencyKey);
      const publicToken = response.data?.publicToken;
      if (publicToken) {
        writeLastOrder(slug, {
          token: publicToken,
          orderId: response.data?.id ?? null,
          createdAt: new Date().toISOString(),
        });
        setLastOrder(readLastOrder(slug));
      }
      clearCart(slug);
      setCart({ items: [] });
      setCheckoutOpen(false);
      setCartOpen(false);
      const onlineCard = Boolean(catalog?.onlineCardEnabled && checkout.onlinePayment && checkout.paymentMethod === 'CREDIT');
      if (onlineCard && response.data?.id) {
        setCardOrder({
          orderId: response.data.id,
          publicToken,
          amount: response.data.total ?? totals.total,
        });
        setCardOpen(true);
        return;
      }
      if (payload.onlinePayment && response.data?.id) {
        setPixOpen(true);
        setPixCreating(true);
        setPixError('');
        // Mantém orderId/token mesmo se a cobrança falhar, para permitir "Gerar novo Pix".
        setPixPayment({ orderId: response.data.id, publicToken });
        try {
          const pixKey = (window.crypto && window.crypto.randomUUID)
            ? window.crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;
          const pix = await createDeliveryPixPayment(slug, response.data.id, pixKey);
          setPixPayment({ ...pix.data, publicToken });
        } catch (pixErr) {
          setPixError(pixErr?.response?.data?.message || 'Não foi possível gerar o Pix.');
        } finally {
          setPixCreating(false);
        }
        return;
      }
      navigate(`/delivery/pedido/${publicToken}`, { state: { order: response.data, slug } });
    } catch (err) {
      setCheckoutError(err?.response?.data?.message || 'Não foi possível enviar o pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <DeliveryMenuSkeleton />;
  }

  if (error || !catalog) {
    return (
      <Box className="delivery-state">
        <Typography variant="h5">Delivery indisponível</Typography>
        <Typography color="text.secondary">{error || 'Esta loja não está atendendo por delivery.'}</Typography>
        <Button variant="contained" onClick={() => setReloadToken((value) => value + 1)}>
          Tentar de novo
        </Button>
      </Box>
    );
  }

  const scheduleRows = scheduleForDisplay(catalog.schedule);
  const navCategories = query.trim() ? [] : (catalog.categories || []).filter((category) => (category.products || []).length > 0);
  const pageClass = [
    'delivery-page',
    'has-bottom-nav',
    totals.itemCount > 0 && !isDesktop ? 'has-cart-bar' : '',
  ].filter(Boolean).join(' ');
  const goToOrders = () => {
    if (customer) {
      navigate(`/delivery/${encodeURIComponent(slug)}/conta/pedidos`);
      return;
    }
    if (lastOrder?.token) {
      navigate(`/delivery/pedido/${lastOrder.token}`);
      return;
    }
    setAuthOpen(true);
  };

  return (
    <Box
      className={pageClass}
      style={storePrimary ? { '--delivery-primary': storePrimary } : undefined}
    >
      <DeliveryStoreHeader
        catalog={catalog}
        fulfillmentModes={fulfillmentModes}
        accountSlot={<DeliveryAccountBar slug={slug} variant="header" />}
      />

      <div className="delivery-shell">
        <div className="delivery-layout">
          <div className="delivery-main">
            {closed ? (
              <Box className="delivery-closed-banner" role="status">
                <Typography className="delivery-closed-title">Loja fechada</Typography>
                <Typography className="delivery-closed-copy">
                  Você pode ver o cardápio, mas não é possível enviar pedido agora.
                </Typography>
                {scheduleRows.length > 0 ? (
                  <Box className="delivery-hours-list" aria-label="Horários de funcionamento">
                    {scheduleRows.map((day) => (
                      <Box key={day.id} className="delivery-hours-row">
                        <Typography component="span" className="delivery-hours-day">
                          {day.label}
                        </Typography>
                        <Typography component="span" className="delivery-hours-value">
                          {formatDayHours(day)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Box>
            ) : null}

            <DeliveryMenuSearch value={query} onChange={setQuery} />

            {!query.trim() && navCategories.length > 0 ? (
              <DeliveryCategoryNav
                categories={navCategories}
                activeId={activeId}
                onSelect={scrollToCategory}
              />
            ) : null}

            {!query.trim() ? <DeliveryFeaturedRow products={featuredProducts} disabled={Boolean(closed)} onOpen={openProduct} /> : null}
            {!query.trim() ? <DeliveryPromoBanners banners={promoBanners} /> : null}

            <main className="delivery-menu-content">
              {filteredCategories.length === 0 ? (
                <div className="delivery-empty-state">
                  <Typography className="delivery-empty-title">
                    {query.trim() ? 'Nenhum produto encontrado' : 'Cardápio vazio'}
                  </Typography>
                  <Typography className="delivery-empty-copy">
                    {query.trim()
                      ? 'Tente outro termo ou limpe a busca.'
                      : 'Esta loja ainda não publicou itens para delivery.'}
                  </Typography>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <section
                    key={category.id}
                    id={`delivery-cat-${category.id}`}
                    data-category-id={category.id}
                    className="delivery-menu-section"
                  >
                    <div className="delivery-section-head">
                      <h2 className="delivery-section-title">{category.name}</h2>
                      <span className="delivery-section-count">
                        {category.products.length}
                        {' '}
                        {category.products.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <div className="delivery-product-grid">
                      {category.products.map((product) => (
                        <DeliveryProductCard
                          key={product.id}
                          product={product}
                          disabled={Boolean(closed)}
                          onOpen={openProduct}
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </main>
          </div>

          {isDesktop ? (
            <aside className="delivery-aside" aria-label="Seu pedido">
              <div className="delivery-aside-card">
                <Typography className="delivery-aside-title" component="h2">Seu pedido</Typography>
                <DeliveryCartPanel
                  items={cart.items}
                  totals={totals}
                  closed={closed}
                  showContinue={false}
                  onQuantity={(key, quantity) => setCart((prev) => updateCartQuantity(prev, key, quantity))}
                  onRemove={(key) => setCart((prev) => removeCartItem(prev, key))}
                  onClear={() => { clearCart(slug); setCart({ items: [] }); }}
                  onCheckout={beginCheckout}
                />
              </div>
            </aside>
          ) : null}
        </div>
      </div>

      {!isDesktop ? (
        <DeliveryCartBar
          itemCount={totals.itemCount}
          total={totals.total}
          onOpen={() => setCartOpen(true)}
        />
      ) : null}

      <DeliveryBottomNav
        slug={slug}
        active="menu"
        hasSession={Boolean(customer)}
        lastOrderToken={lastOrder?.token || ''}
        onAccount={() => {
          if (!customer) {
            setAuthOpen(true);
            return;
          }
          navigate(`/delivery/${encodeURIComponent(slug)}/conta`);
        }}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={2200}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: totals.itemCount > 0 ? 88 : 24, sm: totals.itemCount > 0 ? 96 : 24 } }}
      />

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        className="delivery-product-dialog"
        PaperProps={{ className: isMobile ? 'delivery-sheet-paper' : undefined }}
      >
        {selected ? (
          <>
            <div className="delivery-sheet-media">
              <img src={resolveDeliveryImage(selected.image)} alt={selected.name} loading="lazy" />
            </div>
            <DialogTitle className="delivery-sheet-title">{selected.name}</DialogTitle>
            <DialogContent className="delivery-sheet-content">
              {selected.observation ? (
                <Typography className="delivery-sheet-desc">{selected.observation}</Typography>
              ) : null}
              {productTags(selected).length > 0 ? (
                <div className="delivery-product-tags" style={{ marginBottom: 12 }}>
                  {productTags(selected).map((tag) => (
                    <span key={tag} className="delivery-product-tag">{tag}</span>
                  ))}
                </div>
              ) : null}
              <Typography className="delivery-sheet-price">{formatCurrency(selected.value)}</Typography>
              {(selected.mandatoryGroups || []).map((group) => (
                <Box key={group.id} sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2">{group.name}</Typography>
                  <RadioGroup
                    value={draftSelections[group.id] || ''}
                    onChange={(e) => setDraftSelections((prev) => ({ ...prev, [group.id]: e.target.value }))}
                  >
                    {(group.items || []).map((item) => (
                      <FormControlLabel
                        key={item.id}
                        value={String(item.id)}
                        control={<Radio />}
                        label={`${item.name}${item.price ? ` (+${formatCurrency(item.price)})` : ''}`}
                      />
                    ))}
                  </RadioGroup>
                </Box>
              ))}
              {(selected.extras || []).length > 0 ? (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Adicionais</Typography>
                  {(selected.extras || []).map((extra) => (
                    <FormControlLabel
                      key={extra.id}
                      control={(
                        <Checkbox
                          checked={Boolean(draftExtras[extra.id])}
                          onChange={() => setDraftExtras((prev) => ({ ...prev, [extra.id]: !prev[extra.id] }))}
                        />
                      )}
                      label={`${extra.name} (+${formatCurrency(extra.price)})`}
                    />
                  ))}
                </Box>
              ) : null}
              <TextField
                fullWidth
                label="Observações"
                value={draftObs}
                onChange={(e) => setDraftObs(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Box className="delivery-sheet-qty" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <IconButton onClick={() => setDraftQty((qty) => Math.max(1, qty - 1))} aria-label="Diminuir quantidade">
                  <RemoveIcon />
                </IconButton>
                <Typography aria-live="polite">{draftQty}</Typography>
                <IconButton onClick={() => setDraftQty((qty) => Math.min(20, qty + 1))} aria-label="Aumentar quantidade">
                  <AddIcon />
                </IconButton>
              </Box>
            </DialogContent>
            <DialogActions className="delivery-sheet-actions">
              <Button onClick={() => setSelected(null)}>Cancelar</Button>
              <Button variant="contained" onClick={addSelected}>
                Adicionar ao carrinho
                {' · '}
                {formatCurrency(selectedTotal)}
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Seu pedido</DialogTitle>
        <DialogContent>
          <DeliveryCartPanel
            items={cart.items}
            totals={totals}
            closed={closed}
            onQuantity={(key, quantity) => setCart((prev) => updateCartQuantity(prev, key, quantity))}
            onRemove={(key) => setCart((prev) => removeCartItem(prev, key))}
            onClear={() => { clearCart(slug); setCart({ items: [] }); }}
            onContinue={() => setCartOpen(false)}
            onCheckout={beginCheckout}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Checkout</DialogTitle>
        <DialogContent>
          {checkoutError ? <Alert severity="error" sx={{ mb: 2 }}>{checkoutError}</Alert> : null}
          {!customer ? (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={(
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setPendingCheckout(true);
                    setAuthOpen(true);
                  }}
                >
                  Entrar ou criar conta
                </Button>
              )}
            >
              Entre ou crie uma conta para informar o endereço de entrega.
            </Alert>
          ) : null}
          {customer ? (
            <>
          {fulfillmentModes.length > 1 ? (
            <FormControl sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Tipo do pedido</Typography>
              <RadioGroup
                row
                value={checkout.fulfillment}
                onChange={(e) => setCheckout((prev) => ({ ...prev, fulfillment: e.target.value }))}
              >
                {fulfillmentModes.includes('DELIVERY') ? (
                  <FormControlLabel value="DELIVERY" control={<Radio />} label="Entrega" />
                ) : null}
                {fulfillmentModes.includes('PICKUP') ? (
                  <FormControlLabel value="PICKUP" control={<Radio />} label="Retirada" />
                ) : null}
              </RadioGroup>
            </FormControl>
          ) : null}
          {!deliverySelected && catalog.storeAddress ? (
            <Box className="delivery-pickup-address" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Retirada na loja</Typography>
              <Typography className="delivery-pickup-address-text">{catalog.storeAddress}</Typography>
            </Box>
          ) : null}
          <TextField fullWidth label="Nome" sx={{ mb: 1.5 }} value={checkout.customerName} onChange={(e) => setCheckout((prev) => ({ ...prev, customerName: e.target.value }))} />
          <TextField
            fullWidth
            label="Telefone"
            sx={{ mb: 1.5 }}
            value={checkout.customerPhone}
            inputProps={{ inputMode: 'tel', maxLength: 15 }}
            placeholder="(11) 98888-8888"
            onChange={(e) => setCheckout((prev) => ({
              ...prev,
              customerPhone: formatPhoneInput(e.target.value),
            }))}
          />
          {deliverySelected ? (
            <>
              {addresses.length > 0 ? (
                <FormControl sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2">Endereço de entrega</Typography>
                  <RadioGroup
                    value={checkout.addressId || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const selectedAddress = addresses.find((item) => String(item.id) === value);
                      lastLookedUpCep.current = '';
                      setCheckout((prev) => ({
                        ...prev,
                        addressId: value,
                        saveAddress: !value,
                        postalCode: formatCepInput(selectedAddress?.postalCode || ''),
                        street: selectedAddress?.street || '',
                        number: selectedAddress?.number || '',
                        complement: selectedAddress?.complement || '',
                        neighborhood: selectedAddress?.neighborhood || '',
                        city: selectedAddress?.city || '',
                        state: selectedAddress?.state || '',
                        reference: selectedAddress?.reference || '',
                      }));
                    }}
                  >
                    {addresses.map((address) => (
                      <FormControlLabel
                        key={address.id}
                        value={String(address.id)}
                        control={<Radio />}
                        label={`${address.street}, ${address.number} — ${address.neighborhood}`}
                      />
                    ))}
                    <FormControlLabel value="" control={<Radio />} label="Cadastrar outro endereço" />
                  </RadioGroup>
                </FormControl>
              ) : (
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Cadastre o endereço de entrega</Typography>
              )}
              {!checkout.addressId ? (
                <>
                  <TextField
                    fullWidth
                    label="CEP"
                    sx={{ mb: 1.5 }}
                    value={checkout.postalCode}
                    placeholder="00000-000"
                    helperText={cepLookup.message || 'Digite o CEP para preencher o endereço'}
                    error={cepLookup.status === 'error'}
                    inputProps={{ inputMode: 'numeric', maxLength: 9 }}
                    InputProps={{
                      endAdornment: cepLookup.status === 'loading' ? (
                        <InputAdornment position="end">
                          <CircularProgress size={18} />
                        </InputAdornment>
                      ) : null,
                    }}
                    onChange={(e) => {
                      lastLookedUpCep.current = '';
                      const postalCode = formatCepInput(e.target.value);
                      setCheckout((prev) => {
                        const cepChanged = cepDigits(prev.postalCode) !== cepDigits(postalCode);
                        return {
                          ...prev,
                          postalCode,
                          addressId: '',
                          ...(cepChanged ? {
                            street: '',
                            neighborhood: '',
                            city: '',
                            state: '',
                            number: '',
                            complement: '',
                            reference: '',
                          } : {}),
                        };
                      });
                    }}
                  />
                  <TextField fullWidth label="Rua" sx={{ mb: 1.5 }} value={checkout.street} onChange={(e) => setCheckout((prev) => ({ ...prev, street: e.target.value, addressId: '' }))} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                    <TextField label="Número" value={checkout.number} onChange={(e) => setCheckout((prev) => ({ ...prev, number: e.target.value, addressId: '' }))} />
                    <TextField label="Complemento" value={checkout.complement} onChange={(e) => setCheckout((prev) => ({ ...prev, complement: e.target.value, addressId: '' }))} />
                  </Box>
                  <TextField fullWidth label="Bairro" sx={{ mb: 1.5 }} value={checkout.neighborhood} onChange={(e) => setCheckout((prev) => ({ ...prev, neighborhood: e.target.value, addressId: '' }))} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 1.5, mb: 1.5 }}>
                    <TextField label="Cidade" value={checkout.city} onChange={(e) => setCheckout((prev) => ({ ...prev, city: e.target.value, addressId: '' }))} />
                    <TextField
                      label="UF"
                      value={checkout.state}
                      inputProps={{ maxLength: 2 }}
                      onChange={(e) => setCheckout((prev) => ({
                        ...prev,
                        state: e.target.value.toUpperCase().slice(0, 2),
                        addressId: '',
                      }))}
                    />
                  </Box>
                  <TextField fullWidth label="Referência" sx={{ mb: 1.5 }} value={checkout.reference} onChange={(e) => setCheckout((prev) => ({ ...prev, reference: e.target.value, addressId: '' }))} />
                  <FormControlLabel
                    control={(
                      <Radio
                        checked={Boolean(checkout.saveAddress)}
                        onClick={() => setCheckout((prev) => ({ ...prev, saveAddress: !prev.saveAddress }))}
                      />
                    )}
                    label="Salvar este endereço na minha conta"
                    sx={{ mb: 1.5 }}
                  />
                </>
              ) : null}
            </>
          ) : null}
          <DeliveryPaymentGroups
            checkout={checkout}
            onChange={setCheckout}
            onlinePixEnabled={Boolean(catalog?.onlinePixEnabled)}
            onlineCardEnabled={Boolean(catalog?.onlineCardEnabled)}
            total={totals.total}
          />
          <Divider sx={{ my: 2 }} />
          <Box className="delivery-line"><span>Produtos</span><span>{formatCurrency(totals.subtotal)}</span></Box>
          <Box className="delivery-line"><span>Entrega</span><span>{formatCurrency(totals.deliveryFee)}</span></Box>
          <Box className="delivery-line"><strong>Total</strong><strong>{formatCurrency(totals.total)}</strong></Box>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)}>Voltar</Button>
          <Button variant="contained" disabled={submitting || closed || !customer} onClick={submitOrder}>
            {submitting ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        </DialogActions>
      </Dialog>
      <DeliveryPixCheckout
        open={pixOpen}
        payment={pixPayment}
        error={pixError}
        creating={pixCreating}
        onClose={() => setPixOpen(false)}
        onPaid={(paid) => {
          setPixOpen(false);
          const token = paid?.publicToken || pixPayment?.publicToken;
          if (token) {
            navigate(`/delivery/pedido/${token}`, { state: { slug } });
          }
        }}
        onRetry={async () => {
          if (!pixPayment?.orderId) return;
          setPixCreating(true);
          setPixError('');
          try {
            const pixKey = (window.crypto && window.crypto.randomUUID)
              ? window.crypto.randomUUID()
              : `${Date.now()}-${Math.random()}`;
            const pix = await createDeliveryPixPayment(slug, pixPayment.orderId, pixKey);
            setPixPayment({ ...pix.data, publicToken: pixPayment.publicToken });
          } catch (pixErr) {
            setPixError(pixErr?.response?.data?.message || 'Não foi possível gerar o Pix.');
          } finally {
            setPixCreating(false);
          }
        }}
      />
      <DeliveryCardCheckout
        open={cardOpen}
        slug={slug}
        orderId={cardOrder?.orderId}
        amount={cardOrder?.amount}
        publicKey={catalog?.mercadoPagoPublicKey}
        payerEmail={customer?.email}
        onClose={() => setCardOpen(false)}
        onApproved={() => {
          setCardOpen(false);
          if (cardOrder?.publicToken) {
            navigate(`/delivery/pedido/${cardOrder.publicToken}`, { state: { slug } });
          }
        }}
        onChooseOther={() => {
          setCardOpen(false);
          setCheckoutOpen(true);
        }}
      />
      <DeliveryAuthDialog
        open={authOpen}
        purpose={pendingCheckout ? 'checkout' : undefined}
        onClose={() => {
          setAuthOpen(false);
          setPendingCheckout(false);
        }}
        onAuthenticated={(next) => {
          setCustomer(next);
          setAuthOpen(false);
          if (pendingCheckout) {
            setPendingCheckout(false);
            openAuthenticatedCheckout();
          }
        }}
      />
    </Box>
  );
}
