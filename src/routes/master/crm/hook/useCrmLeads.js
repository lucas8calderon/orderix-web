import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  archiveCrmLead,
  changeCrmLeadStatus,
  createCrmLead,
  getCrmLeadActivities,
  getCrmLeads,
  getCrmLeadsPage,
  getCrmMetrics,
  registerCrmContact,
  updateCrmLead,
} from '../service/crmService';

const EMPTY_FILTERS = {
  q: '',
  status: '',
  businessType: '',
  city: '',
  source: '',
  followUp: '',
};

const SEARCH_DEBOUNCE_MS = 300;
const LIST_PAGE_SIZE = 25;

export function useCrmLeads() {
  const [leads, setLeads] = useState([]);
  const [listPage, setListPage] = useState({ items: [], total: 0, page: 0, size: LIST_PAGE_SIZE });
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [view, setView] = useState('kanban');
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('nextContactAt,asc');
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(filters.q.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  const queryParams = useMemo(() => ({
    q: debouncedQ || undefined,
    status: filters.status || undefined,
    businessType: filters.businessType || undefined,
    city: filters.city.trim() || undefined,
    source: filters.source || undefined,
    followUp: filters.followUp || undefined,
  }), [debouncedQ, filters.status, filters.businessType, filters.city, filters.source, filters.followUp]);

  const fetchMetrics = useCallback(async () => {
    const metricsResponse = await getCrmMetrics();
    setMetrics(metricsResponse.data || null);
  }, []);

  const fetchKanban = useCallback(async (showSpinner) => {
    const current = ++requestId.current;
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const [leadsResponse, metricsResponse] = await Promise.all([
        getCrmLeads(queryParams),
        getCrmMetrics(),
      ]);
      if (current !== requestId.current) return;
      setLeads(leadsResponse.data || []);
      setMetrics(metricsResponse.data || null);
    } catch (err) {
      if (current !== requestId.current) return;
      setError(err);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [queryParams]);

  const fetchList = useCallback(async ({ nextPage = page, nextSort = sort, showSpinner = true } = {}) => {
    const current = ++requestId.current;
    if (showSpinner) setListLoading(true);
    setError(null);
    try {
      const [pageResponse, metricsResponse] = await Promise.all([
        getCrmLeadsPage({
          ...queryParams,
          page: nextPage,
          size: LIST_PAGE_SIZE,
          sort: nextSort,
        }),
        getCrmMetrics(),
      ]);
      if (current !== requestId.current) return;
      const data = pageResponse.data || {};
      setListPage({
        items: data.items || [],
        total: data.total || 0,
        page: data.page ?? nextPage,
        size: data.size || LIST_PAGE_SIZE,
      });
      setMetrics(metricsResponse.data || null);
    } catch (err) {
      if (current !== requestId.current) return;
      setError(err);
    } finally {
      if (current === requestId.current) {
        setListLoading(false);
        setLoading(false);
      }
    }
  }, [page, queryParams, sort]);

  useEffect(() => {
    setPage(0);
  }, [queryParams]);

  useEffect(() => {
    if (view === 'list') {
      fetchList({ nextPage: page, nextSort: sort, showSpinner: true });
    } else {
      fetchKanban(true);
    }
  }, [fetchKanban, fetchList, page, sort, view]);

  const refreshAfterMutation = useCallback(async () => {
    if (view === 'list') {
      await fetchList({ nextPage: page, nextSort: sort, showSpinner: false });
    } else {
      await fetchKanban(false);
    }
  }, [fetchKanban, fetchList, page, sort, view]);

  const patchLead = useCallback((updated) => {
    if (!updated?.id) return;
    setLeads((current) => current.map((lead) => (lead.id === updated.id ? { ...lead, ...updated } : lead)));
    setListPage((current) => ({
      ...current,
      items: current.items.map((lead) => (lead.id === updated.id ? { ...lead, ...updated } : lead)),
    }));
  }, []);

  const createLead = useCallback(async (payload) => {
    const response = await createCrmLead(payload);
    try {
      await refreshAfterMutation();
    } catch (err) {
      console.error(err);
    }
    return response.data;
  }, [refreshAfterMutation]);

  const updateLead = useCallback(async (id, payload) => {
    const response = await updateCrmLead(id, payload);
    patchLead(response.data);
    try {
      await fetchMetrics();
    } catch (err) {
      console.error(err);
    }
    return response.data;
  }, [fetchMetrics, patchLead]);

  const changeStatus = useCallback(async (id, status) => {
    const previousLeads = leads;
    const previousList = listPage;
    const optimistic = (lead) => (lead.id === id ? { ...lead, status } : lead);
    setLeads((current) => current.map(optimistic));
    setListPage((current) => ({ ...current, items: current.items.map(optimistic) }));
    try {
      const response = await changeCrmLeadStatus(id, status);
      patchLead(response.data);
      await fetchMetrics();
      return response.data;
    } catch (err) {
      setLeads(previousLeads);
      setListPage(previousList);
      throw err;
    }
  }, [fetchMetrics, leads, listPage, patchLead]);

  const registerContact = useCallback(async (id, payload) => {
    const response = await registerCrmContact(id, payload);
    patchLead(response.data);
    try {
      await fetchMetrics();
    } catch (err) {
      console.error(err);
    }
    return response.data;
  }, [fetchMetrics, patchLead]);

  const archiveLead = useCallback(async (id) => {
    await archiveCrmLead(id);
    setLeads((current) => current.filter((lead) => lead.id !== id));
    setListPage((current) => ({
      ...current,
      items: current.items.filter((lead) => lead.id !== id),
      total: Math.max(0, current.total - 1),
    }));
    try {
      await fetchMetrics();
    } catch (err) {
      console.error(err);
    }
  }, [fetchMetrics]);

  const loadActivities = useCallback(async (id) => {
    const response = await getCrmLeadActivities(id);
    return response.data || [];
  }, []);

  const setFilter = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setQuickFollowUp = useCallback((followUp) => {
    setFilters((prev) => ({
      ...prev,
      followUp,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setDebouncedQ('');
  }, []);

  const changeSort = useCallback((field) => {
    setSort((current) => {
      const [currentField, currentDir] = current.split(',');
      if (currentField === field) {
        return `${field},${currentDir === 'asc' ? 'desc' : 'asc'}`;
      }
      return `${field},asc`;
    });
    setPage(0);
  }, []);

  return {
    leads,
    listPage,
    metrics,
    loading,
    listLoading,
    error,
    filters,
    view,
    setView,
    page,
    setPage,
    sort,
    changeSort,
    pageSize: LIST_PAGE_SIZE,
    setFilter,
    setQuickFollowUp,
    clearFilters,
    refetch: view === 'list' ? () => fetchList({ showSpinner: true }) : () => fetchKanban(true),
    createLead,
    updateLead,
    changeStatus,
    registerContact,
    archiveLead,
    loadActivities,
  };
}
