import { useState } from "react";
import { deleteCategories } from "../service/categoryService";

export const useDeleteCategory = () => {
    const [loadingToDeleteCategory, setLoadingToDeleteCategory] = useState(false);
    const [errorToDeleteCategory, setErrorToDeleteCategory] = useState(false);
    const [successToDeleteCategory, setSuccessToDeleteCategory] = useState(false);

    const deleteCategoryById = (categoryId) => {
        if (categoryId != null) {
            setLoadingToDeleteCategory(true);

            deleteCategories(categoryId).then(response => {
                setErrorToDeleteCategory(false);
                setLoadingToDeleteCategory(false);
                setSuccessToDeleteCategory(true);
            }).catch(error => {
                setErrorToDeleteCategory(true);
                setLoadingToDeleteCategory(false);
                setSuccessToDeleteCategory(false);
            });
        } else {
            setErrorToDeleteCategory(true);
        }
    }

    const resetDeleteStateCategory = () => {
    setLoadingToDeleteCategory(false);
    setErrorToDeleteCategory(false);
    setSuccessToDeleteCategory(false);
  };

    return { loadingToDeleteCategory, errorToDeleteCategory, successToDeleteCategory, deleteCategoryById, resetDeleteStateCategory };
}