import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  clearSelection as clearSelectionItems,
  computeEstimatedTotal,
  decreaseQuantity as decreaseItem,
  flattenCatalogProducts,
  getQuantity,
  increaseQuantity as increaseItem,
  isSelected as itemIsSelected,
  pruneMissingProducts,
  removeProduct as removeItem,
  selectProduct as selectItem,
  selectedCount as countSelected,
} from './selectionModel';
import { clearSelectionStorage, readSelection, writeSelection } from './selectionStorage';
import { DIGITAL_MENU_EVENTS, trackDigitalMenuEvent } from './menuSelectionAnalytics';

/**
 * Estado local da "Minha seleção" do cardápio digital.
 * Zero requests ao marcar, alterar quantidade, abrir ou filtrar.
 */
export function useMenuSelection(storeId, categories, { catalogReady = false } = {}) {
  const { byId: productById, list: catalogProducts } = useMemo(
    () => flattenCatalogProducts(categories),
    [categories]
  );

  const catalogIdKey = useMemo(
    () => catalogProducts.map((p) => String(p.id)).join('|'),
    [catalogProducts]
  );

  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const skipNextWrite = useRef(false);

  useEffect(() => {
    if (!storeId) {
      setItems([]);
      setHydrated(true);
      return;
    }

    skipNextWrite.current = true;
    const stored = readSelection(storeId);

    if (!catalogReady) {
      setItems(stored.items);
      setHydrated(true);
      return;
    }

    const catalogIds = catalogIdKey ? catalogIdKey.split('|') : [];
    const pruned = pruneMissingProducts(stored.items, catalogIds);
    setItems(pruned);
    if (pruned.length !== stored.items.length) {
      writeSelection(storeId, pruned);
    }
    setHydrated(true);
  }, [storeId, catalogReady, catalogIdKey]);

  useEffect(() => {
    if (!hydrated || !storeId) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    writeSelection(storeId, items);
  }, [hydrated, storeId, items]);

  const selectedItems = useMemo(
    () => items
      .map((item) => {
        const product = productById.get(String(item.productId))
          ?? productById.get(item.productId);
        if (!product) return null;
        return { ...item, product };
      })
      .filter(Boolean),
    [items, productById]
  );

  const count = countSelected(items);
  const estimatedTotal = computeEstimatedTotal(items, productById);

  const selectProduct = useCallback((productId) => {
    setItems((prev) => {
      if (itemIsSelected(prev, productId)) return prev;
      queueMicrotask(() => {
        trackDigitalMenuEvent(DIGITAL_MENU_EVENTS.PRODUCT_SELECTED, {
          storeId,
          productId,
        });
      });
      return selectItem(prev, productId);
    });
  }, [storeId]);

  const removeProduct = useCallback((productId) => {
    setItems((prev) => {
      if (!itemIsSelected(prev, productId)) return prev;
      queueMicrotask(() => {
        trackDigitalMenuEvent(DIGITAL_MENU_EVENTS.PRODUCT_UNSELECTED, {
          storeId,
          productId,
        });
      });
      return removeItem(prev, productId);
    });
  }, [storeId]);

  const increaseQuantity = useCallback((productId, { available = true } = {}) => {
    if (available === false) return;
    setItems((prev) => increaseItem(prev, productId));
  }, []);

  const decreaseQuantity = useCallback((productId) => {
    setItems((prev) => {
      const next = decreaseItem(prev, productId);
      if (itemIsSelected(prev, productId) && !itemIsSelected(next, productId)) {
        queueMicrotask(() => {
          trackDigitalMenuEvent(DIGITAL_MENU_EVENTS.PRODUCT_UNSELECTED, {
            storeId,
            productId,
          });
        });
      }
      return next;
    });
  }, [storeId]);

  const clearSelection = useCallback(() => {
    setItems(clearSelectionItems());
    if (storeId) clearSelectionStorage(storeId);
    trackDigitalMenuEvent(DIGITAL_MENU_EVENTS.SELECTION_CLEARED, { storeId });
  }, [storeId]);

  const isSelected = useCallback(
    (productId) => itemIsSelected(items, productId),
    [items]
  );

  const quantityOf = useCallback(
    (productId) => getQuantity(items, productId),
    [items]
  );

  return {
    items,
    selectedItems,
    selectedCount: count,
    estimatedTotal,
    productById,
    selectProduct,
    removeProduct,
    increaseQuantity,
    decreaseQuantity,
    clearSelection,
    isSelected,
    quantityOf,
  };
}
