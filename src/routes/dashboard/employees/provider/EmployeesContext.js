import { createContext, useState } from 'react';

export const EmployeesContext = createContext();

export const EmployeesProvider = ({ children }) => {  
    let handleSuccess = { show: true, success: true, message: 'Funcionário criado com sucesso', severity: 'success' };
    let handleError = { show: true, error: true, message: 'Erro ao criar funcionário', severity: 'error' };

    const [showEmployees, setShowEmployees] = useState(false);
    const [blockEmployeesFields, setBlockEmployeesFields] = useState(true);
    const [onAddEmployeeResult, setOnAddEmployeeResult] = useState({});
    const [handleAddNewEmployee, setHandleAddNewEmployee] = useState(false);
    const [handleDeleteEmployee, setHandleDeleteEmployee] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState({});
    const [openDeleteDialogEmployee, setOpenDeleteDialogEmployee] = useState(false);

    return (
        <EmployeesContext.Provider value={{
            showEmployees, setShowEmployees,
            blockEmployeesFields, setBlockEmployeesFields,
            onAddEmployeeResult, setOnAddEmployeeResult,
            handleSuccess, handleError,
            handleAddNewEmployee, setHandleAddNewEmployee,
            selectedEmployee, setSelectedEmployee,
            handleDeleteEmployee, setHandleDeleteEmployee,
            openDeleteDialogEmployee, setOpenDeleteDialogEmployee
        }}>
            {children}
        </EmployeesContext.Provider>
    );
};

