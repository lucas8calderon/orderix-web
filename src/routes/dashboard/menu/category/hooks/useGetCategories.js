import { useState, useEffect, useCallback } from 'react';
import {
  getAllCategories,
  postNewCategory,
  updateCategory,
} from '../service/categoryService';

export const useGetCategories = (refreshKey = 0) => {
  const [categories, setCategories] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emptyResult, setEmptyResult] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    getAllCategories()
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setCategories(data);
        setSuccess(true);
        setEmptyResult(data.length === 0);
        setError(false);
      })
      .catch(() => {
        setCategories([]);
        setSuccess(false);
        setEmptyResult(false);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshKey]);

  return {
    categories,
    error,
    success,
    emptyResult,
    loading,
    refetch: fetchCategories,
  };
};

export const usePostCategory = () => {
  const [successOnSaveCategory, setSuccessOnSaveCategory] = useState(false);
  const [errorOnSaveCategory, setErrorOnSaveCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const saveCategory = (category) => {
    const payload = {
      name: category?.name?.trim(),
      backgroundColor: category?.backgroundColor || null,
      image: category?.image || null,
      active: category?.active !== false,
    };

    setSaving(true);
    setErrorOnSaveCategory(false);
    setErrorMessage('');

    const request = category?.id
      ? updateCategory(category.id, payload)
      : postNewCategory(payload);

    return request
      .then((response) => {
        setSuccessOnSaveCategory(true);
        return response.data;
      })
      .catch((err) => {
        setErrorOnSaveCategory(true);
        setSuccessOnSaveCategory(false);
        setErrorMessage(
          err?.response?.data?.message || 'Erro ao salvar categoria'
        );
        throw err;
      })
      .finally(() => setSaving(false));
  };

  const resetSaveState = () => {
    setSuccessOnSaveCategory(false);
    setErrorOnSaveCategory(false);
    setErrorMessage('');
  };

  return {
    successOnSaveCategory,
    setSuccessOnSaveCategory,
    errorOnSaveCategory,
    setErrorOnSaveCategory,
    errorMessage,
    saving,
    postCategory: saveCategory,
    saveCategory,
    resetSaveState,
  };
};
