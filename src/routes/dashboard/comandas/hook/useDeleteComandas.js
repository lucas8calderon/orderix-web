import { useState } from 'react';
import { deleteComanda } from '../service/comandasService';

export const useDeleteComanda = () => {
  const [loadingToDelete, setLoadingToDelete] = useState(false);
  const [errorToDelete, setErrorToDelete] = useState(false);
  const [successToDelete, setSuccessToDelete] = useState(false);

  const deleteComandaById = (comandaId) => {
    if (comandaId != null) {
      setLoadingToDelete(true);

      deleteComanda(comandaId)
        .then(() => {
          setErrorToDelete(false);
          setLoadingToDelete(false);
          setSuccessToDelete(true);
        })
        .catch(() => {
          setErrorToDelete(true);
          setLoadingToDelete(false);
          setSuccessToDelete(false);
        });
    } else {
      setErrorToDelete(true);
    }
  };

  const resetDeleteState = () => {
    setLoadingToDelete(false);
    setErrorToDelete(false);
    setSuccessToDelete(false);
  };

  return {
    loadingToDelete,
    errorToDelete,
    successToDelete,
    deleteComandaById,
    resetDeleteState,
  };
};
