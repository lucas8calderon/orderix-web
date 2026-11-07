import { useCallback, useEffect, useRef, useState } from 'react';
import { getCurrentUser } from '../../../services/session';
import { playNewOrderBeep, unlockOrderAlertSound } from './orderAlertSound';
import { fetchStoreSyncSince, fetchStoreSyncStatus, NEW_ORDER_POLL_MS } from './storeSyncClient';
import { createNewOrderTracker } from './newOrderTracker';

export function useNewOrderAlert() {
  const [count, setCount] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);
  const trackerRef = useRef(null);
  const etagRef = useRef(null);
  const storeId = getCurrentUser()?.storeId ?? null;

  useEffect(() => {
    const unlock = () => unlockOrderAlertSound();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    if (storeId == null) return undefined;

    let stopped = false;
    const tracker = createNewOrderTracker();
    trackerRef.current = tracker;
    etagRef.current = null;
    setCount(0);
    setToastOpen(false);

    const publish = (result) => {
      if (stopped || !result) return;
      setCount(result.count);
      if (result.playSound) {
        playNewOrderBeep();
        setToastOpen(true);
      }
    };

    const prime = async () => {
      const status = await fetchStoreSyncStatus();
      if (stopped) return;
      publish(tracker.prime(status?.cursor ?? 0));
    };

    const poll = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      if (!tracker.snapshot().primed) {
        await prime();
        return;
      }
      const page = await fetchStoreSyncSince(tracker.snapshot().cursor, etagRef.current);
      if (stopped || !page || page.status === 304 || !page.data) return;
      etagRef.current = page.etag;
      publish(tracker.applyEvents(page.data));
    };

    let queue = Promise.resolve();
    const enqueue = (task) => {
      queue = queue.then(task).catch(() => {});
    };

    enqueue(prime);
    const timer = window.setInterval(() => enqueue(poll), NEW_ORDER_POLL_MS);
    const onVisible = () => {
      if (!document.hidden) enqueue(poll);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [storeId]);

  const acknowledge = useCallback(() => {
    const result = trackerRef.current?.acknowledge();
    setCount(0);
    setToastOpen(false);
    return result?.acknowledgedId ?? null;
  }, []);

  const dismissToast = useCallback(() => setToastOpen(false), []);

  return { count, toastOpen, acknowledge, dismissToast };
}
