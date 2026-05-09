import { useState } from 'react';
// import { saveEmployee, updateEmployee } from '../service/employeesService';
import { mockStorage } from '../utils/mockStorage';

// Use MOCK_STORAGE = true para modo protótipo, false para backend real
const USE_MOCK_STORAGE = true;

export function usePostEmployees() {
  const [successSavingEmployee, setSuccessSavingEmployee] = useState(false);
  const [errorSavingEmployee, setErrorSavingEmployee] = useState(false);
  const [newEmployeeLoading, setNewEmployeeLoading] = useState(false);

  const postEmployee = async (employee) => {
    try {
      setNewEmployeeLoading(true);
      setSuccessSavingEmployee(false);
      setErrorSavingEmployee(false);
      
      console.log('Salvando funcionário:', employee);
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        let savedEmployee;
        if (employee.id) {
          savedEmployee = await mockStorage.updateEmployee(employee);
        } else {
          savedEmployee = await mockStorage.createEmployee(employee);
        }
        console.log('Funcionário salvo com sucesso:', savedEmployee);
      } else {
        // Modo produção - usar backend real
        // if (employee.id) {
        //   await updateEmployee(employee);
        // } else {
        //   await saveEmployee(employee);
        // }
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
      
      if (USE_MOCK_STORAGE) {
        // Modo protótipo - usar mock storage
        await mockStorage.updateEmployee(employee);
      } else {
        // Modo produção - usar backend real
        // await updateEmployee(employee);
      }
      
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
    setNewEmployeeLoading
  };
}

