import { useState } from 'react';
import { deleteComanda } from '../service/comandasService';

export const useDeleteComanda = () => {
  const [loadingToDelete, setLoadingToDelete] = useState(false);
  const [errorToDelete, setErrorToDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToDelete, setSuccessToDelete] = useState(false);

  const deleteComandaById = (comandaId) => {
    if (comandaId != null) {
      setLoadingToDelete(true);

      deleteComanda(comandaId)
        .then(() => {
          setErrorToDelete(false);
          setErrorMessage('');
          setLoadingToDelete(false);
          setSuccessToDelete(true);
        })
        .catch((error) => {
          setErrorToDelete(true);
          setErrorMessage(error?.response?.data?.message || '');
          setLoadingToDelete(false);
          setSuccessToDelete(false);
        });
    } else {
      setErrorToDelete(true);
      setErrorMessage('');
    }
  };

  const resetDeleteState = () => {
    setLoadingToDelete(false);
    setErrorToDelete(false);
    setErrorMessage('');
    setSuccessToDelete(false);
  };

  return {
    loadingToDelete,
    errorToDelete,
    errorMessage,
    successToDelete,
    deleteComandaById,
    resetDeleteState,
  };
};
