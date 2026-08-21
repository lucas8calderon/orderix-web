import { useState } from 'react';
import { saveEmployee, updateEmployee } from '../service/employeesService';

function getApiErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  return fallback;
}

export function usePostEmployees() {
  const [successSavingEmployee, setSuccessSavingEmployee] = useState(false);
  const [errorSavingEmployee, setErrorSavingEmployee] = useState(false);
  const [errorSavingEmployeeMessage, setErrorSavingEmployeeMessage] = useState('');
  const [newEmployeeLoading, setNewEmployeeLoading] = useState(false);

  const postEmployee = async (employee) => {
    try {
      setNewEmployeeLoading(true);
      setSuccessSavingEmployee(false);
      setErrorSavingEmployee(false);
      setErrorSavingEmployeeMessage('');

      if (employee.id) {
        await updateEmployee(employee);
      } else {
        await saveEmployee(employee);
      }

      setSuccessSavingEmployee(true);
    } catch (error) {
      setErrorSavingEmployee(true);
      setErrorSavingEmployeeMessage(getApiErrorMessage(error, 'Erro ao criar funcionário'));
      console.error('Error saving employee:', error);
    } finally {
      setNewEmployeeLoading(false);
    }
  };

  const putEmployee = async (employee) => {
    try {
      setNewEmployeeLoading(true);
      setSuccessSavingEmployee(false);
      setErrorSavingEmployee(false);
      setErrorSavingEmployeeMessage('');
      await updateEmployee(employee);
      setSuccessSavingEmployee(true);
    } catch (error) {
      setErrorSavingEmployee(true);
      setErrorSavingEmployeeMessage(getApiErrorMessage(error, 'Erro ao atualizar funcionário'));
      console.error('Error updating employee:', error);
    } finally {
      setNewEmployeeLoading(false);
    }
  };

  const resetPostState = () => {
    setSuccessSavingEmployee(false);
    setErrorSavingEmployee(false);
    setErrorSavingEmployeeMessage('');
  };

  return {
    successSavingEmployee,
    errorSavingEmployee,
    errorSavingEmployeeMessage,
    postEmployee,
    putEmployee,
    newEmployeeLoading,
    setSuccessSavingEmployee,
    resetPostState,
    setNewEmployeeLoading,
  };
}
