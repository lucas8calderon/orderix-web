import { useState } from 'react';
import { saveComanda } from '../service/comandasService';

export const usePostComandas = () => {
  const [successSavingComanda, setSuccessSavingComanda] = useState(false);
  const [errorSavingComanda, setErrorSavingComanda] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newComandaLoading, setNewComandaLoading] = useState(false);

  const postComanda = (comanda) => {
    setNewComandaLoading(true);
    setErrorMessage('');

    saveComanda(comanda)
      .then(() => {
        setSuccessSavingComanda(true);
        setErrorSavingComanda(false);
        setNewComandaLoading(false);
      })
      .catch((error) => {
        setErrorSavingComanda(true);
        setSuccessSavingComanda(false);
        setNewComandaLoading(false);
        setErrorMessage(
          error?.response?.data?.message || 'Erro ao criar comanda'
        );
      });
  };

  return {
    successSavingComanda,
    errorSavingComanda,
    errorMessage,
    postComanda,
    newComandaLoading,
    setSuccessSavingComanda,
  };
};
