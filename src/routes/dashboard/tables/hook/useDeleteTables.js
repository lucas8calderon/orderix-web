import { useState } from "react";
import { deleteTable } from "../service/tablesService";

export const useDeleteTable = () => {
    const [loadingToDelete, setLoadingToDelete] = useState(false);
    const [errorToDelete, setErrorToDelete] = useState(false);
    const [successToDelete, setSuccessToDelete] = useState(false);

    const deleteTableById = (tableId) => {
        if (tableId != null) {
            setLoadingToDelete(true);

            deleteTable(tableId).then(response => {
                setErrorToDelete(false);
                setLoadingToDelete(false);
                setSuccessToDelete(true);
            }).catch(error => {
                setErrorToDelete(true);
                console.log("chamou o delete e deu erro" );
                setLoadingToDelete(false);
                setSuccessToDelete(false);
            });
        } else {
            setErrorToDelete(true);
        }
    }

    const resetDeleteState = () => {
    setLoadingToDelete(false);
    setErrorToDelete(false);
    setSuccessToDelete(false);
  };

    return { loadingToDelete, errorToDelete, successToDelete, deleteTableById, resetDeleteState };
}