import { Grid, ListItemButton, Button, Card, CardContent, Badge, Box  } from '@mui/material';
import { Edit, Trash2} from "lucide-react";
import AddIcon from '@mui/icons-material/Add';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useGetProducts } from './hooks/useGetProducts';
import { usePostProducts } from './hooks/usePostProducts';
import Typography from '@mui/material/Typography';
import { CategoryProductFormDialog } from '../components/CategoryProductFormDialog';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { CardCategory } from '../utils/CardCategory';
import { useState, useContext } from 'react';
import { CategoryContext } from '../category/providers/CategoryContext';
import { Loading } from '../../../../commons/components/Loading';
import { ProductContext } from './providers/ProductContext';
import { useDeleteProduct } from './hooks/useDeleteProduct';
import ErrorDeleteDialog from '../components/ErrorDeleteDialog';
import { ConfirmDeleteDialog } from '../components/ConfirmDeleteDialog';
import { CardProduct } from '../utils/CardProduct';
import './Product.css';

export function ProductContainer() {
    const { 
        selectedCategory, 
        setOpenMenuForm, 
        openMenuForm, 
        errorToLoadCategories, 
        setBlockCategoriesFields 
    } = useContext(CategoryContext);

    const { showProducts, 
        setBlockProductsFields, 
        setOnAddProductResult, 
        handleSuccess, 
        handleError, 
        handleAddNewProduct, 
        setHandleAddNewProduct,
        setHandleDeleteProduct,
        setSelectedProduct, 
        selectedProduct,
        handleDeleteProduct,
        openDeleteDialogProduct, setOpenDeleteDialogProduct 
    } = useContext(ProductContext);

    const { products, loading, emptyResult, error, refetch } = useGetProducts(selectedCategory.id);
    const { successSavingProduct, setSuccessSavingProduct, errorSavingProduct, postProduct } = usePostProducts();
    const { loadingToDelete, errorToDelete, successToDelete, deleteProductById, resetDeleteState } = useDeleteProduct();
    const [openAddProduct, setOpenAddProduct] = useState(false);
   


    const handleOnClose = () => {
        setOnAddProductResult({})
        setOpenAddProduct(false);
        setHandleAddNewProduct(false);
    }

    const onHandleSaveProduct = (product) => {
        postProduct(product);
        setSelectedProduct({});
        setSuccessSavingProduct(false);
    }

    const handleSelectedProduct = (product) => {
        setSelectedProduct(product);
        
    }

    useEffect(() => {   
        if (Object.keys(handleDeleteProduct).length !== 0) {
            deleteProductById(handleDeleteProduct.id);
            setHandleDeleteProduct({});
        }
    }, [handleDeleteProduct]);


    const confirmDelete = () => {
      setHandleDeleteProduct(selectedProduct);
    };

    useEffect(() => {
        if (successToDelete || successSavingProduct) {
             refetch();
             setSelectedProduct({});
             resetDeleteState();
             setOpenDeleteDialogProduct(false);
        }
    }, [successToDelete, successSavingProduct]);
        
    useEffect(() => {
        if (handleAddNewProduct === true) {
            setOnAddProductResult({})
            setBlockProductsFields(false);
            setBlockCategoriesFields(true);
            setOpenAddProduct(true);
        }
    }, [handleAddNewProduct]);

    useEffect(() => {
        if (error) {
            setOnAddProductResult(handleError)
        }
    }, [error])

    useEffect(() => {
        if (successSavingProduct) {
            setOnAddProductResult(handleSuccess);
            refetch();
           
            
        }
    }, [successSavingProduct])

    if (errorToLoadCategories) {
        return null;
    }

    if (!showProducts) {
        return null;
    }

    return (
      <>
        {loading && !loadingToDelete && (
          <Loading loadingMessage={"Carregando produtos..."} />
        )}
        {loadingToDelete && !loading && (
          <Loading loadingMessage={"Excluíndo produto..."} />
        )}

        {errorToDelete && (
          <ErrorDeleteDialog
            open={errorToDelete}
            onClose={resetDeleteState}
            itemName={selectedProduct.name}
          />
        )}

        <ProductFormDialog
          open={openAddProduct}
          onClose={handleOnClose}
          disableEditCategory={true}
          currentCategory={selectedCategory}
          onSaveProduct={onHandleSaveProduct}
        />

        <ConfirmDeleteDialog
          open={openDeleteDialogProduct}
          onClose={() => setOpenDeleteDialogProduct(false)}
          onConfirm={confirmDelete}
          itemType={"product"}
          itemName={selectedProduct?.name}
        />

        <Box className="product-header">
          <Typography variant="h5" className="product-title">
            Produtos
          </Typography>
          <Button
            onClick={() => setHandleAddNewProduct(true)}
            size="medium"
            variant="contained"
            sx={{
              backgroundColor: "transparent !important",
              color: "#7b2cbf !important",
              border: "1px solid #7b2cbf !important",
              "&:hover": {
                backgroundColor: "#7b2cbf !important",
                color: "#fff !important",
              },
            }}
          >
            Novo Produto
          </Button>
        </Box>
        {showProducts && !emptyResult ? (
          <Box className="products-grid">
            {products.map((product) => (
              <Box key={product.id} >
                <ListItemButton
                  sx={{
                    boxShadow: "none", // remove sombra padrão
                    "&:hover": {
                      boxShadow: "none", // remove sombra no hover
                      backgroundColor: "transparent", // opcional: remove fundo cinza
                    },
                  }}
                  onClick={() => handleSelectedProduct(product)}
                >
                  <CardProduct
                    {...product}
                    isSelected={selectedProduct.id === product.id}
                    isCategory={false}
                    isAvailable={product.isAvailable}
                  />
                </ListItemButton>
              </Box>
            ))}
          </Box>
        ) : (
          showProducts &&
          emptyResult && (
            <>
              <Typography variant="h6" sx={{ marginTop: 6, marginLeft: 2 }}>
                Nenhum produto encontrado para esta categoria
              </Typography>
            </>
          )
        )}
      </>
    );
}