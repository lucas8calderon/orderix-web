import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { EmptyState } from '../../commons/components/EmptyState';
import { formatCurrency, formatDate } from '../../services/accessControl';
import { EMPTY_PAGE, formatWhatsappDisplay, getApiErrorMessage, listPartnerReferrals } from '../../services/partnerService';
import { PARTNER_PAGE_SIZE, REFERRAL_STATUS_OPTIONS } from './partnerConstants';
import { PartnerStatusChip } from './PartnerStatusChip';

const EMPTY_FILTERS = { status: '', from: '', to: '', name: '' };

/** "Minhas indicações": filtros, paginação e estados vazio/carregando/erro. */
export default function PartnerReferralsPanel({ onNewReferral, refreshKey = 0 }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(PARTNER_PAGE_SIZE);
  const [data, setData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const result = await listPartnerReferrals({ ...applied, page, size });
      if (current === requestId.current) setData(result || EMPTY_PAGE);
    } catch (failure) {
      if (current === requestId.current) {
        setError(getApiErrorMessage(failure, 'Não foi possível carregar suas indicações.'));
      }
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [applied, page, size]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const hasFilters = Object.values(applied).some(Boolean);
  const items = data.items || [];

  const setFilter = (field) => (event) => setFilters((current) => ({ ...current, [field]: event.target.value }));

  const applyFilters = (event) => {
    event?.preventDefault();
    if (filters.from && filters.to && filters.from > filters.to) {
      setError('A data inicial não pode ser maior que a final.');
      return;
    }
    setPage(0);
    setApplied({ ...filters, name: filters.name.trim() });
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(0);
  };

  return (
    <section className="partner-card" aria-labelledby="partner-referrals-title">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 id="partner-referrals-title" className="partner-card-title">Minhas indicações</h2>
          <p className="partner-card-subtitle" style={{ margin: 0 }}>Acompanhe o andamento de cada estabelecimento indicado.</p>
        </div>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onNewReferral}>
          Nova indicação
        </Button>
      </div>

      <form onSubmit={applyFilters} aria-label="Filtrar indicações">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }} alignItems={{ md: 'flex-end' }}>
          <TextField
            size="small"
            label="Buscar por nome"
            value={filters.name}
            onChange={setFilter('name')}
            sx={{ flex: 1.4, minWidth: 0 }}
          />
          <FormControl size="small" sx={{ flex: 1, minWidth: 160 }}>
            <InputLabel id="partner-ref-status">Status</InputLabel>
            <Select labelId="partner-ref-status" label="Status" value={filters.status} onChange={setFilter('status')}>
              <MenuItem value="">Todos</MenuItem>
              {REFERRAL_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            type="date"
            label="De"
            value={filters.from}
            onChange={setFilter('from')}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: 150 }}
          />
          <TextField
            size="small"
            type="date"
            label="Até"
            value={filters.to}
            onChange={setFilter('to')}
            InputLabelProps={{ shrink: true }}
            sx={{ flex: 1, minWidth: 150 }}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="outlined" startIcon={<SearchIcon />}>Filtrar</Button>
            {(hasFilters || Object.values(filters).some(Boolean)) && (
              <Button type="button" onClick={clearFilters}>Limpar</Button>
            )}
          </Stack>
        </Stack>
      </form>

      {error && (
        <Alert
          severity="error"
          role="alert"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={load}>Tentar novamente</Button>}
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Stack spacing={1} aria-busy="true" aria-label="Carregando indicações">
          {[0, 1, 2, 3].map((row) => <Skeleton key={row} variant="rounded" height={44} />)}
        </Stack>
      )}

      {!loading && !error && items.length === 0 && (
        hasFilters ? (
          <EmptyState
            title="Nenhuma indicação encontrada"
            description="Ajuste ou limpe os filtros para ver outras indicações."
            actionLabel="Limpar filtros"
            onAction={clearFilters}
          />
        ) : (
          <EmptyState
            title="Você ainda não fez indicações"
            description="Indique o primeiro estabelecimento ou compartilhe seu link de indicação para começar."
            actionLabel="Nova indicação"
            onAction={onNewReferral}
          />
        )
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="partner-table-wrap partner-desktop-only">
            <Table size="small" aria-label="Minhas indicações">
              <TableHead>
                <TableRow>
                  <TableCell>Estabelecimento</TableCell>
                  <TableCell>Contato</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Indicada em</TableCell>
                  <TableCell align="right">Comissão prevista</TableCell>
                  <TableCell align="right">Comissão recebida</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                      {item.establishmentName}
                      {item.segment && (
                        <Typography variant="caption" color="text.secondary" display="block">{item.segment}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.contactName || '—'}
                      {item.commercialWhatsapp && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatWhatsappDisplay(item.commercialWhatsapp)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><PartnerStatusChip kind="referral" value={item.status} /></TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.estimatedCommission)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.paidCommission)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="partner-cards-list partner-mobile-only">
            {items.map((item) => (
              <article key={item.id} className="partner-list-card">
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>{item.establishmentName}</Typography>
                  <PartnerStatusChip kind="referral" value={item.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.contactName || 'Sem contato informado'} · {formatDate(item.createdAt)}
                </Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Prevista: <strong>{formatCurrency(item.estimatedCommission)}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Recebida: <strong>{formatCurrency(item.paidCommission)}</strong>
                  </Typography>
                </Stack>
              </article>
            ))}
          </div>
        </>
      )}

      {!error && data.totalElements > 0 && (
        <TablePagination
          component="div"
          count={data.totalElements}
          page={page}
          rowsPerPage={size}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_event, next) => setPage(next)}
          onRowsPerPageChange={(event) => {
            setSize(Number(event.target.value));
            setPage(0);
          }}
        />
      )}
    </section>
  );
}
