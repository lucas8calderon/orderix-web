import { useState, useEffect, useCallback } from 'react';
import { getProductsFromCategory } from '../service/productService';

export const useGetProducts = (categoryId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchProducts = useCallback(() => {
    if (categoryId != null) {
      setLoading(true);
      getProductsFromCategory(categoryId)
        .then(response => {
          setEmptyResult(false);
          setError(false);
          setProducts(response.data);
        })
        .catch(error => {
          const errorCode = error.response ? error.response.status : 500;
          if (errorCode === 404) {
            setEmptyResult(true);
          } else {
            setError(true);
          }
          setProducts([]);
        })
        .finally(() => setLoading(false));
    } else {
      setError(true);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, emptyResult, refetch: fetchProducts };
};
