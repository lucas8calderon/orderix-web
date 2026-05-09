import { createContext, useState } from 'react';

export const TablesContext = createContext();

export const TablesProvider = ({ children }) => {  
    let handleSuccess = { show: true, success: true, message: 'Mesa criada', severity : 'success' };
    let handleError = { show: true, error: true, message: 'Erro ao criar mesa', severity : 'error' };

    const [showTables, setShowTables] = useState(false);
    const [blockTablesFields, setBlockTablesFields] = useState(true);
    const [onAddTableResult, setOnAddTableResult] = useState({});
    const [handleAddNewTable, setHandleAddNewTable] = useState(false);
    const [handleDeleteTable, setHandleDeleteTable] = useState({});
    const [selectedTable, setSelectedTable] = useState({});
    const [openDeleteDialogTable, setOpenDeleteDialogTable] = useState(false);

    return (
        <TablesContext.Provider value={{
            showTables, setShowTables,
            blockTablesFields, setBlockTablesFields,
            onAddTableResult, setOnAddTableResult,
            handleSuccess, handleError,
            handleAddNewTable, setHandleAddNewTable,
            selectedTable, setSelectedTable,
            handleDeleteTable, setHandleDeleteTable,
             openDeleteDialogTable, setOpenDeleteDialogTable
        }}>
            {children}
        </TablesContext.Provider>
    );
};