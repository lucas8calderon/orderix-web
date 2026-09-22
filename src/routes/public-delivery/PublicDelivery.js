import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
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
import { listDeliveryCustomerAddresses } from '../../services/deliveryCustomerService';
import { readDeliveryCustomerSession } from '../../services/deliveryCustomerSession';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyInput';
import { formatPhoneInput, isValidBrazilianPhone, phoneDigits } from '../../utils/phoneInput';
import {
  addCartItem,
  cartTotals,
  clearCart,
  itemKey,
  lineTotal,
  readCart,
  removeCartItem,
  updateCartQuantity,
  writeCart,
} from '../../services/deliveryCart';
import { readLastOrder, writeLastOrder } from '../../services/deliveryLastOrder';
import useCategoryScrollSpy from './hooks/useCategoryScrollSpy';
import DeliveryCartBar from './components/DeliveryCartBar';
import DeliveryCategoryNav from './components/DeliveryCategoryNav';
import DeliveryMenuSearch from './components/DeliveryMenuSearch';
import DeliveryMenuSkeleton from './components/DeliveryMenuSkeleton';
import DeliveryProductCard from './components/DeliveryProductCard';
import DeliveryStoreHeader from './components/DeliveryStoreHeader';
import DeliveryAccountBar from './components/DeliveryAccountBar';
import DeliveryAuthDialog from './components/DeliveryAuthDialog';
import { resolveDeliveryImage } from './utils/resolveDeliveryImage';
import './PublicDelivery.css';

const PAYMENT_OPTIONS = [
  { id: 'PIX', label: 'PIX' },
  { id: 'CREDIT', label: 'Cartão de crédito' },
  { id: 'DEBIT', label: 'Cartão de débito' },
  { id: 'CASH', label: 'Dinheiro' },
];

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
  needsChange: false,
  changeFor: '',
  addressId: '',
  saveAddress: true,
};

