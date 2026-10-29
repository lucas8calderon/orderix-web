import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Drawer } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { formatCurrency } from '../../../../services/accessControl';
import { channelPaymentMode, getStorePaymentConfig, toPaymentUi } from '../../../../services/paymentConfigService';
import { createFloorOrder, resolveOperatorWaiterId } from '../service/accountService';
import { addCustomerOrderItems, createCustomerOrder } from '../service/customerOrderService';
import { buildFloorOrderBody, defaultCustomerName } from '../utils/floorOrder';
import {
  addLine,
  cartTotals,
  changeLineQuantity,
  draftSignature,
  newLineKey,
  removeLine,
  replaceLine,
  updateLine,
} from './cartMath';
import {
  ALL_CATEGORIES,
  buildCategoryChips,
  canAddProduct,
  countProductsByCategory,
  filterCatalogProducts,
  groupProductsByCategory,
  productNeedsCustomization,
} from './catalogView';
import { clearCounterDraft, readCounterDraft, writeCounterDraft } from './counterDraft';
import { OrderCart } from './OrderCart';
import { ProductCategoryFilter } from './ProductCategoryFilter';
import { ProductCustomizeDialog } from './ProductCustomizeDialog';
import { ProductGrid } from './ProductGrid';
import { ProductSearch } from './ProductSearch';
import { useProductCatalog } from './useProductCatalog';

const COUNTER = { kind: 'counter' };

function orderFromCreateResponse(response) {
  const data = response?.data;
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  if (orders.length) return orders[orders.length - 1];
  if (data?.id) return data;
  return null;
}

export function posTitle(target) {
  if (target?.kind === 'customer') {
    return target.customerName ? `Cliente ${target.customerName}` : 'Novo pedido por cliente';
  }
  if (target?.kind === 'comanda') return `Comanda ${target.number ?? ''}`.trim();
  if (target?.kind === 'table') return `Mesa ${target.number ?? ''}`.trim();
  return 'Pedido balcão';
}

/**
 * PDV usado no balcão (aba fixa, com rascunho e cobrança) e no lançamento
 * em mesa, comanda e pedido por cliente (dentro do PlaceOrderDialog).
 */
