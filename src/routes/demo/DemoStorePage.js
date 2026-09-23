import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Snackbar, useMediaQuery } from '@mui/material';
import { PATHS } from '../../services/accessControl';
import { DEMO_EVENTS, trackDemoEvent } from './demoAnalytics';
import {
  clearDemoCart,
  demoCartTotals,
  readDemoCart,
  removeDemoCartItem,
  updateDemoCartQuantity,
  writeDemoCart,
} from './demoCart';
import {
  addAvailableProductToCart,
  filterDemoCategories,
  isDemoProductAvailable,
  resetDemoExperience,
  simulateDemoOrder,
} from './demoRepository';
import { restoreDemoDocumentMeta, setDemoDocumentMeta } from './demoSeo';
import { getDemoStore } from './demoStores';
import DemoBanner from './components/DemoBanner';
import DemoCartBar from './components/DemoCartBar';
import DemoCartPanel from './components/DemoCartPanel';
import DemoCategoryNav from './components/DemoCategoryNav';
import DemoCheckout from './components/DemoCheckout';
import DemoFooter from './components/DemoFooter';
import DemoMenuSearch from './components/DemoMenuSearch';
import DemoProductCard from './components/DemoProductCard';
import DemoProductSheet from './components/DemoProductSheet';
import DemoStoreHeader from './components/DemoStoreHeader';
import DemoSuccess from './components/DemoSuccess';
import useDemoCategoryScroll from './hooks/useDemoCategoryScroll';
import './Demo.css';

