import { createContext, useState } from 'react';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    let handleSuccess = { message: 'Categoria criada! Agora insira produtos a ela.', severity : 'success' };
    let handleError = { message: 'Erro ao criar categorias', severity : 'error' };

    const [selectedCategory, setSelectedCategory] = useState({});
    const [showCategories, setShowCategories] = useState(false);
    const [openMenuForm, setOpenMenuForm] = useState(false);
    const [onAddCategoryResult, setOnAddCategoryResult] = useState({});
    const [handleAddNewCategory, setHandleAddNewCategory] = useState();
    const [handleDeleteCategory, setHandleDeleteCategory] = useState({});
    const [blockCategoriesFields, setBlockCategoriesFields] = useState(false);
    const [errorToLoadCategories, setErrorToLoadCategories] = useState(true);
    const [openDeleteDialogCategory, setOpenDeleteDialogCategory] = useState(false);

    return (
        <CategoryContext.Provider value={{
            selectedCategory, setSelectedCategory,
            showCategories, setShowCategories,
            openMenuForm, setOpenMenuForm,
            onAddCategoryResult, setOnAddCategoryResult,
            handleAddNewCategory, setHandleAddNewCategory,
            blockCategoriesFields, setBlockCategoriesFields,
            handleSuccess, handleError,
            errorToLoadCategories, setErrorToLoadCategories, 
            handleDeleteCategory, setHandleDeleteCategory,
            openDeleteDialogCategory, setOpenDeleteDialogCategory
        }}>
            {children}
        </CategoryContext.Provider>
    );
};