export function CounterPos({
  target = COUNTER,
  active = true,
  floorVersion = 0,
  onOpenAccount,
  onSent,
  onPlaced,
  embedded = false,
}) {
  // Na aba Balcão o PDV guarda rascunho e cobra; embutido (mesa, comanda, cliente) só envia.
  const isCounter = target?.kind === 'counter' && !embedded;
  const customerCreate = target?.kind === 'customer' && !target?.id;
  const customerLocked = target?.kind === 'customer' && Boolean(target?.id);
  const compactCart = useMediaQuery('(max-width:1024px)');
  const searchRef = useRef(null);
  const submitRef = useRef(false);
  const attemptRef = useRef({ key: '', signature: '' });
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [customerName, setCustomerName] = useState(customerLocked ? target.customerName || '' : '');
  const [customerNote, setCustomerNote] = useState(target?.customerIdentificationNote || '');
  const [observation, setObservation] = useState('');
  const [lines, setLines] = useState([]);
  const [customize, setCustomize] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [live, setLive] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [holdsKitchen, setHoldsKitchen] = useState(false);
  const { products, categories, loading, loaded, error: catalogError, reload } = useProductCatalog({
    enabled: active,
    floorVersion,
  });

  useEffect(() => {
    if (!isCounter) {
      setReady(true);
      return;
    }
    const draft = readCounterDraft();
    if (draft) {
      setCustomerName(draft.customerName);
      setObservation(draft.observation);
      setLines(draft.lines);
    }
    setReady(true);
  }, [isCounter]);

  useEffect(() => {
    if (!ready || !isCounter) return undefined;
    if (!customerName.trim() && !observation.trim() && lines.length === 0) {
      clearCounterDraft();
      return undefined;
    }
    writeCounterDraft({ customerName, observation, lines });
    return undefined;
  }, [ready, isCounter, customerName, observation, lines]);

  // Com cobrança antes da cozinha, o pedido enviado sem pagar fica retido (HELD) até ser pago.
  useEffect(() => {
    if (!isCounter || !active) return undefined;
    let cancelled = false;
    getStorePaymentConfig()
      .then((response) => {
        if (cancelled) return;
        const dto = response?.data || {};
        const charges = channelPaymentMode(dto, 'counter') !== 'ORDER_ONLY';
        setHoldsKitchen(charges && toPaymentUi(dto).counterTiming === 'BEFORE_KITCHEN');
      })
      .catch(() => {
        if (!cancelled) setHoldsKitchen(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCounter, active]);

  useEffect(() => {
    if (!highlightedId) return undefined;
    const timer = window.setTimeout(() => setHighlightedId(null), 700);
    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  const categoryChips = useMemo(
    () => buildCategoryChips(products, categories),
    [products, categories],
  );
  const counts = useMemo(() => countProductsByCategory(products), [products]);
  const searching = Boolean(query.trim());
  const visible = useMemo(
    () => filterCatalogProducts(products, { query, categoryFilter }),
    [products, query, categoryFilter],
  );
  const groups = useMemo(
    () => (!searching && categoryFilter === ALL_CATEGORIES ? groupProductsByCategory(visible, categoryChips.chips) : null),
    [visible, categoryChips, searching, categoryFilter],
  );
  const totals = useMemo(() => cartTotals(lines), [lines]);
  const hasDraft = Boolean((!customerLocked && customerName.trim()) || observation.trim() || lines.length);
  const canSubmit = lines.length > 0 || (customerCreate && customerName.trim());

  const rememberAdded = (product) => {
    setHighlightedId(product.id);
    setLive(`${product.name} adicionado ao pedido`);
    setError('');
  };

  const addProduct = (product) => {
    if (!canAddProduct(product)) return;
    if (productNeedsCustomization(product)) {
      setCustomize({ product, line: null });
      return;
    }
    setLines((current) => addLine(current, {
      product,
      quantity: 1,
      selections: {},
      extraIds: [],
      observation: '',
    }));
    rememberAdded(product);
  };

  const confirmCustomization = (draft) => {
    if (customize?.line?.key) {
      setLines((current) => replaceLine(current, customize.line.key, draft));
    } else {
      setLines((current) => addLine(current, draft));
      rememberAdded(draft.product);
    }
    setCustomize(null);
  };

  const resetDraft = () => {
    if (!customerLocked) setCustomerName('');
    setCustomerNote('');
    setObservation('');
    setLines([]);
    setError('');
    setCartOpen(false);
    if (isCounter) clearCounterDraft();
  };

  const submit = async (intent) => {
    if (submitRef.current || !canSubmit) return;
    const signature = draftSignature(customerName, observation, lines);
    if (attemptRef.current.signature !== signature) {
      attemptRef.current = { key: newLineKey(), signature };
    }
    submitRef.current = true;
    setSaving(true);
    setError('');
    try {
      const waiterId = target?.kind === 'table' || target?.kind === 'comanda'
        ? await resolveOperatorWaiterId()
        : null;
      const built = buildFloorOrderBody({
        target,
        customerName: customerName.trim() || defaultCustomerName(target),
        customerIdentificationNote: customerNote,
        observation,
        lines,
        waiterId,
      });
      if (built.error) {
        setError(built.error);
        return;
      }
      let created = null;
      if (built.mode === 'customer-create') {
        created = (await createCustomerOrder(built.body, attemptRef.current.key))?.data || null;
      } else if (built.mode === 'customer-items') {
        await addCustomerOrderItems(built.orderId, {
          products: built.body.products,
          observation: built.body.observation,
        }, attemptRef.current.key);
      } else {
        created = orderFromCreateResponse(await createFloorOrder(built.tableId, built.body, attemptRef.current.key));
      }
      attemptRef.current = { key: '', signature: '' };
      resetDraft();
      if (!isCounter) {
        onPlaced?.(created);
        return;
      }
      onSent?.(created);
      const number = created?.id ? ` ${created.id}` : '';
      if (intent === 'checkout' && created?.id) {
        setLastOrder(null);
        setLive(`Pedido${number} aberto para pagamento.`);
        onOpenAccount?.({ kind: 'counter', id: created.id, number: created.id });
      } else {
        setLastOrder(created?.id ? created : null);
        setLive(`Pedido${number} enviado.`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível lançar o pedido. O carrinho foi mantido.');
    } finally {
      submitRef.current = false;
      setSaving(false);
    }
  };

  const primaryAction = isCounter ? () => submit('checkout') : () => submit('send');

  useEffect(() => {
    const onKey = (event) => {
      if (!active || !(event.ctrlKey || event.metaKey)) return;
      const key = String(event.key).toLowerCase();
      const dialogOpen = Boolean(document.querySelector('[role="dialog"]'));
      if (key === 'k' && (isCounter ? !dialogOpen : true)) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select?.();
      } else if (key === 'enter' && (isCounter ? !dialogOpen : !customize)) {
        event.preventDefault();
        primaryAction();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const notice = lastOrder ? (
    <Alert
      severity="success"
      onClose={() => setLastOrder(null)}
      sx={{ mb: 1.5, alignItems: 'center' }}
      action={(
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            onOpenAccount?.({ kind: 'counter', id: lastOrder.id, number: lastOrder.id });
            setLastOrder(null);
          }}
          sx={{ textTransform: 'none', fontWeight: 700 }}
        >
          Cobrar / imprimir
        </Button>
      )}
    >
      Pedido {lastOrder.id} enviado{holdsKitchen ? ', aguardando pagamento' : ''}.
    </Alert>
  ) : null;

  const totalLabel = formatCurrency(totals.total);
  const primary = isCounter
    ? { label: `Cobrar · ${totalLabel}`, disabled: lines.length === 0 }
    : {
        label: customerCreate && lines.length === 0 ? 'Criar pedido' : `Enviar pedido · ${totalLabel}`,
        disabled: !canSubmit,
      };
  primary.onClick = primaryAction;

  const cart = (
    <OrderCart
      title={posTitle(target)}
      lines={lines}
      totals={totals}
      saving={saving}
      error={error}
      notice={notice}
      hasDraft={hasDraft}
      customer={{
        label: customerCreate ? 'Nome do cliente' : 'Nome do cliente (opcional)',
        placeholder: isCounter ? 'Cliente balcão' : '',
        name: customerName,
        onName: setCustomerName,
        locked: customerLocked,
        required: customerCreate,
        note: customerNote,
        onNote: customerCreate ? setCustomerNote : null,
      }}
      observation={observation}
      onObservation={setObservation}
      primary={primary}
      secondary={isCounter ? {
        label: 'Enviar sem cobrar',
        hint: holdsKitchen
          ? 'Fica em Pedidos abertos e só vai para a cozinha depois do pagamento.'
          : 'Vai para a cozinha agora. Cobre depois em Pedidos abertos.',
        disabled: lines.length === 0,
        onClick: () => submit('send'),
      } : null}
      draftHint={isCounter ? 'Rascunho salvo automaticamente neste caixa.' : ''}
      onChangeQty={(key, delta) => setLines((current) => changeLineQuantity(current, key, delta))}
      onObservationLine={(key, value) => setLines((current) => updateLine(current, key, { observation: value }))}
      onRemove={(key) => setLines((current) => removeLine(current, key))}
      onEdit={(line) => setCustomize({ product: line.product, line })}
      onClear={resetDraft}
    />
  );

  return (
    <Box className="counter-pos">
      <Box className="counter-pos__catalog">
        <Box className="counter-pos__filters">
          <ProductSearch value={query} onChange={setQuery} inputRef={searchRef} />
          <ProductCategoryFilter
            chips={categoryChips.chips}
            hasOthers={categoryChips.hasOthers}
            counts={counts}
            value={categoryFilter}
            disabled={searching}
            onChange={(value) => {
              setQuery('');
              setCategoryFilter(value);
            }}
          />
        </Box>
        {catalogError ? (
          <EmptyState title="Não foi possível carregar o cardápio" description={catalogError} actionLabel="Tentar de novo" onAction={reload} />
        ) : null}
        {(loading || !loaded) && !catalogError ? <Loading loadingMessage="Carregando cardápio..." /> : null}
        {loaded && !loading && !catalogError ? (
          <ProductGrid
            products={visible}
            groups={groups}
            highlightedId={highlightedId}
            query={query}
            categorySelected={categoryFilter !== ALL_CATEGORIES}
            onAdd={addProduct}
          />
        ) : null}
      </Box>

      {compactCart ? (
        <>
          <Box className="counter-pos__bar">
            {notice && !cartOpen ? <Box sx={{ mb: 1 }}>{notice}</Box> : null}
            <Button
              fullWidth
              variant="contained"
              onClick={() => setCartOpen(true)}
              sx={{ textTransform: 'none', borderRadius: '12px', py: 1.4, fontWeight: 800 }}
            >
              Ver pedido · {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'} · {totalLabel}
            </Button>
          </Box>
          <Drawer
            anchor="bottom"
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            PaperProps={{ sx: { maxHeight: '92vh', height: '92vh', borderRadius: '16px 16px 0 0' } }}
          >
            {cart}
          </Drawer>
        </>
      ) : (
        <Box className="counter-pos__cart">{cart}</Box>
      )}

      <ProductCustomizeDialog
        open={Boolean(customize)}
        product={customize?.product}
        initialLine={customize?.line}
        onClose={() => setCustomize(null)}
        onConfirm={confirmCustomization}
      />
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        {live}
      </Box>
    </Box>
  );
}
