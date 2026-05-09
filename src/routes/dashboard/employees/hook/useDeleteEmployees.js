import { useState } from 'react';
// import { deleteEmployee as deleteEmployeeService } from '../service/employeesService';
import { mockStorage } from '../utils/mockStorage';

// Use MOCK_STORAGE = true para modo protótipo, false para backend real
const USE_MOCK_STORAGE = true;

export function useDeleteEmployees() {
  const [loadingToDelete, setLoadingToDelete] = useState(false);
  const [errorToDelete, setErrorToDelete] = useState(false);
  const [successToDelete, setSuccessToDelete] = useState(false);

  const deleteEmployeeById = async (id) => {
    try {
      setLoadingToDelete(true);
      setErrorToDelete(false);
      setSuccessToDelete(false);
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        await mockStorage.deleteEmployee(id);
      } else {
        // Modo produção - usar backend real
        // await deleteEmployeeService(id);
      }
      
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
    resetDeleteState
  };
}

