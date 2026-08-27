import { useState } from 'react';
import { saveTable } from '../service/tablesService';

export const usePostTables = () => {
    const [successSavingTable, setSuccessSavingTable] = useState(false);
    const [errorSavingTable, setErrorSavingTable] = useState(false);
    const [newTableLoading, setNewTableLoading] = useState(false);

    const postTable = (table) => {
        setNewTableLoading(true);

        saveTable(table)
            .then(response => {
                setSuccessSavingTable(true);
                setErrorSavingTable(false);
                setNewTableLoading(false);
            })
            .catch(error => {
                setErrorSavingTable(true);
                setSuccessSavingTable(false);
                setNewTableLoading(false);
            });
    };
    

    return { successSavingTable, errorSavingTable, postTable, newTableLoading, setSuccessSavingTable };
};
