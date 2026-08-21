import { useState } from 'react';
import { addNewProduct, updateProduct } from '../service/productService';

export const usePostProducts = () => {
  const [successSavingProduct, setSuccessSavingProduct] = useState(false);
  const [errorSavingProduct, setErrorSavingProduct] = useState(false);
  const [newProductLoading, setNewProductLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const saveProduct = (product) => {
    const payload = {
      name: product?.name?.trim(),
      observation: product?.observation || product?.description || null,
      portion: product?.portion || null,
      image: product?.image || null,
      categoryId: product?.categoryId != null ? Number(product.categoryId) : null,
      isAvailable: product?.isAvailable !== false,
      value: Number(product?.value),
      quantity: product?.quantity ?? 0,
    };

    if (!payload.categoryId) {
      setErrorSavingProduct(true);
      setErrorMessage('Selecione uma categoria para o produto');
      return Promise.reject(new Error('Categoria obrigatória'));
    }

    setNewProductLoading(true);
    setErrorSavingProduct(false);
    setErrorMessage('');

    const request = product?.id
      ? updateProduct(product.id, payload)
      : addNewProduct(payload);

    return request
      .then((response) => {
        setSuccessSavingProduct(true);
        return response.data;
      })
      .catch((err) => {
        setErrorSavingProduct(true);
        setSuccessSavingProduct(false);
        setErrorMessage(
          err?.response?.data?.message || 'Erro ao salvar produto'
        );
        throw err;
      })
      .finally(() => setNewProductLoading(false));
  };

  const resetPostState = () => {
    setSuccessSavingProduct(false);
    setErrorSavingProduct(false);
    setErrorMessage('');
  };

  return {
    successSavingProduct,
    setSuccessSavingProduct,
    errorSavingProduct,
    postProduct: saveProduct,
    saveProduct,
    newProductLoading,
    errorMessage,
    resetPostState,
  };
};
