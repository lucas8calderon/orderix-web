import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Loading } from '../../../../commons/components/Loading';
import { GenericError } from '../../../../commons/components/GenericError';
import { SearchBar } from '../../employees/components/SearchBar';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { useGetProducts } from './hooks/useGetProducts';
import { usePostProducts } from './hooks/usePostProducts';
import { useDeleteProduct } from './hooks/useDeleteProduct';
import './Product.css';

function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return '—';
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductContainer({
  categories = [],
  refreshToken = 0,
  onProductsChanged,
  onProductsLoaded,
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
      list = list.filter((p) => String(p.categoryId) === String(categoryFilter));
    }

    if (statusFilter === 'active') {
      list = list.filter((p) => p.isAvailable !== false);
    } else if (statusFilter === 'inactive') {
      list = list.filter((p) => p.isAvailable === false);
    }

    return list;
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const categoryFilters = useMemo(
    () => [
      { id: 'all', label: 'Todas' },
      ...categories.map((c) => ({ id: String(c.id), label: c.name })),
    ],
    [categories]
  );

  const statusFilters = [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Ativos' },
    { id: 'inactive', label: 'Inativos' },
  ];

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
    return <GenericError onTryAgain={refetch} />;
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
        <Typography variant="h5" className="product-title">
          Produtos
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={openCreate}
          disabled={!categories.length}
          sx={{
            backgroundColor: 'transparent !important',
            color: '#7b2cbf !important',
            border: '1px solid #7b2cbf !important',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#7b2cbf !important',
              color: '#fff !important',
            },
            '&.Mui-disabled': {
              borderColor: '#ddd !important',
              color: '#999 !important',
            },
          }}
        >
          Novo produto
        </Button>
      </Box>

      <Box className="product-filters">
        <SearchBar
          onSearch={setSearchTerm}
          placeholder="Buscar produto por nome"
        />
        <Box className="filter-chips-container">
          {categoryFilters.map((filter) => (
            <Box
              key={`cat-${filter.id}`}
              className={`filter-chip ${categoryFilter === filter.id ? 'active' : ''}`}
              onClick={() => setCategoryFilter(filter.id)}
            >
              {filter.label}
            </Box>
          ))}
        </Box>
        <Box className="filter-chips-container">
          {statusFilters.map((filter) => (
            <Box
              key={`status-${filter.id}`}
              className={`filter-chip ${statusFilter === filter.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(filter.id)}
            >
              {filter.label}
            </Box>
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper} className="product-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produto</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Preço</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography sx={{ py: 3, color: '#666' }}>
                    Nenhum produto encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{product.name}</Typography>
                    {product.observation ? (
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 280 }}>
                        {product.observation}
                      </Typography>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    {product.categoryId
                      ? categories.find((c) => c.id === product.categoryId)?.name ||
                        product.categoryName ||
                        '—'
                      : '—'}
                  </TableCell>
                  <TableCell>{formatPrice(product.value)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={product.isAvailable !== false ? 'Ativo' : 'Inativo'}
                      color={product.isAvailable !== false ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(product)} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(product)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
