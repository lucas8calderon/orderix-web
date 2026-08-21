import { useState } from "react";
import { deleteCategories } from "../service/categoryService";

export const useDeleteCategory = () => {
    const [loadingToDeleteCategory, setLoadingToDeleteCategory] = useState(false);
    const [errorToDeleteCategory, setErrorToDeleteCategory] = useState(false);
    const [successToDeleteCategory, setSuccessToDeleteCategory] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const deleteCategoryById = (categoryId) => {
        if (categoryId != null) {
            setLoadingToDeleteCategory(true);
            setErrorMessage('');

            deleteCategories(categoryId).then(() => {
                setErrorToDeleteCategory(false);
                setLoadingToDeleteCategory(false);
                setSuccessToDeleteCategory(true);
            }).catch((error) => {
                setErrorToDeleteCategory(true);
                setLoadingToDeleteCategory(false);
                setSuccessToDeleteCategory(false);
                setErrorMessage(
                  error?.response?.data?.message ||
                    'Erro ao excluir categoria'
                );
            });
        } else {
            setErrorToDeleteCategory(true);
            setErrorMessage('Categoria inválida');
        }
    };

    const resetDeleteStateCategory = () => {
      setLoadingToDeleteCategory(false);
      setErrorToDeleteCategory(false);
      setSuccessToDeleteCategory(false);
      setErrorMessage('');
    };

    return {
      loadingToDeleteCategory,
      errorToDeleteCategory,
      successToDeleteCategory,
      deleteCategoryById,
      resetDeleteStateCategory,
      errorMessage,
    };
};
