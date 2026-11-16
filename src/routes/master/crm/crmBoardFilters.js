import { businessTypeLabel } from './crmConstants';
import { columnOf, isOverdue, withinCreatedRange } from './instagramCrm';

export function normalizeCity(value) {
  return (value || '').trim();
}

export function sameCity(leadCity, selected) {
  const wanted = normalizeCity(selected);
  if (!wanted) return true;
  return normalizeCity(leadCity).toLocaleLowerCase('pt-BR') === wanted.toLocaleLowerCase('pt-BR');
}

export function matchesSearch(lead, query) {
  const text = (query || '').trim().toLowerCase();
  if (!text) return true;
  const name = (lead?.businessName || '').toLowerCase();
  const handle = (lead?.instagramUsername || '').toLowerCase();
  const phone = (lead?.phone || '').toLowerCase();
  const city = (lead?.city || '').toLowerCase();
  return name.includes(text) || handle.includes(text) || phone.includes(text) || city.includes(text);
}

export function matchesBoardFilters(lead, filters = {}, { ignore = [] } = {}) {
  const skip = new Set(ignore);
  if (!skip.has('kind') && filters.kind && lead?.leadKind !== filters.kind) return false;
  if (!skip.has('status') && filters.status && columnOf(lead?.status) !== filters.status) return false;
  if (!skip.has('overdue') && filters.overdue && !isOverdue(lead)) return false;
  if (!skip.has('range') && !withinCreatedRange(lead, filters.from, filters.to)) return false;
  if (!skip.has('q') && !matchesSearch(lead, filters.q)) return false;
  if (!skip.has('city') && !sameCity(lead?.city, filters.city)) return false;
  if (!skip.has('businessType') && filters.businessType && lead?.businessType !== filters.businessType) return false;
  return true;
}

export function filterBoardLeads(leads, filters) {
  return (leads || []).filter((lead) => matchesBoardFilters(lead, filters));
}

export function distinctCities(leads) {
  const seen = new Map();
  (leads || []).forEach((lead) => {
    const label = normalizeCity(lead?.city);
    if (!label) return;
    const key = label.toLocaleLowerCase('pt-BR');
    if (!seen.has(key)) seen.set(key, label);
  });
  return [...seen.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export function distinctBusinessTypes(leads) {
  const seen = new Map();
  (leads || []).forEach((lead) => {
    const id = lead?.businessType;
    if (!id) return;
    if (!seen.has(id)) seen.set(id, businessTypeLabel(id));
  });
  return [...seen.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

export function clearLocationFilters(filters) {
  return { ...filters, city: '', businessType: '' };
}
