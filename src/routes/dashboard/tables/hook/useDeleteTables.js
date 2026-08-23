import { useState } from "react";
import { deleteTable } from "../service/tablesService";

export const useDeleteTable = () => {
    const [loadingToDelete, setLoadingToDelete] = useState(false);
    const [errorToDelete, setErrorToDelete] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successToDelete, setSuccessToDelete] = useState(false);

    const deleteTableById = (tableId) => {
        if (tableId != null) {
            setLoadingToDelete(true);

            deleteTable(tableId).then(response => {
                setErrorToDelete(false);
                setErrorMessage('');
                setLoadingToDelete(false);
                setSuccessToDelete(true);
            }).catch(error => {
                setErrorToDelete(true);
                setErrorMessage(error?.response?.data?.message || '');
                setLoadingToDelete(false);
                setSuccessToDelete(false);
            });
        } else {
            setErrorToDelete(true);
            setErrorMessage('');
        }
    }

    const resetDeleteState = () => {
    setLoadingToDelete(false);
    setErrorToDelete(false);
    setErrorMessage('');
    setSuccessToDelete(false);
  };

    return { loadingToDelete, errorToDelete, errorMessage, successToDelete, deleteTableById, resetDeleteState };
}