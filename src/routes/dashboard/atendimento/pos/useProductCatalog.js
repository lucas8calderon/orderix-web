import { useEffect, useRef, useState } from 'react';
import { getAllCategories } from '../../menu/category/service/categoryService';
import { getAllProducts } from '../../menu/product/service/productService';

export function useProductCatalog({ enabled = true, floorVersion = 0 } = {}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const hasProducts = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    if (!hasProducts.current) setLoading(true);
    else setLoading(false);
    Promise.all([
      getAllProducts(),
      getAllCategories().catch(() => ({ data: [] })),
    ])
      .then(([productResponse, categoryResponse]) => {
        if (cancelled) return;
        const list = Array.isArray(productResponse.data) ? productResponse.data : [];
        setProducts(list);
        setCategories(Array.isArray(categoryResponse?.data) ? categoryResponse.data : []);
        hasProducts.current = list.length > 0;
        setLoaded(true);
        setError('');
      })
      .catch((err) => {
        if (cancelled) return;
        if (!hasProducts.current) setProducts([]);
        setLoaded(true);
        setError(err?.response?.data?.message || 'Não foi possível carregar o cardápio.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, floorVersion, reloadKey]);

  return {
    products,
    categories,
    loading,
    loaded,
    error,
    reload: () => setReloadKey((value) => value + 1),
  };
}
