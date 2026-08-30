import { useState } from 'react';
import { saveTable } from '../service/tablesService';

export const usePostTables = () => {
    const [successSavingTable, setSuccessSavingTable] = useState(false);
    const [errorSavingTable, setErrorSavingTable] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [newTableLoading, setNewTableLoading] = useState(false);

    const postTable = (table) => {
        setNewTableLoading(true);
        setErrorSavingTable(false);
        setErrorMessage('');

        saveTable(table)
            .then(() => {
                setSuccessSavingTable(true);
                setErrorSavingTable(false);
                setNewTableLoading(false);
            })
            .catch((error) => {
                setErrorSavingTable(true);
                setSuccessSavingTable(false);
                setNewTableLoading(false);
                setErrorMessage(
                    error?.response?.data?.message
                    || 'Já existe uma mesa com este número'
                );
            });
    };

    return {
        successSavingTable,
        errorSavingTable,
        errorMessage,
        postTable,
        newTableLoading,
        setSuccessSavingTable,
    };
};
