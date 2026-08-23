import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoreOverview } from '../service/dashboardService';

export const emptyOverview = {
  period: 'DAYS_7',
  revenue: { value: 0, previousValue: 0, changePercent: 0 },
  orders: { value: 0, previousValue: 0, changePercent: 0 },
  averageTicket: { value: 0, previousValue: 0, changePercent: 0 },
  operation: {
    tablesOccupied: 0,
    tablesAvailable: 0,
    tablesTotal: 0,
    openComandas: 0,
    kitchenOrders: 0,
    lateOrders: 0,
    avgPrepMinutes: null,
    criticalStockCount: 0,
  },
  kitchen: {
    inPreparation: 0,
    late: 0,
    finishedToday: 0,
    avgPrepMinutes: null,
    onTimePercent: null,
  },
  alerts: [],
  revenueSeries: [],
  salesByHour: [],
  recentOrders: [],
  products: [],
  paymentMethods: [],
  team: [],
  criticalStock: [],
};

export function useDashboardOverview(period = 'DAYS_7') {
  const [overview, setOverview] = useState(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const firstLoad = useRef(true);

  const fetchOverview = useCallback(() => {
    if (firstLoad.current) {
      setLoading(true);
    }
    setError(false);
    getStoreOverview(period)
      .then((response) => {
        setOverview({ ...emptyOverview, ...(response.data || {}) });
      })
      .catch(() => {
        setOverview(emptyOverview);
        setError(true);
      })
      .finally(() => {
        firstLoad.current = false;
        setLoading(false);
      });
  }, [period]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refetch: fetchOverview };
}
