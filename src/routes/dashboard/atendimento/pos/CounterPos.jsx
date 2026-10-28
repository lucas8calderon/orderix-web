import { useEffect, useMemo, useRef, useState } from 'react';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { Box, Button, Drawer, TextField } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { Loading } from '../../../../commons/components/Loading';
import { formatCurrency } from '../../../../services/accessControl';
import { createFloorOrder } from '../service/accountService';
import { buildFloorOrderBody } from '../utils/floorOrder';
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
  filterCatalogProducts,
  productNeedsCustomization,
} from './catalogView';
import { clearCounterDraft, readCounterDraft, writeCounterDraft } from './counterDraft';
import { OrderCart } from './OrderCart';
import { ProductCategoryFilter } from './ProductCategoryFilter';
import { ProductCustomizeDialog } from './ProductCustomizeDialog';
import { ProductGrid } from './ProductGrid';
import { ProductSearch } from './ProductSearch';
import { useProductCatalog } from './useProductCatalog';

function orderFromCreateResponse(response) {
  const data = response?.data;
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  if (orders.length) return orders[orders.length - 1];
  if (data?.id) return data;
  return null;
}

export function CounterPos({
  active = true,
  floorVersion = 0,
  onShowOrders,
  onOpenAccount,
}) {
  const compactCart = useMediaQuery('(max-width:1024px)');
  const searchRef = useRef(null);
  const rootRef = useRef(null);
  const submitRef = useRef(false);
  const attemptRef = useRef({ key: '', signature: '' });
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [customerName, setCustomerName] = useState('');
  const [observation, setObservation] = useState('');
  const [lines, setLines] = useState([]);
  const [customize, setCustomize] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [live, setLive] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const { products, categories, loading, loaded, error: catalogError, reload } = useProductCatalog({
    enabled: active,
    floorVersion,
  });

  useEffect(() => {
    const draft = readCounterDraft();
    if (draft) {
      setCustomerName(draft.customerName);
      setObservation(draft.observation);
      setLines(draft.lines);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;
    if (!customerName.trim() && !observation.trim() && lines.length === 0) {
      clearCounterDraft();
      return undefined;
    }
    writeCounterDraft({ customerName, observation, lines });
    return undefined;
  }, [ready, customerName, observation, lines]);

  useEffect(() => {
    if (!highlightedId) return undefined;
    const timer = window.setTimeout(() => setHighlightedId(null), 700);
    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  useEffect(() => {
    const onKey = (event) => {
      if (!(event.ctrlKey || event.metaKey) || String(event.key).toLowerCase() !== 'k') return;
      if (!active) return;
      if (document.querySelector('[role="dialog"]')) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const categoryChips = useMemo(
    () => buildCategoryChips(products, categories),
    [products, categories],
  );
  const visible = useMemo(
    () => filterCatalogProducts(products, { query, categoryFilter }),
    [products, query, categoryFilter],
  );
  const totals = useMemo(() => cartTotals(lines), [lines]);
  const hasDraft = Boolean(customerName.trim() || observation.trim() || lines.length);

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
    setCustomerName('');
    setObservation('');
    setLines([]);
    setError('');
    setCartOpen(false);
    clearCounterDraft();
  };

  const submit = async (intent) => {
    if (submitRef.current || lines.length === 0) return;
    const signature = draftSignature(customerName, observation, lines);
    if (attemptRef.current.signature !== signature) {
      attemptRef.current = { key: newLineKey(), signature };
    }
    submitRef.current = true;
    setSaving(true);
    setError('');
    try {
      const built = buildFloorOrderBody({
        target: { kind: 'counter' },
        customerName: customerName.trim() || 'Balcão',
        observation,
        lines,
        waiterId: null,
      });
      if (built.error) {
        setError(built.error);
        return;
      }
      const response = await createFloorOrder(built.tableId, built.body, attemptRef.current.key);
      const created = orderFromCreateResponse(response);
      attemptRef.current = { key: '', signature: '' };
      resetDraft();
      if (created?.id) setLastOrder(created);
      const number = created?.id ? ` ${created.id}` : '';
      if ((intent === 'checkout' || intent === 'print') && created?.id) {
        setLive(intent === 'print' ? `Pedido${number} pronto para impressão.` : `Pedido${number} aberto para pagamento.`);
        onOpenAccount?.({ kind: 'counter', id: created.id, number: created.id });
      } else {
        setLive(`Pedido${number} enviado.`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Não foi possível lançar o pedido. O carrinho foi mantido.');
    } finally {
      submitRef.current = false;
      setSaving(false);
    }
  };

  const cart = (
    <OrderCart
      lines={lines}
      totals={totals}
      saving={saving}
      error={error}
      printEnabled={Boolean(lastOrder?.id)}
      hasDraft={hasDraft}
      onChangeQty={(key, delta) => setLines((current) => changeLineQuantity(current, key, delta))}
      onObservationLine={(key, value) => setLines((current) => updateLine(current, key, { observation: value }))}
      onRemove={(key) => setLines((current) => removeLine(current, key))}
      onEdit={(line) => setCustomize({ product: line.product, line })}
      onFinalize={() => submit('checkout')}
      onSend={() => submit('send')}
      onSave={() => setLive('Rascunho salvo neste caixa.')}
      onPrint={() => {
        if (!lastOrder?.id) return;
        onOpenAccount?.({ kind: 'counter', id: lastOrder.id, number: lastOrder.id });
      }}
      onClear={resetDraft}
    />
  );

  return (
    <Box ref={rootRef} className="counter-pos">
      <Box className="counter-pos__catalog">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ReceiptLongOutlinedIcon />}
            onClick={onShowOrders}
            sx={{ textTransform: 'none', borderRadius: '999px' }}
          >
            Pedidos abertos
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ProductSearch value={query} onChange={setQuery} inputRef={searchRef} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            <TextField
              size="small"
              label="Nome do cliente (opcional)"
              placeholder="Cliente balcão"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
            <TextField
              size="small"
              label="Observação do pedido (opcional)"
              placeholder="Ex.: sem cebola, ponto da carne"
              value={observation}
              onChange={(event) => setObservation(event.target.value)}
            />
          </Box>
          <ProductCategoryFilter
            chips={categoryChips.chips}
            hasOthers={categoryChips.hasOthers}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          {catalogError ? (
            <EmptyState title="Não foi possível carregar o cardápio" description={catalogError} actionLabel="Tentar de novo" onAction={reload} />
          ) : null}
          {(loading || !loaded) && !catalogError ? <Loading loadingMessage="Carregando cardápio..." /> : null}
          {loaded && !loading && !catalogError ? (
            <ProductGrid
              products={visible}
              highlightedId={highlightedId}
              query={query}
              categorySelected={categoryFilter !== ALL_CATEGORIES}
              onAdd={addProduct}
            />
          ) : null}
        </Box>
      </Box>

      {compactCart ? (
        <>
          <Box className="counter-pos__bar">
            <Button fullWidth variant="contained" onClick={() => setCartOpen(true)} sx={{ textTransform: 'none', borderRadius: '12px', py: 1.25 }}>
              Ver pedido · {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'} · {formatCurrency(totals.total)}
            </Button>
          </Box>
          <Drawer
            anchor="bottom"
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            PaperProps={{ sx: { maxHeight: '88vh', borderRadius: '16px 16px 0 0' } }}
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
