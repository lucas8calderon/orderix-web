import { useState } from "react";
import { deleteProduct } from "../service/productService";

export const useDeleteProduct = () => {
    const [loadingToDelete, setLoadingToDelete] = useState(false);
    const [errorToDelete, setErrorToDelete] = useState(false);
    const [successToDelete, setSuccessToDelete] = useState(false);

    const deleteProductById = (productId) => {
        if (productId != null) {
            setLoadingToDelete(true);

            deleteProduct(productId).then(response => {
                setErrorToDelete(false);
                setLoadingToDelete(false);
                setSuccessToDelete(true);
            }).catch(error => {
                setErrorToDelete(true);
                setLoadingToDelete(false);
                setSuccessToDelete(false);
            });
        } else {
            setErrorToDelete(true);
        }
    }

    const resetDeleteState = () => {
    setLoadingToDelete(false);
    setErrorToDelete(false);
    setSuccessToDelete(false);
  };

    return { loadingToDelete, errorToDelete, successToDelete, deleteProductById, resetDeleteState };
}