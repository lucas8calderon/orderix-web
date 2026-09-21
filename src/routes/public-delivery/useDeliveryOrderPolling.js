import { useCallback, useEffect, useRef, useState } from 'react';
import { getDeliveryOrder } from '../../services/deliveryService';
import {
  isFinalTrackingStatus,
  POLL_HIDDEN_INTERVAL_MS,
  POLL_INTERVAL_MS,
} from './orderTrackingConfig';

/**
 * Carrega e atualiza o pedido público por token.
 * - Polling inteligente (pausa em background, para em estado final)
 * - Não descarta dados válidos em falha de atualização
 */
export function useDeliveryOrderPolling(publicToken, initialOrder = null) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(initialOrder ? Date.now() : null);
  const orderRef = useRef(order);
  const requestSeq = useRef(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const fetchOrder = useCallback(async ({ silent = false } = {}) => {
    if (!publicToken) {
      setNotFound(true);
      setLoading(false);
      setError('Pedido não encontrado.');
      return null;
    }
    const seq = ++requestSeq.current;
    if (!silent && !orderRef.current) {
      setLoading(true);
    }
    try {
      const response = await getDeliveryOrder(publicToken);
      if (!mountedRef.current || seq !== requestSeq.current) return null;
      const data = response.data;
      setOrder(data);
      setError('');
      setNotFound(false);
      setRefreshError('');
      setLastUpdatedAt(Date.now());
      return data;
    } catch (err) {
      if (!mountedRef.current || seq !== requestSeq.current) return null;
      const status = err?.response?.status;
      const message = err?.response?.data?.message || 'Pedido não encontrado.';
      if (status === 404 || (!orderRef.current && status != null)) {
        setNotFound(true);
        setError(message);
        if (!orderRef.current) setOrder(null);
      } else if (orderRef.current) {
        setRefreshError('Não conseguimos atualizar o pedido agora.');
      } else {
        setError(message || 'Não foi possível carregar o pedido.');
        setNotFound(true);
      }
      return null;
    } finally {
      if (mountedRef.current && seq === requestSeq.current) {
        setLoading(false);
      }
    }
  }, [publicToken]);

  const scheduleNext = useCallback((delay) => {
    clearTimer();
    timerRef.current = setTimeout(async () => {
      const data = await fetchOrder({ silent: true });
      const status = data?.trackingStatus || orderRef.current?.trackingStatus;
      if (isFinalTrackingStatus(status)) {
        clearTimer();
        return;
      }
      const nextDelay = typeof document !== 'undefined' && document.hidden
        ? POLL_HIDDEN_INTERVAL_MS
        : POLL_INTERVAL_MS;
      scheduleNext(nextDelay);
    }, delay);
  }, [clearTimer, fetchOrder]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    (async () => {
      const data = await fetchOrder({ silent: Boolean(initialOrder) });
      if (cancelled) return;
      const status = data?.trackingStatus || initialOrder?.trackingStatus;
      if (!isFinalTrackingStatus(status)) {
        scheduleNext(POLL_INTERVAL_MS);
      }
    })();

    const onVisibility = () => {
      if (isFinalTrackingStatus(orderRef.current?.trackingStatus)) {
        clearTimer();
        return;
      }
      if (document.hidden) {
        clearTimer();
        scheduleNext(POLL_HIDDEN_INTERVAL_MS);
      } else {
        fetchOrder({ silent: true }).then((data) => {
          if (!isFinalTrackingStatus(data?.trackingStatus || orderRef.current?.trackingStatus)) {
            scheduleNext(POLL_INTERVAL_MS);
          } else {
            clearTimer();
          }
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibility);
      requestSeq.current += 1;
    };
  }, [publicToken, fetchOrder, scheduleNext, clearTimer, initialOrder]);

  const retry = useCallback(() => {
    setRefreshError('');
    setError('');
    setNotFound(false);
    fetchOrder({ silent: Boolean(orderRef.current) }).then((data) => {
      if (!isFinalTrackingStatus(data?.trackingStatus || orderRef.current?.trackingStatus)) {
        scheduleNext(POLL_INTERVAL_MS);
      }
    });
  }, [fetchOrder, scheduleNext]);

  return {
    order,
    loading,
    error,
    notFound,
    refreshError,
    lastUpdatedAt,
    retry,
    isFinal: isFinalTrackingStatus(order?.trackingStatus),
  };
}
