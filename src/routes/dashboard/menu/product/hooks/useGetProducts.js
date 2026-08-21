import { useState, useEffect, useCallback } from 'react';
import { getAllProducts } from '../service/productService';

export const useGetProducts = (refreshKey = 0) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    getAllProducts()
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setProducts(data);
        setEmptyResult(data.length === 0);
        setError(false);
      })
      .catch(() => {
        setProducts([]);
        setEmptyResult(false);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  return { products, loading, error, emptyResult, refetch: fetchProducts };
};
