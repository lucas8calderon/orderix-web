import { useState, useEffect } from 'react';
import { addNewProduct } from '../service/productService';

export const usePostProducts = () => {
    const [successSavingProduct, setSuccessSavingProduct] = useState(false);
    const [errorSavingProduct, setErrorSavingProduct] = useState(false);
    const [newProductLoading, setNewProductLoading] = useState(false);

    const postProduct = (product) => {
        setNewProductLoading(true);

        addNewProduct(product)
            .then(response => {
                setSuccessSavingProduct(true);
                setErrorSavingProduct(false);
                setNewProductLoading(false);
            })
            .catch(error => {
                setErrorSavingProduct(true);
                setSuccessSavingProduct(false);
                setNewProductLoading(false);
            });
    };
    

    return { successSavingProduct, errorSavingProduct, postProduct, newProductLoading, setSuccessSavingProduct };
};
