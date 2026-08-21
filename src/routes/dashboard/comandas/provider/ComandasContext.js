import { createContext, useState } from 'react';

export const ComandasContext = createContext();

export const ComandasProvider = ({ children }) => {
  const handleSuccess = { show: true, success: true, message: 'Comanda criada', severity: 'success' };
  const handleError = { show: true, error: true, message: 'Erro ao criar comanda', severity: 'error' };

  const [blockComandaFields, setBlockComandaFields] = useState(true);
  const [onAddComandaResult, setOnAddComandaResult] = useState({});
  const [handleAddNewComanda, setHandleAddNewComanda] = useState(false);
  const [handleDeleteComanda, setHandleDeleteComanda] = useState({});
  const [selectedComanda, setSelectedComanda] = useState({});
  const [openDeleteDialogComanda, setOpenDeleteDialogComanda] = useState(false);

  return (
    <ComandasContext.Provider
      value={{
        blockComandaFields,
        setBlockComandaFields,
        onAddComandaResult,
        setOnAddComandaResult,
        handleSuccess,
        handleError,
        handleAddNewComanda,
        setHandleAddNewComanda,
        selectedComanda,
        setSelectedComanda,
        handleDeleteComanda,
        setHandleDeleteComanda,
        openDeleteDialogComanda,
        setOpenDeleteDialogComanda,
      }}
    >
      {children}
    </ComandasContext.Provider>
  );
};
