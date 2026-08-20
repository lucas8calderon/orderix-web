import { useState } from 'react';
import { saveEmployee, updateEmployee } from '../service/employeesService';

export function usePostEmployees() {
  const [successSavingEmployee, setSuccessSavingEmployee] = useState(false);
  const [errorSavingEmployee, setErrorSavingEmployee] = useState(false);
  const [newEmployeeLoading, setNewEmployeeLoading] = useState(false);

  const postEmployee = async (employee) => {
    try {
      setNewEmployeeLoading(true);
      setSuccessSavingEmployee(false);
      setErrorSavingEmployee(false);

      if (employee.id) {
        await updateEmployee(employee);
      } else {
        await saveEmployee(employee);
      }

      setSuccessSavingEmployee(true);
    } catch (error) {
      setErrorSavingEmployee(true);
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
      await updateEmployee(employee);
      setSuccessSavingEmployee(true);
    } catch (error) {
      setErrorSavingEmployee(true);
      console.error('Error updating employee:', error);
    } finally {
      setNewEmployeeLoading(false);
    }
  };

  const resetPostState = () => {
    setSuccessSavingEmployee(false);
    setErrorSavingEmployee(false);
  };

  return {
    successSavingEmployee,
    errorSavingEmployee,
    postEmployee,
    putEmployee,
    newEmployeeLoading,
    setSuccessSavingEmployee,
    resetPostState,
    setNewEmployeeLoading,
  };
}
