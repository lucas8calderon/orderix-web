import { useCallback, useEffect, useState } from 'react';
import { getStores, getStoresDashboard } from '../service/storesService';

export function useMasterStores({ enabled = true } = {}) {
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
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchAll();
  }, [fetchAll, enabled]);

  return { stores, summary, loading, error, refetch: fetchAll };
}
