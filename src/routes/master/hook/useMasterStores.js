import { useCallback, useEffect, useState } from 'react';
import { getStores, getStoresDashboard } from '../service/storesService';

export function useMasterStores() {
  const [stores, setStores] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [storesResponse, summaryResponse] = await Promise.all([
        getStores(),
        getStoresDashboard(),
      ]);
      setStores(storesResponse.data || []);
      setSummary(summaryResponse.data || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { stores, summary, loading, error, refetch: fetchAll };
}
