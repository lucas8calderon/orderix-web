import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  MenuItem,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Loading } from '../../../../commons/components/Loading';
import { GenericError } from '../../../../commons/components/GenericError';
import { SearchBar } from '../../employees/components/SearchBar';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { useGetProducts } from './hooks/useGetProducts';
import { usePostProducts } from './hooks/usePostProducts';
import { useDeleteProduct } from './hooks/useDeleteProduct';
import './Product.css';
import { EmptyState } from '../../../../commons/components/EmptyState';
import { RowActions } from '../../../../commons/components/RowActions';
import { StatusBadge } from '../../../../commons/components/StatusBadge';
import { FilterBar } from '../../../../commons/components/FilterBar';
import { resolveMenuImage } from '../utils/defaultMenuImage';
import {
  buildCategoryTree,
  categoryPathLabel,
  collectCategoryAndDescendantIds,
} from '../utils/categoryTree';

function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductContainer({
  onManageCategories,
  categories = [],
  refreshToken = 0,
  presetCategoryId = null,
  onPresetCategoryConsumed,
  onProductsChanged,
  onProductsLoaded,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState({ key: 'name', direction: 'asc' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const { products, loading, error, refetch } = useGetProducts(refreshKey + refreshToken);
  const {
    saveProduct,
    newProductLoading,
    errorMessage,
    resetPostState,
  } = usePostProducts();
  const {
    deleteProductById,
    successToDelete,
    errorToDelete,
    resetDeleteState,
  } = useDeleteProduct();

  useEffect(() => {
    onProductsLoaded?.(products);
  }, [products, onProductsLoaded]);

  useEffect(() => {
    if (successToDelete) {
      setToast({ open: true, message: 'Produto excluído', severity: 'success' });
      setDeleteTarget(null);
      resetDeleteState();
      setRefreshKey((k) => k + 1);
      onProductsChanged?.();
    }
  }, [successToDelete, resetDeleteState, onProductsChanged]);

  useEffect(() => {
    if (errorToDelete) {
      setToast({ open: true, message: 'Erro ao excluir produto', severity: 'error' });
      resetDeleteState();
    }
  }, [errorToDelete, resetDeleteState]);

  const filteredProducts = useMemo(() => {
    let list = products;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((p) => (p.name || '').toLowerCase().includes(term));
    }

    if (categoryFilter !== 'all') {
      const ids = collectCategoryAndDescendantIds(categoryFilter, categories);
      list = list.filter((p) => ids.has(String(p.categoryId)));
    }

    if (statusFilter !== 'all') list = list.filter(p => (p.isAvailable !== false) === (statusFilter === 'active'));
    return [...list].sort((a, b) => (sort.direction === 'asc' ? 1 : -1) * (sort.key === 'value' ? Number(a.value) - Number(b.value) : String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR')));
  }, [products, searchTerm, categoryFilter, categories, statusFilter, sort]);
  useEffect(() => { setPage(0); }, [searchTerm, categoryFilter, statusFilter, rowsPerPage, sort]);
  const safePage = Math.min(page, Math.max(0, Math.ceil(filteredProducts.length / rowsPerPage) - 1));
  const pageProducts = filteredProducts.slice(safePage * rowsPerPage, (safePage + 1) * rowsPerPage);
  const toggleSort = key => setSort(current => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const categoryOptions = useMemo(() => {
    const options = [];
    categoryTree.forEach((root) => {
      options.push({ id: String(root.id), label: root.name });
      (root.children || []).forEach((child) => {
        options.push({ id: String(child.id), label: child.name, nested: true });
      });
    });
    return options;
  }, [categoryTree]);

  useEffect(() => {
    if (presetCategoryId == null) return;
    resetPostState();
    setEditingProduct({ categoryId: presetCategoryId });
    setFormOpen(true);
    onPresetCategoryConsumed?.();
  }, [presetCategoryId, resetPostState, onPresetCategoryConsumed]);

  const openCreate = () => {
    if (!categories.length) {
      setToast({
        open: true,
        message: 'Cadastre uma categoria antes de criar produtos',
        severity: 'warning',
      });
      return;
    }
    resetPostState();
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product) => {
    resetPostState();
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleSave = async (form) => {
    try {
      await saveProduct(form);
      setFormOpen(false);
      setEditingProduct(null);
      setToast({
        open: true,
        message: form.id ? 'Produto atualizado' : 'Produto criado',
        severity: 'success',
      });
      setRefreshKey((k) => k + 1);
      onProductsChanged?.();
    } catch (_) {
      // erro no dialog
    }
  };

  if (loading) {
    return <Loading loadingMessage="Carregando produtos..." />;
  }

  if (error) {
    return <GenericError onTryAgain={refetch} message="Não foi possível carregar os produtos." />;
  }

  return (
    <>
      <ProductFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingProduct(null);
          resetPostState();
        }}
        onSave={handleSave}
        product={editingProduct}
        categories={categories}
        saving={newProductLoading}
        errorMessage={errorMessage}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteProductById(deleteTarget.id)}
        itemType="product"
        itemName={deleteTarget?.name}
      />

      <Box className="product-header">
        <Typography variant="h5" component="h2" className="product-title">
          Produtos
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={!categories.length}
          variant="contained"
        >
          Cadastrar produto
        </Button>
      </Box>

      {!categories.length && <Alert severity="info" sx={{ mb: 2 }} action={<Button onClick={onManageCategories}>Criar categoria</Button>}>Comece criando uma categoria para organizar seus produtos.</Alert>}
      <FilterBar label="Busca de produtos">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Buscar produtos"
        />
        <TextField select size="small" label="Categoria" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="all">Todas</MenuItem>
          {categoryOptions.map((option) => (
            <MenuItem key={option.id} value={option.id} sx={option.nested ? { pl: 3 } : undefined}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField select size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">Todos os status</MenuItem>
          <MenuItem value="active">Ativo</MenuItem>
          <MenuItem value="inactive">Inativo</MenuItem>
        </TextField>
      </FilterBar>

      <TableContainer component={Paper} className="product-table product-table-desktop">
        <Table aria-label="Produtos do catálogo">
          <TableHead>
            <TableRow>
              <TableCell sortDirection={sort.key === 'name' ? sort.direction : false}><TableSortLabel active={sort.key === 'name'} direction={sort.direction} onClick={() => toggleSort('name')}>Produto</TableSortLabel></TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right" sortDirection={sort.key === 'value' ? sort.direction : false}><TableSortLabel active={sort.key === 'value'} direction={sort.direction} onClick={() => toggleSort('value')}>Preço</TableSortLabel></TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <EmptyState title={products.length ? 'Nenhum produto encontrado' : 'Seu catálogo começa aqui'} description={products.length ? 'Tente outro nome, categoria ou status.' : 'Cadastre produtos para montar seu cardápio e começar a vender.'} actionLabel={products.length ? undefined : categories.length ? 'Cadastrar produto' : 'Criar categoria'} onAction={categories.length ? openCreate : onManageCategories} />
                </TableCell>
              </TableRow>
            ) : (
              pageProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={resolveMenuImage(product.image)}
                        alt=""
                        sx={{
                          width: 40,
                          height: 40,
                          objectFit: 'contain',
                          borderRadius: '8px',
                          border: '1px solid var(--color-border)',
                          backgroundColor: '#fff',
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{product.name}</Typography>
                        {product.observation ? (
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { sm: 280 }, wordBreak: 'break-word' }}>
                            {product.observation}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ wordBreak: 'break-word' }}>
                    {product.categoryId
                      ? categoryPathLabel(
                          categories.find((c) => String(c.id) === String(product.categoryId)),
                          categories
                        ) || product.categoryName || '—'
                      : '—'}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{formatPrice(product.value)}</TableCell>
                  <TableCell>
                    <StatusBadge label={product.isAvailable !== false ? 'Ativo' : 'Inativo'} tone={product.isAvailable !== false ? 'success' : 'neutral'} />
                  </TableCell>
                  <TableCell align="right">
                    <RowActions name={product.name} onEdit={() => openEdit(product)} onDelete={() => setDeleteTarget(product)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box className="product-cards-mobile">
        {filteredProducts.length === 0 ? (
          <EmptyState title={products.length ? 'Nenhum produto encontrado' : 'Seu catálogo começa aqui'} description={products.length ? 'Tente outro nome, categoria ou status.' : 'Cadastre produtos para montar seu cardápio e começar a vender.'} actionLabel={products.length ? undefined : categories.length ? 'Cadastrar produto' : 'Criar categoria'} onAction={categories.length ? openCreate : onManageCategories} />
        ) : (
          pageProducts.map((product) => (
            <Paper key={product.id} className="product-mobile-card" elevation={0}>
              <Box className="product-mobile-card-header">
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0, flex: 1 }}>
                  <Box
                    component="img"
                    src={resolveMenuImage(product.image)}
                    alt=""
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#fff',
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {product.categoryId
                        ? categoryPathLabel(
                            categories.find((c) => String(c.id) === String(product.categoryId)),
                            categories
                          ) || product.categoryName || '—'
                        : '—'}
                    </Typography>
                  </Box>
                </Box>
                <StatusBadge label={product.isAvailable !== false ? 'Ativo' : 'Inativo'} tone={product.isAvailable !== false ? 'success' : 'neutral'} />
              </Box>
              {product.observation ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-word' }}>
                  {product.observation}
                </Typography>
              ) : null}
              <Box className="product-mobile-card-footer">
                <Typography fontWeight={700}>{formatPrice(product.value)}</Typography>
                <Box>
                  <RowActions name={product.name} onEdit={() => openEdit(product)} onDelete={() => setDeleteTarget(product)} />
                </Box>
              </Box>
            </Paper>
          ))
        )}
      </Box>

      <TablePagination component="div" count={filteredProducts.length} page={safePage} onPageChange={(_, next) => setPage(next)} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10, 25, 50]} onRowsPerPageChange={event => setRowsPerPage(Number(event.target.value))} />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
