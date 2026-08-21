import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Snackbar,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Loading } from '../../../../commons/components/Loading';
import { GenericError } from '../../../../commons/components/GenericError';
import { CategoryFormDialog } from '../components/CategoryFormDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { useGetCategories, usePostCategory } from './hooks/useGetCategories';
import { useDeleteCategory } from './hooks/useDeleteCategories';
import { CategoryContext } from './providers/CategoryContext';
import './Category.css';

export function CategoryContainer({
  onCategoriesChange,
  onCategoryDeleted,
  refreshToken = 0,
  productCounts = {},
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const { categories, loading, error, refetch } = useGetCategories(refreshKey + refreshToken);
  const {
    saveCategory,
    saving,
    errorMessage,
    resetSaveState,
  } = usePostCategory();
  const {
    deleteCategoryById,
    successToDeleteCategory,
    errorToDeleteCategory,
    resetDeleteStateCategory,
    errorMessage: deleteErrorMessage,
  } = useDeleteCategory();

  const {
    selectedCategory,
    setSelectedCategory,
    setShowCategories,
    setErrorToLoadCategories,
  } = useContext(CategoryContext);

  useEffect(() => {
    setShowCategories(true);
    setErrorToLoadCategories(false);
    onCategoriesChange?.(categories);
  }, [categories, onCategoriesChange, setShowCategories, setErrorToLoadCategories]);

  useEffect(() => {
    if (categories.length === 0) return;
    const stillExists = selectedCategory?.id
      && categories.some((c) => c.id === selectedCategory.id);
    if (!stillExists) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory, setSelectedCategory]);

  useEffect(() => {
    if (successToDeleteCategory) {
      setToast({
        open: true,
        message: 'Categoria excluída',
        severity: 'success',
      });
      setDeleteTarget(null);
      resetDeleteStateCategory();
      setRefreshKey((k) => k + 1);
      setSelectedCategory({});
      onCategoryDeleted?.();
    }
  }, [successToDeleteCategory, resetDeleteStateCategory, setSelectedCategory, onCategoryDeleted]);

  useEffect(() => {
    if (errorToDeleteCategory) {
      setToast({
        open: true,
        message:
          deleteErrorMessage ||
          'Não foi possível excluir a categoria. Verifique se há produtos vinculados.',
        severity: 'error',
      });
      resetDeleteStateCategory();
    }
  }, [errorToDeleteCategory, deleteErrorMessage, resetDeleteStateCategory]);

  const openCreate = () => {
    resetSaveState();
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEdit = (category) => {
    resetSaveState();
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleSave = async (form) => {
    try {
      await saveCategory(form);
      setFormOpen(false);
      setEditingCategory(null);
      setToast({
        open: true,
        message: form.id ? 'Categoria atualizada' : 'Categoria criada',
        severity: 'success',
      });
      setRefreshKey((k) => k + 1);
    } catch (_) {
      // erro exibido no dialog
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await saveCategory({
        ...category,
        active: !(category.active !== false),
      });
      setToast({
        open: true,
        message: category.active !== false ? 'Categoria desativada' : 'Categoria ativada',
        severity: 'success',
      });
      setRefreshKey((k) => k + 1);
    } catch (_) {
      setToast({ open: true, message: 'Erro ao atualizar status', severity: 'error' });
    }
  };

  if (loading) {
    return <Loading loadingMessage="Carregando categorias..." />;
  }

  if (error) {
    return <GenericError onTryAgain={refetch} />;
  }

  return (
    <>
      <CategoryFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
          resetSaveState();
        }}
        onSave={handleSave}
        category={editingCategory}
        saving={saving}
        errorMessage={errorMessage}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteCategoryById(deleteTarget.id)}
        itemType="category"
        itemName={deleteTarget?.name}
      />

      <Box className="category-header">
        <Typography variant="h5" className="category-title">
          Categorias
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{
            backgroundColor: 'transparent !important',
            color: '#7b2cbf !important',
            border: '1px solid #7b2cbf !important',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#7b2cbf !important',
              color: '#fff !important',
            },
          }}
        >
          Criar categoria
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Box className="category-empty">
          <Typography sx={{ mb: 2, color: '#666' }}>
            Nenhuma categoria cadastrada. Crie uma categoria para poder cadastrar produtos.
          </Typography>
          <Button variant="contained" onClick={openCreate} sx={{ backgroundColor: '#7b2cbf' }}>
            Criar categoria
          </Button>
        </Box>
      ) : (
        <Box className="category-list">
          {categories.map((category) => {
            const isSelected = selectedCategory?.id === category.id;
            const isActive = category.active !== false;
            const fromProducts = productCounts[String(category.id)];
            const productCount =
              typeof fromProducts === 'number'
                ? fromProducts
                : Number(category.productCount) || 0;
            return (
              <Card
                key={category.id}
                className={`category-manage-card ${isSelected ? 'selected' : ''} ${!isActive ? 'inactive' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent>
                  <Box className="category-card-top">
                    <Typography variant="h6" className="category-card-name">
                      {category.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={isActive ? 'Ativa' : 'Inativa'}
                      sx={
                        isActive
                          ? {
                              backgroundColor: 'var(--color-primary)',
                              color: '#fff',
                              fontWeight: 600,
                            }
                          : undefined
                      }
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {productCount} {productCount === 1 ? 'produto' : 'produtos'}
                  </Typography>
                  <Box className="category-card-actions" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={isActive ? 'Desativar' : 'Ativar'}>
                      <Switch
                        size="small"
                        checked={isActive}
                        onChange={() => handleToggleActive(category)}
                        color="secondary"
                      />
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(category)}
                      sx={{ color: 'var(--color-primary)' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(category)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

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
