import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { EmptyState } from '../../commons/components/EmptyState';
import { EMPTY_PAGE, getApiErrorMessage } from '../../services/partnerService';
import { PARTNER_PAGE_SIZE } from './partnerConstants';
import './PartnerShell.css';

/**
 * Lista paginada genérica (tabela no desktop, cartões no mobile).
 * fetchPage({ page, size }) deve ser estável (módulo ou useCallback).
 */
export default function PartnerPagedList({ fetchPage, columns, renderCard, emptyTitle, emptyDescription, ariaLabel, onRowClick }) {
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
      const result = await fetchPage({ page, size });
      if (current === requestId.current) setData(result || EMPTY_PAGE);
    } catch (failure) {
      if (current === requestId.current) setError(getApiErrorMessage(failure, 'Não foi possível carregar os dados.'));
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [fetchPage, page, size]);

  useEffect(() => { load(); }, [load]);

  const items = data.items || [];

  return (
    <>
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
        <Stack spacing={1} aria-busy="true" aria-label="Carregando">
          {[0, 1, 2, 3].map((row) => <Skeleton key={row} variant="rounded" height={44} />)}
        </Stack>
      )}
      {!loading && !error && items.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
      {!loading && items.length > 0 && (
        <>
          <div className="partner-table-wrap partner-desktop-only">
            <Table size="small" aria-label={ariaLabel}>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>{column.label}</TableCell>
                  ))}
                  {onRowClick && <TableCell align="right" />}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} hover>
                    {columns.map((column) => (
                      <TableCell key={column.key} align={column.align}>{column.render(item)}</TableCell>
                    ))}
                    {onRowClick && (
                      <TableCell align="right">
                        <Button size="small" onClick={() => onRowClick(item)}>Detalhes</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="partner-cards-list partner-mobile-only">
            {items.map((item) => (
              <article key={item.id} className="partner-list-card">
                {renderCard(item)}
                {onRowClick && (
                  <Button size="small" onClick={() => onRowClick(item)} sx={{ mt: 1 }}>Ver detalhes</Button>
                )}
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
    </>
  );
}