export default function DemoStorePage() {
  const { slug } = useParams();
  const store = getDemoStore(slug);
  const isMobile = useMediaQuery('(max-width:767px)');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState(() => readDemoCart(slug));
  const [selected, setSelected] = useState(null);
  const [draftQty, setDraftQty] = useState(1);
  const [draftNote, setDraftNote] = useState('');
  const [draftExtras, setDraftExtras] = useState({});
  const [draftSelections, setDraftSelections] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkout, setCheckout] = useState({
    customerName: store?.settings?.defaultCustomerName || 'Visitante',
    fulfillment: 'PICKUP',
    paymentMethod: 'PIX',
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    setCart(readDemoCart(slug));
    setOrder(null);
    setQuery('');
    setCheckout({
      customerName: store?.settings?.defaultCustomerName || 'Visitante',
      fulfillment: 'PICKUP',
      paymentMethod: 'PIX',
    });
  }, [slug, store?.settings?.defaultCustomerName]);

  useEffect(() => {
    writeDemoCart(slug, cart);
  }, [slug, cart]);

  useEffect(() => {
    if (!store) {
      setDemoDocumentMeta({
        title: 'Demonstração | Weper',
        description: 'Escolha um estabelecimento e experimente o cardápio digital Weper.',
      });
      return restoreDemoDocumentMeta;
    }
    setDemoDocumentMeta({
      title: store.seoTitle,
      description: store.seoDescription,
    });
    trackDemoEvent(DEMO_EVENTS.VIEW, { slug: store.slug, surface: 'store' });
    return restoreDemoDocumentMeta;
  }, [store]);

  const filteredCategories = useMemo(
    () => filterDemoCategories(store, query),
    [store, query]
  );
  const navCategories = useMemo(
    () => (query.trim() ? [] : (store?.categories || []).filter((category) => category.products.length > 0)),
    [store, query]
  );
  const categoryIds = useMemo(
    () => filteredCategories.map((category) => category.id),
    [filteredCategories]
  );
  const { activeId, scrollToCategory } = useDemoCategoryScroll(categoryIds, {
    enabled: Boolean(store) && !query.trim() && categoryIds.length > 0,
  });

  const totals = demoCartTotals(cart, {
    deliveryFee: store?.settings?.deliveryFee,
    fulfillment: checkout.fulfillment,
  });

  const openProduct = (product) => {
    if (!isDemoProductAvailable(product)) return;
    setSelected(product);
    setDraftQty(1);
    setDraftNote('');
    setDraftExtras({});
    setDraftSelections({});
    trackDemoEvent(DEMO_EVENTS.PRODUCT_VIEW, { slug, product_id: product.id });
  };

  const addSelected = () => {
    const extras = (selected.extras || [])
      .filter((extra) => draftExtras[extra.id])
      .map((extra) => ({
        id: extra.id,
        name: extra.name,
        price: extra.price,
        quantity: 1,
      }));
    const mandatorySelections = (selected.mandatoryGroups || [])
      .map((group) => {
        const selectedItemId = draftSelections[group.id];
        const item = (group.items || []).find((entry) => entry.id === selectedItemId);
        if (!item) return null;
        return {
          groupId: group.id,
          selectedItemId: item.id,
          name: item.name,
          price: item.price,
        };
      })
      .filter(Boolean);

    const draft = {
      productId: selected.id,
      name: selected.name,
      unitPrice: selected.price,
      quantity: draftQty,
      observation: draftNote.trim(),
      extras,
      mandatorySelections,
    };
    const result = addAvailableProductToCart(store, cart, draft);
    if (!result.ok) return;
    setCart(result.cart);
    setSelected(null);
    setToast({ open: true, message: 'Adicionado ao carrinho' });
    trackDemoEvent(DEMO_EVENTS.ADD_TO_CART, { slug, product_id: selected.id });
  };

  const openCart = () => {
    setCartOpen(true);
    trackDemoEvent(DEMO_EVENTS.CART_VIEW, { slug, item_count: totals.itemCount });
  };

  const startCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
    trackDemoEvent(DEMO_EVENTS.CHECKOUT_STARTED, { slug, fulfillment: checkout.fulfillment });
  };

  const confirmOrder = async () => {
    if (!checkout.customerName.trim()) {
      setCheckoutError('Informe um nome para continuar a demonstração.');
      return;
    }
    setSubmitting(true);
    setCheckoutError('');
    try {
      const simulated = await simulateDemoOrder({
        slug,
        cart,
        checkout: {
          fulfillment: checkout.fulfillment,
          paymentMethod: checkout.paymentMethod,
        },
      });
      setCart({ items: [] });
      clearDemoCart(slug);
      setCheckoutOpen(false);
      setCartOpen(false);
      setOrder(simulated);
      trackDemoEvent(DEMO_EVENTS.ORDER_SIMULATED, {
        slug,
        fulfillment: checkout.fulfillment,
        payment_method: checkout.paymentMethod,
        item_count: totals.itemCount,
      });
    } catch (error) {
      setCheckoutError(error.message || 'Não foi possível simular o pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetDemo = () => {
    resetDemoExperience(slug);
    setCart({ items: [] });
    setOrder(null);
    setSelected(null);
    setCartOpen(false);
    setCheckoutOpen(false);
    setQuery('');
    setCheckout({
      customerName: store?.settings?.defaultCustomerName || 'Visitante',
      fulfillment: 'PICKUP',
      paymentMethod: 'PIX',
    });
  };

  if (!store) {
    return (
      <div className="demo-page demo-page--empty">
        <DemoBanner onReset={() => {}} />
        <div className="demo-empty">
          <h1>Demonstração não encontrada</h1>
          <p>Esse estabelecimento ainda não faz parte da vitrine Weper.</p>
          <Link to={PATHS.DEMO}>Ver estabelecimentos</Link>
        </div>
        <DemoFooter />
      </div>
    );
  }

  return (
    <div
      className={`demo-page${totals.itemCount > 0 && !order ? ' has-cart-bar' : ''}`}
      style={{ '--demo-accent': store.accent, '--demo-accent-soft': store.accentSoft }}
    >
      <DemoBanner onReset={resetDemo} />
      {order ? (
        <DemoSuccess
          order={order}
          onContinue={() => setOrder(null)}
        />
      ) : (
        <>
          <DemoStoreHeader store={store} />
          <div className="demo-shell">
            <DemoMenuSearch value={query} onChange={setQuery} />
            <DemoCategoryNav
              categories={navCategories}
              activeId={activeId}
              onSelect={scrollToCategory}
            />
            <main className="demo-menu">
              {filteredCategories.length === 0 ? (
                <div className="demo-empty-state">
                  <h2>{query.trim() ? 'Nenhum produto encontrado' : 'Cardápio vazio'}</h2>
                  <p>{query.trim() ? 'Tente outro termo ou limpe a busca.' : 'Esta demo ainda não tem itens.'}</p>
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <section
                    key={category.id}
                    id={`demo-cat-${category.id}`}
                    data-category-id={category.id}
                    className="demo-menu-section"
                  >
                    <div className="demo-section-head">
                      <h2>{category.name}</h2>
                      <span>
                        {category.products.length}
                        {' '}
                        {category.products.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    <div className="demo-product-grid">
                      {category.products.map((product) => (
                        <DemoProductCard key={product.id} product={product} onOpen={openProduct} />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </main>
          </div>
        </>
      )}
      {!order ? <DemoFooter /> : null}

      {!order && !isMobile && totals.itemCount > 0 ? (
        <button type="button" className="demo-desktop-cart-btn" onClick={openCart}>
          Ver carrinho • {totals.itemCount} {totals.itemCount === 1 ? 'item' : 'itens'}
        </button>
      ) : null}

      {!order && isMobile ? (
        <DemoCartBar itemCount={totals.itemCount} total={totals.total} onOpen={openCart} />
      ) : null}

      <DemoProductSheet
        product={selected}
        open={Boolean(selected)}
        isMobile={isMobile}
        qty={draftQty}
        note={draftNote}
        extras={draftExtras}
        selections={draftSelections}
        onClose={() => setSelected(null)}
        onQty={setDraftQty}
        onNote={setDraftNote}
        onToggleExtra={(id) => setDraftExtras((prev) => ({ ...prev, [id]: !prev[id] }))}
        onSelect={(groupId, value) => setDraftSelections((prev) => ({ ...prev, [groupId]: value }))}
        onAdd={addSelected}
      />

      {!order ? (
        <DemoCartPanel
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cart={cart}
          totals={totals}
          isMobile={isMobile}
          onQty={(key, quantity) => setCart((prev) => updateDemoCartQuantity(prev, key, quantity))}
          onRemove={(key) => setCart((prev) => removeDemoCartItem(prev, key))}
          onCheckout={startCheckout}
        />
      ) : null}

      {!order ? (
        <DemoCheckout
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          checkout={checkout}
          setCheckout={setCheckout}
          totals={totals}
          error={checkoutError}
          submitting={submitting}
          onConfirm={confirmOrder}
        />
      ) : null}

      <Snackbar
        open={toast.open && !order}
        autoHideDuration={2000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        message={toast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}
