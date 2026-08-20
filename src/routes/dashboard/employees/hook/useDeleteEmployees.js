import { useState } from 'react';
import { deleteEmployee as deleteEmployeeService } from '../service/employeesService';

export function useDeleteEmployees() {
  const [loadingToDelete, setLoadingToDelete] = useState(false);
  const [errorToDelete, setErrorToDelete] = useState(false);
  const [successToDelete, setSuccessToDelete] = useState(false);

  const deleteEmployeeById = async (id) => {
    try {
      setLoadingToDelete(true);
      setErrorToDelete(false);
      setSuccessToDelete(false);
      await deleteEmployeeService(id);
      setSuccessToDelete(true);
    } catch (error) {
      setErrorToDelete(true);
      console.error('Error deleting employee:', error);
    } finally {
      setLoadingToDelete(false);
    }
  };

  const resetDeleteState = () => {
    setSuccessToDelete(false);
    setErrorToDelete(false);
  };

  return {
    loadingToDelete,
    errorToDelete,
    successToDelete,
    deleteEmployeeById,
    resetDeleteState,
  };
}
