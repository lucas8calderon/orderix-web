import { createContext, useState } from 'react';

export const ProductContext = createContext();

export const ProductProvider = ({ children }) => {  
    let handleSuccess = { show: true, success: true, message: 'Produto criado', severity : 'success' };
    let handleError = { show: true, error: true, message: 'Erro ao criar produto', severity : 'error' };

    const [showProducts, setShowProducts] = useState(false);
    const [blockProductsFields, setBlockProductsFields] = useState(true);
    const [onAddProductResult, setOnAddProductResult] = useState({});
    const [handleAddNewProduct, setHandleAddNewProduct] = useState(false);
    const [handleDeleteProduct, setHandleDeleteProduct] = useState({});
    const [selectedProduct, setSelectedProduct] = useState({});
    const [openDeleteDialogProduct, setOpenDeleteDialogProduct] = useState(false);

    return (
        <ProductContext.Provider value={{
            showProducts, setShowProducts,
            blockProductsFields, setBlockProductsFields,
            onAddProductResult, setOnAddProductResult,
            handleSuccess, handleError,
            handleAddNewProduct, setHandleAddNewProduct,
            selectedProduct, setSelectedProduct,
            handleDeleteProduct, setHandleDeleteProduct,
             openDeleteDialogProduct, setOpenDeleteDialogProduct
        }}>
            {children}
        </ProductContext.Provider>
    );
};