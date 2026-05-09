import React, { useContext, useEffect, useState } from "react";
import { Grid, Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Loading } from "../../../commons/components/Loading";
import { CardEmployee } from "./components/CardEmployee";
import { SearchBar } from "./components/SearchBar";
import { FilterChips } from "./components/FilterChips";
import { EmployeesContext } from "./provider/EmployeesContext";
import { useGetEmployees } from "./hook/useGetEmployees";
import { usePostEmployees } from "./hook/usePostEmployees";
import { useDeleteEmployees } from "./hook/useDeleteEmployees";
import ErrorDeleteDialog from "../menu/components/ErrorDeleteDialog";
import { ConfirmDeleteDialog } from "../menu/components/ConfirmDeleteDialog";
import { EmployeeFormDialog } from "./components/EmployeeFormDialog";
import { Snackbar, Alert } from '@mui/material';
import './Employees.css';

export function Employees() {
  const {
    showEmployees,
    setShowEmployees,
    blockEmployeesFields,
    setBlockEmployeesFields,
    onAddEmployeeResult,
    setOnAddEmployeeResult,
    handleSuccess,
    handleError,
    handleAddNewEmployee,
    setHandleAddNewEmployee,
    selectedEmployee,
    setSelectedEmployee,
    handleDeleteEmployee,
    setHandleDeleteEmployee,
    openDeleteDialogEmployee,
    setOpenDeleteDialogEmployee,
  } = useContext(EmployeesContext);

  const { employees, loading, error, fetchEmployees } = useGetEmployees();
  console.log("Employees data:", employees);

  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  const {
    successSavingEmployee,
    errorSavingEmployee,
    postEmployee,
    newEmployeeLoading,
    setSuccessSavingEmployee,
    resetPostState,
  } = usePostEmployees();
  
  const {
    loadingToDelete,
    errorToDelete,
    successToDelete,
    deleteEmployeeById,
    resetDeleteState,
  } = useDeleteEmployees();

  // Filtrar funcionários
  useEffect(() => {
    let filtered = employees;

    // Aplicar filtro de busca
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(lowerSearch) ||
        emp.email.toLowerCase().includes(lowerSearch) ||
        emp.phone.includes(lowerSearch) ||
        emp.profile.toLowerCase().includes(lowerSearch)
      );
    }

    // Aplicar filtro de perfil
    if (activeFilter !== 'all') {
      filtered = filtered.filter(emp => emp.profile === activeFilter);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, activeFilter]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleOnClose = () => {
    setOnAddEmployeeResult({});
    setOpenAddEmployee(false);
    setHandleAddNewEmployee(false);
  };

  const onHandleSaveEmployee = (employee) => {
    postEmployee(employee);
    setSelectedEmployee({});
    setSuccessSavingEmployee(false);
  };

  const handleToastOpen = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleSelectedEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const [openAddEmployee, setOpenAddEmployee] = useState(false);
  const [openEditEmployee, setOpenEditEmployee] = useState(false);

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditEmployee(true);
  };

  const handleDelete = (employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialogEmployee(true);
  };

  const confirmDelete = () => {
    setHandleDeleteEmployee(selectedEmployee);
  };

  useEffect(() => {
    if (Object.keys(handleDeleteEmployee).length !== 0) {
      deleteEmployeeById(handleDeleteEmployee.id);
      setHandleDeleteEmployee({});
    }
  }, [handleDeleteEmployee]);

  useEffect(() => {
    if (successToDelete || successSavingEmployee) {
      fetchEmployees();
      setSelectedEmployee({});
      resetDeleteState();
      setOpenDeleteDialogEmployee(false);
      if (openAddEmployee) setOpenAddEmployee(false);
      if (openEditEmployee) setOpenEditEmployee(false);
    }
  }, [successToDelete, successSavingEmployee]);

  useEffect(() => {
    if (handleAddNewEmployee === true) {
      setOnAddEmployeeResult({});
      setBlockEmployeesFields(false);
      setOpenAddEmployee(true);
    }
  }, [handleAddNewEmployee]);

  useEffect(() => {
    if (error) {
      setOnAddEmployeeResult(handleError);
    }
  }, [error]);

  useEffect(() => {
    if (errorSavingEmployee) {
      setOnAddEmployeeResult(handleError);
    }
  }, [errorSavingEmployee]);

  useEffect(() => {
    if (successSavingEmployee) {
      setOnAddEmployeeResult(handleSuccess);
      fetchEmployees();
      handleToastOpen('Funcionário salvo com sucesso!', 'success');
    }
  }, [successSavingEmployee]);

  useEffect(() => {
    if (successToDelete) {
      handleToastOpen('Funcionário excluído com sucesso!', 'success');
    }
  }, [successToDelete]);

  return (
    <div className="employees-container">
      {loading && !loadingToDelete && (
        <Loading loadingMessage={"Carregando funcionários..."} />
      )}
      {loadingToDelete && !loading && (
        <Loading loadingMessage={"Excluíndo funcionário..."} />
      )}

      {errorToDelete && (
        <ErrorDeleteDialog
          open={errorToDelete}
          onClose={resetDeleteState}
          itemName={selectedEmployee.name}
        />
      )}

      <ConfirmDeleteDialog
        open={openDeleteDialogEmployee}
        onClose={() => setOpenDeleteDialogEmployee(false)}
        onConfirm={confirmDelete}
        itemType={"funcionário"}
        itemName={selectedEmployee?.name}
      />

      <EmployeeFormDialog
        open={openAddEmployee}
        onClose={handleOnClose}
        onSaveEmployee={onHandleSaveEmployee}
      />

      <EmployeeFormDialog
        open={openEditEmployee}
        onClose={() => {
          setOpenEditEmployee(false);
          setSelectedEmployee({});
        }}
        onSaveEmployee={onHandleSaveEmployee}
        employee={selectedEmployee}
      />

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleToastClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box className="employees-header">
        <Typography className="employees-title">Colaboradores</Typography>
        <Button
          sx={{
            backgroundColor: "var(--color-primary)",
            color: "white",
            textTransform: "none",
            borderRadius: "12px",
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: "15px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            ":hover": {
              backgroundColor: "var(--color-primary)",
              boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
              transform: "translateY(-1px)",
            },
          }}
          startIcon={<AddIcon />}
          onClick={() => setHandleAddNewEmployee(true)}
        >
          Novo Funcionário
        </Button>
      </Box>

      {/* Search and Filters */}
      <Box className="search-and-filters">
        <SearchBar onSearch={handleSearch} />
        <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </Box>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm || activeFilter !== 'all' 
              ? 'Nenhum colaborador encontrado' 
              : 'Nenhum colaborador cadastrado'}
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid item key={employee.id} xs={12} sm={6} md={4} lg={3}>
            <CardEmployee
              employee={employee}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}