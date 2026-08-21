import { useState, useEffect, useCallback } from 'react';
import { getComandas } from '../service/comandasService';

export const useGetComandas = () => {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchComandas = useCallback(() => {
    setLoading(true);
    getComandas()
      .then((response) => {
        setEmptyResult(false);
        setError(false);
        setComandas(response.data);
      })
      .catch((err) => {
        const errorCode = err.response ? err.response.status : 500;
        if (errorCode === 404) {
          setEmptyResult(true);
        } else {
          setError(true);
        }
        setComandas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchComandas();
  }, [fetchComandas]);

  return { comandas, loading, error, emptyResult, fetchComandas };
};
