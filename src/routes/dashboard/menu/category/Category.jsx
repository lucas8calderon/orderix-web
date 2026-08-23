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
import { resolveMenuImage } from '../utils/defaultMenuImage';
import {
  buildCategoryTree,
  productCountForCategory,
} from '../utils/categoryTree';
import './Category.css';

export function CategoryContainer({
  onCategoriesChange,
  onCategoryDeleted,
  onAddProduct,
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
      setSelectedCategory(categories.find((c) => c.parentId == null) || categories[0]);
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

  const openCreate = (parentId = null) => {
    resetSaveState();
    setEditingCategory(parentId != null ? { parentId } : null);
    setFormOpen(true);
  };

  const openCreateSubcategory = (parent) => {
    openCreate(parent.id);
  };

  const openEdit = (category) => {
    resetSaveState();
    setEditingCategory(category);
    setFormOpen(true);
  };

  const handleSave = async (form) => {
    try {
      await saveCategory({
        ...form,
        parentId: form.parentId || editingCategory?.parentId || '',
      });
      setFormOpen(false);
      setEditingCategory(null);
      setToast({
        open: true,
        message: form.id
          ? 'Categoria atualizada'
          : form.parentId
            ? 'Subcategoria criada'
            : 'Categoria criada',
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

  const categoryTree = buildCategoryTree(categories);

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
        onDelete={
          editingCategory?.id
            ? () => {
                setFormOpen(false);
                setDeleteTarget(editingCategory);
              }
            : undefined
        }
        category={editingCategory}
        categories={categories}
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
          onClick={() => openCreate()}
          sx={{
            backgroundColor: 'transparent !important',
            color: 'var(--color-primary) !important',
            border: '1px solid var(--color-primary) !important',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'var(--color-primary) !important',
              color: '#fff !important',
            },
          }}
        >
          Criar categoria
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Box className="category-empty">
          <Typography sx={{ mb: 2, color: 'text.secondary' }}>
            Nenhuma categoria cadastrada. Crie uma categoria para poder cadastrar produtos.
          </Typography>
          <Button variant="contained" onClick={() => openCreate()} sx={{ backgroundColor: 'var(--color-primary)' }}>
            Criar categoria
          </Button>
        </Box>
      ) : (
        <Box className="category-list">
          {categoryTree.map((root) => {
            const children = root.children || [];
            return (
              <CategoryManageCard
                key={root.id}
                category={root}
                isSelected={selectedCategory?.id === root.id}
                productCount={productCountForCategory(root, productCounts, categories)}
                subcategories={children}
                productCounts={productCounts}
                categories={categories}
                selectedCategoryId={selectedCategory?.id}
                onSelect={() => setSelectedCategory(root)}
                onToggle={() => handleToggleActive(root)}
                onEdit={() => openEdit(root)}
                onDelete={() => setDeleteTarget(root)}
                onAddChild={() => openCreateSubcategory(root)}
                onEditChild={(child) => openEdit(child)}
                onAddProduct={(child) => onAddProduct?.(child)}
              />
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

function CategoryManageCard({
  category,
  isSelected,
  productCount = 0,
  subcategories = [],
  productCounts = {},
  categories = [],
  selectedCategoryId,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
  onEditChild,
  onAddProduct,
}) {
  const isActive = category.active !== false;
  const details = [
    `${productCount} ${productCount === 1 ? 'produto' : 'produtos'}`,
  ];
  if (subcategories.length > 0) {
    details.push(`${subcategories.length} ${subcategories.length === 1 ? 'subcategoria' : 'subcategorias'}`);
  }

  return (
    <Card
      className={`category-manage-card ${isSelected ? 'selected' : ''} ${!isActive ? 'inactive' : ''}`}
      onClick={onSelect}
    >
      <CardContent>
        <Box className="category-card-top">
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0, flex: 1 }}>
            <Box
              component="img"
              src={resolveMenuImage(category.image)}
              alt=""
              sx={{
                width: 48,
                height: 48,
                objectFit: 'contain',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#fff',
                flexShrink: 0,
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" className="category-card-name">
                {category.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {details.join(' · ')}
              </Typography>
            </Box>
          </Box>
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
        <Box className="category-card-actions" onClick={(e) => e.stopPropagation()}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={onAddChild}
            sx={{
              textTransform: 'none',
              color: 'var(--color-primary)',
              mr: 'auto',
            }}
          >
            Subcategoria
          </Button>
          <Tooltip title={isActive ? 'Desativar' : 'Ativar'}>
            <Switch
              size="small"
              checked={isActive}
              onChange={onToggle}
              color="primary"
            />
          </Tooltip>
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{ color: 'var(--color-primary)' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onDelete}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
        {subcategories.length > 0 ? (
          <Box className="subcategory-carousel-wrap" onClick={(e) => e.stopPropagation()}>
            <Typography className="subcategory-carousel-label">
              Subcategorias
            </Typography>
            <Box className="subcategory-carousel">
              {subcategories.map((child) => (
                <SubcategoryCarouselCard
                  key={child.id}
                  category={child}
                  isSelected={selectedCategoryId === child.id}
                  productCount={productCountForCategory(child, productCounts, categories)}
                  onEdit={() => onEditChild(child)}
                  onAddProduct={() => onAddProduct?.(child)}
                />
              ))}
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SubcategoryCarouselCard({
  category,
  isSelected,
  productCount = 0,
  onEdit,
  onAddProduct,
}) {
  const isActive = category.active !== false;

  return (
    <Card
      className={`subcategory-carousel-card ${isSelected ? 'selected' : ''} ${!isActive ? 'inactive' : ''}`}
      onClick={onEdit}
    >
      <Box
        component="img"
        src={resolveMenuImage(category.image)}
        alt=""
        className="subcategory-carousel-image"
      />
      <Box className="subcategory-carousel-body">
        <Typography className="subcategory-carousel-name">{category.name}</Typography>
        <Typography variant="caption" color="text.secondary">
          {productCount} {productCount === 1 ? 'produto' : 'produtos'}
        </Typography>
        <Button
          size="small"
          fullWidth
          startIcon={<AddIcon />}
          onClick={(e) => {
            e.stopPropagation();
            onAddProduct?.();
          }}
          sx={{
            mt: 0.75,
            textTransform: 'none',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-primary)',
            minHeight: 32,
          }}
        >
          Produto
        </Button>
      </Box>
    </Card>
  );
}