export default function PublicDelivery() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
          setError(err?.response?.data?.message || 'Delivery indisponível no momento.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [slug]);

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
      if (preferred && !next.addressId && next.fulfillment === 'DELIVERY') {
        next.addressId = String(preferred.id);
        next.postalCode = preferred.postalCode || '';
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

  const totals = cartTotals(cart, {
    deliveryFee: catalog?.deliveryFee,
    fulfillment: checkout.fulfillment,
  });
  const closed = catalog && (!catalog.acceptingOrders || !catalog.open);

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

  const validateCheckout = () => {
    if (!checkout.customerName.trim()) return 'Informe o nome.';
    if (!isValidBrazilianPhone(checkout.customerPhone)) return 'Informe um telefone válido.';
    if (checkout.fulfillment === 'DELIVERY') {
      if (String(checkout.postalCode).replace(/\D/g, '').length !== 8) return 'Informe um CEP válido.';
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
        changeFor: checkout.paymentMethod === 'CASH' && checkout.needsChange
          ? Number(checkout.changeFor)
          : null,
        postalCode: checkout.postalCode,
        street: checkout.street,
        number: checkout.number,
        complement: checkout.complement,
        neighborhood: checkout.neighborhood,
        city: checkout.city,
        state: checkout.state,
        reference: checkout.reference,
        addressId: checkout.addressId ? Number(checkout.addressId) : null,
        saveAddress: Boolean(customer) && checkout.fulfillment === 'DELIVERY' && !checkout.addressId && checkout.saveAddress,
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
      navigate(`/delivery/pedido/${publicToken}`, { state: { order: response.data } });
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
      </Box>
    );
  }

  const scheduleRows = scheduleForDisplay(catalog.schedule);
  const navCategories = query.trim() ? [] : (catalog.categories || []).filter((category) => (category.products || []).length > 0);

  return (
    <Box className={`delivery-page${totals.itemCount > 0 ? ' has-cart-bar' : ''}`}>
      <DeliveryStoreHeader catalog={catalog} />

      <div className="delivery-shell">
        <DeliveryAccountBar slug={slug} />
        {lastOrder?.token || customer ? (
          <Box className="delivery-last-order-banner" role="navigation" aria-label="Pedidos">
            {customer ? (
              <button
                type="button"
                className="delivery-last-order-cta"
                onClick={() => navigate(`/delivery/${encodeURIComponent(slug)}/conta/pedidos`)}
              >
                Ver meus pedidos
              </button>
            ) : (
              <button
                type="button"
                className="delivery-last-order-cta"
                onClick={() => navigate(`/delivery/pedido/${lastOrder.token}`)}
              >
                Ver meu último pedido
              </button>
            )}
          </Box>
        ) : null}

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

      <DeliveryCartBar
        itemCount={totals.itemCount}
        total={totals.total}
        onOpen={() => setCartOpen(true)}
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
              <img src={resolveDeliveryImage(selected.image)} alt="" loading="lazy" />
            </div>
            <DialogTitle className="delivery-sheet-title">{selected.name}</DialogTitle>
            <DialogContent className="delivery-sheet-content">
              {selected.observation ? (
                <Typography className="delivery-sheet-desc">{selected.observation}</Typography>
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
              {(selected.extras || []).map((extra) => (
                <FormControlLabel
                  key={extra.id}
                  control={
                    <Radio
                      checked={Boolean(draftExtras[extra.id])}
                      onClick={() => setDraftExtras((prev) => ({ ...prev, [extra.id]: !prev[extra.id] }))}
                    />
                  }
                  label={`${extra.name} (+${formatCurrency(extra.price)})`}
                />
              ))}
              <TextField
                fullWidth
                label="Observações"
                value={draftObs}
                onChange={(e) => setDraftObs(e.target.value)}
                sx={{ mt: 2 }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <IconButton onClick={() => setDraftQty((qty) => Math.max(1, qty - 1))} aria-label="Diminuir quantidade">
                  <RemoveIcon />
                </IconButton>
                <Typography>{draftQty}</Typography>
                <IconButton onClick={() => setDraftQty((qty) => Math.min(20, qty + 1))} aria-label="Aumentar quantidade">
                  <AddIcon />
                </IconButton>
              </Box>
            </DialogContent>
            <DialogActions className="delivery-sheet-actions">
              <Button onClick={() => setSelected(null)}>Cancelar</Button>
              <Button variant="contained" onClick={addSelected}>Adicionar ao carrinho</Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      <Dialog open={cartOpen} onClose={() => setCartOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Seu pedido</DialogTitle>
        <DialogContent>
          {cart.items.map((item) => (
            <Box key={itemKey(item)} sx={{ mb: 2 }}>
              <Box className="delivery-line">
                <Typography fontWeight={700}>{item.quantity}x {item.name}</Typography>
                <Typography>{formatCurrency(lineTotal(item))}</Typography>
              </Box>
              {(item.extras || []).map((extra) => (
                <Typography key={extra.productExtraId} variant="caption" display="block">+ {extra.name}</Typography>
              ))}
              {item.observation ? <Typography variant="caption">Obs.: {item.observation}</Typography> : null}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => setCart((prev) => updateCartQuantity(prev, itemKey(item), item.quantity - 1))} aria-label="Diminuir">
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setCart((prev) => updateCartQuantity(prev, itemKey(item), item.quantity + 1))} aria-label="Aumentar">
                  <AddIcon fontSize="small" />
                </IconButton>
                <Button size="small" onClick={() => setCart((prev) => removeCartItem(prev, itemKey(item)))}>Remover</Button>
              </Box>
            </Box>
          ))}
          <Divider sx={{ my: 1 }} />
          <Box className="delivery-line"><span>Produtos</span><span>{formatCurrency(totals.subtotal)}</span></Box>
          <Box className="delivery-line"><span>Entrega</span><span>{formatCurrency(totals.deliveryFee)}</span></Box>
          <Box className="delivery-line"><strong>Total</strong><strong>{formatCurrency(totals.total)}</strong></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { clearCart(slug); setCart({ items: [] }); }}>Limpar</Button>
          <Button onClick={() => setCartOpen(false)}>Continuar comprando</Button>
          <Button
            variant="contained"
            disabled={closed || cart.items.length === 0}
            onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
          >
            Finalizar pedido
          </Button>
        </DialogActions>
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
                <Button color="inherit" size="small" onClick={() => setAuthOpen(true)}>
                  Entrar
                </Button>
              )}
            >
              Crie uma conta para salvar o endereço e acompanhar pedidos anteriores.
            </Alert>
          ) : null}
          <FormControl sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Tipo do pedido</Typography>
            <RadioGroup
              row
              value={checkout.fulfillment}
              onChange={(e) => setCheckout((prev) => ({ ...prev, fulfillment: e.target.value }))}
            >
              <FormControlLabel value="DELIVERY" control={<Radio />} label="Entrega" />
              <FormControlLabel value="PICKUP" control={<Radio />} label="Retirada" />
            </RadioGroup>
          </FormControl>
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
          {checkout.fulfillment === 'DELIVERY' ? (
            <>
              {addresses.length > 0 ? (
                <FormControl sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle2">Endereço salvo</Typography>
                  <RadioGroup
                    value={checkout.addressId || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const selectedAddress = addresses.find((item) => String(item.id) === value);
                      setCheckout((prev) => ({
                        ...prev,
                        addressId: value,
                        saveAddress: !value,
                        postalCode: selectedAddress?.postalCode || '',
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
                    <FormControlLabel value="" control={<Radio />} label="Usar outro endereço" />
                  </RadioGroup>
                </FormControl>
              ) : null}
              <TextField fullWidth label="CEP" sx={{ mb: 1.5 }} value={checkout.postalCode} onChange={(e) => setCheckout((prev) => ({ ...prev, postalCode: e.target.value, addressId: '' }))} />
              <TextField fullWidth label="Rua" sx={{ mb: 1.5 }} value={checkout.street} onChange={(e) => setCheckout((prev) => ({ ...prev, street: e.target.value }))} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
                <TextField label="Número" value={checkout.number} onChange={(e) => setCheckout((prev) => ({ ...prev, number: e.target.value }))} />
                <TextField label="Complemento" value={checkout.complement} onChange={(e) => setCheckout((prev) => ({ ...prev, complement: e.target.value }))} />
              </Box>
              <TextField fullWidth label="Bairro" sx={{ mb: 1.5 }} value={checkout.neighborhood} onChange={(e) => setCheckout((prev) => ({ ...prev, neighborhood: e.target.value }))} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 1.5, mb: 1.5 }}>
                <TextField label="Cidade" value={checkout.city} onChange={(e) => setCheckout((prev) => ({ ...prev, city: e.target.value }))} />
                <TextField label="UF" value={checkout.state} onChange={(e) => setCheckout((prev) => ({ ...prev, state: e.target.value }))} />
              </Box>
              <TextField fullWidth label="Referência" sx={{ mb: 1.5 }} value={checkout.reference} onChange={(e) => setCheckout((prev) => ({ ...prev, reference: e.target.value, addressId: '' }))} />
              {customer && !checkout.addressId ? (
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
              ) : null}
            </>
          ) : null}
          <Typography variant="subtitle2">Pagamento na entrega</Typography>
          <RadioGroup
            value={checkout.paymentMethod}
            onChange={(e) => setCheckout((prev) => ({ ...prev, paymentMethod: e.target.value, needsChange: e.target.value === 'CASH' ? prev.needsChange : false }))}
          >
            {PAYMENT_OPTIONS.map((option) => (
              <FormControlLabel key={option.id} value={option.id} control={<Radio />} label={option.label} />
            ))}
          </RadioGroup>
          {checkout.paymentMethod === 'CASH' ? (
            <>
              <FormControlLabel
                control={<Radio checked={checkout.needsChange} onClick={() => setCheckout((prev) => ({ ...prev, needsChange: !prev.needsChange }))} />}
                label="Precisa de troco?"
              />
              {checkout.needsChange ? (
                <TextField
                  fullWidth
                  label="Troco para quanto?"
                  placeholder="0,00"
                  value={formatCurrencyInput(checkout.changeFor)}
                  onChange={(e) => {
                    const parsed = parseCurrencyInput(e.target.value);
                    setCheckout((prev) => ({ ...prev, changeFor: parsed === '' ? '' : parsed }));
                  }}
                  autoComplete="off"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    'aria-label': 'Troco para quanto em reais',
                  }}
                  helperText={`Total ${formatCurrency(totals.total)}`}
                />
              ) : null}
            </>
          ) : null}
          <Divider sx={{ my: 2 }} />
          <Box className="delivery-line"><span>Produtos</span><span>{formatCurrency(totals.subtotal)}</span></Box>
          <Box className="delivery-line"><span>Entrega</span><span>{formatCurrency(totals.deliveryFee)}</span></Box>
          <Box className="delivery-line"><strong>Total</strong><strong>{formatCurrency(totals.total)}</strong></Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCheckoutOpen(false)}>Voltar</Button>
          <Button variant="contained" disabled={submitting || closed} onClick={submitOrder}>
            {submitting ? 'Enviando...' : 'Confirmar pedido'}
          </Button>
        </DialogActions>
      </Dialog>
      <DeliveryAuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={(next) => setCustomer(next)}
      />
    </Box>
  );
}
