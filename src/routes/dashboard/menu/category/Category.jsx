import * as React from 'react';
import { useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { useGetCategories, usePostCategory } from './hooks/useGetCategories';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { CategoryProductFormDialog } from '../components/CategoryProductFormDialog';
import { Loading } from '../../../../commons/components/Loading';
import { CardCategory } from '../utils/CardCategory';
import { CategoryContext } from './providers/CategoryContext';
import { ProductContext } from '../product/providers/ProductContext';
import { useState, useContext } from 'react';
import { GenericError } from '../../../../commons/components/GenericError';
import { useDeleteCategory } from './hooks/useDeleteCategories';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import './Category.css';

export function CategoryContainer() {
    const [tryAgain, setTryAgain] = useState(false);

    const [lastCategoryAux, setLastCategoryAux] = useState({});

    const { categories, error, success, emptyResult, loading } = useGetCategories(tryAgain);

    const { successOnSaveCategory, setSuccessOnSaveCategory, errorOnSaveCategory, postCategory } = usePostCategory();
    const { loadingToDeleteCategory, errorToDeleteCategory, successToDeleteCategory, deleteCategoryById, resetDeleteStateCategory } = useDeleteCategory();

    const { setShowProducts, setBlockProductsFields, showProducts } = useContext(ProductContext);

    const { setSelectedCategory,
        setShowCategories,
        selectedCategory,
        setOpenMenuForm,
        openMenuForm,
        setOnAddCategoryResult,
        handleSuccess,
        handleError,
        handleAddNewCategory,
        setHandleAddNewCategory,
        setErrorToLoadCategories,
        setBlockCategoriesFields,
        handleDeleteCategory,
        openDeleteDialogCategory,
        setOpenDeleteDialogCategory,
        setHandleDeleteCategory } = useContext(CategoryContext);

    const handleOnFormClose = () => {
        setOnAddCategoryResult({});
        setSelectedCategory(lastCategoryAux);
        setOpenMenuForm(false);
        setShowProducts(true);
        setHandleAddNewCategory(false);
    }

    const handleOnTryAgain = () => {
        setTryAgain(!tryAgain);
    }

    const handleOnSaveCategory = (category) => {
      setOnAddCategoryResult({}); // limpa mensagens anteriores
      postCategory(category);
    };

    useEffect(() => {
        if (handleAddNewCategory == true) {
            setOnAddCategoryResult({});
            setBlockCategoriesFields(false);
            setBlockProductsFields(true);
            setShowProducts(false);
            setLastCategoryAux(selectedCategory);
            setSelectedCategory({});
            setOpenMenuForm(true);
        }
    }, [handleAddNewCategory]);

    useEffect(() => {
        if (success && showProducts) {
            setShowCategories(true);
            setShowProducts(true);
            setErrorToLoadCategories(false);
        }
    }, [success, showProducts]);

    useEffect(() => {
  if (successOnSaveCategory || successToDeleteCategory) {
    setOnAddCategoryResult(handleSuccess);
    setBlockCategoriesFields(true);
    setBlockProductsFields(false);
    setSelectedCategory("");
    setShowProducts(true);

    // força refetch de forma segura
    setTryAgain(prev => !prev);

    // fecha o form aqui, somente após sucesso
    setOpenMenuForm(false);
    setHandleAddNewCategory(false);
    setSuccessOnSaveCategory(false);
  }
}, [successOnSaveCategory, successToDeleteCategory]);

    useEffect(() => {
        setShowProducts(!loading);

    }, [loading]);

    useEffect(() => {
        if (Object.keys(handleDeleteCategory).length !== 0) {
            deleteCategoryById(handleDeleteCategory.id);
        }
    }, [handleDeleteCategory]);

    useEffect(() => {
        if (successToDeleteCategory) {
            setTryAgain(!tryAgain);
            setSelectedCategory({});
            setShowProducts(false);
            resetDeleteStateCategory();
            setOpenDeleteDialogCategory(false);
        }
    }, [successToDeleteCategory]);

    useEffect(() => {
        setShowProducts(!emptyResult);
        setShowCategories(!emptyResult);
    }, [emptyResult]);

    useEffect(() => {
        setShowProducts(!error);
        setShowCategories(!error);

        if (error) {
            setOnAddCategoryResult(handleError);
            setErrorToLoadCategories(true);
        }
    }, [error]);

    // Seleciona a primeira categoria como padrão se nenhuma estiver selecionada
    useEffect(() => {
        if (success && categories && categories.length > 0 && (!selectedCategory || !selectedCategory.id)) {
            setSelectedCategory(categories[0]);
        }
    }, [success, categories, selectedCategory, setSelectedCategory]);

    useEffect(() => {   
            if (Object.keys(handleDeleteCategory).length !== 0) {
                deleteCategoryById(handleDeleteCategory.id);
            }
        }, [handleDeleteCategory]);
    
        const confirmDelete = () => {
          setHandleDeleteCategory(selectedCategory);
        };

    return (
      <>
        <CategoryProductFormDialog
          open={openMenuForm}
          onClose={handleOnFormClose}
          disableEditCategory={false}
          onSaveCategory={handleOnSaveCategory}
        />

        <ConfirmDeleteDialog
          open={openDeleteDialogCategory}
          onClose={() => setOpenDeleteDialogCategory(false)}
          onConfirm={confirmDelete}
          itemType={"category"}
          itemName={selectedCategory.name}
        />

        {loading && <Loading loadingMessage="Carregando cardápio..." />}
        {emptyResult && (
          <EmptyMenu
            handleOnSaveCategory={handleOnSaveCategory}
            handleOnClose={handleOnFormClose}
          />
        )}
        {error && <GenericError onTryAgain={handleOnTryAgain} />}

        {success ? (
          <>
            <Box className="category-header">
              <Typography variant="h5" className="category-title">
                Categorias
              </Typography>
              <Button
                className="add-category-btn"
                onClick={() => setHandleAddNewCategory(true)}
                size="medium"
                sx={{
                  backgroundColor: 'transparent !important',
                  color: '#7b2cbf !important',
                  border: '1px solid #7b2cbf !important',
                  '&:hover': {
                    backgroundColor: '#7b2cbf !important',
                    color: '#fff !important'
                  }
                }}
              >
                Nova Categoria
              </Button>
            </Box>
            <CategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setShowProducts={setShowProducts}
            />
          </>
        ) : null}
      </>
    );
}

function EmptyMenu() {
    const { setOpenMenuForm } = useContext(CategoryContext);

    return (
        <>
            <Typography variant="h7" sx={{ display: 'block', textAlign: 'center', marginTop: 6 }}>O cardápio está vazio</Typography>
            <Button onClick={() => setOpenMenuForm(true)} variant="contained">Criar cardápio</Button>
        </>
    );
}

function CategoryList({ categories, selectedCategory, setSelectedCategory, setShowProducts }) {
    const [firstTimeOpened, setFirstTimeOpened] = useState(true);

    const handleSetSelectedCategory = (category) => {
        setShowProducts(true);
        setSelectedCategory(category);
    }


    //O código não é executado apenas uma vez
    /* if (firstTimeOpened && categories.length > 0) {
         let firstCategory = categories[0];
         console.log('caiu');
 
         setSelectedCategory(firstCategory);
         setFirstTimeOpened(false);
     }*/

    return (
        <Box className="category-list">
            {categories.map((category) => {
                return (
                  <Box key={category.id} className="category-item">
                    <ListItemButton
                      sx={{
                        boxShadow: "none", // remove sombra padrão
                        "&:hover": {
                          boxShadow: "none", // remove sombra no hover
                          backgroundColor: "transparent", // opcional: remove fundo cinza
                        },
                      }}
                      className="category-button"
                      onClick={() => handleSetSelectedCategory(category)}
                    >
                      <CardCategory
                        {...category}
                        isSelected={selectedCategory.id === category.id}
                      />
                    </ListItemButton>
                  </Box>
                );
            })}
        </Box>
    );
}