import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Loading } from "../../../commons/components/Loading";
import { CardEmployee } from "./components/CardEmployee";
import { SearchBar } from "./components/SearchBar";
import { FilterBar } from '../../../commons/components/FilterBar';
import { StatusBadge } from '../../../commons/components/StatusBadge';
import { RowActions } from '../../../commons/components/RowActions';
import { AvatarWithInitials } from './components/AvatarWithInitials';
import { EmployeesContext } from "./provider/EmployeesContext";
import { useGetEmployees } from "./hook/useGetEmployees";
import { usePostEmployees } from "./hook/usePostEmployees";
import { useDeleteEmployees } from "./hook/useDeleteEmployees";
import ErrorDeleteDialog from "../menu/components/ErrorDeleteDialog";
import { ConfirmDeleteDialog } from "../menu/components/ConfirmDeleteDialog";
import { EmployeeFormDialog } from "./components/EmployeeFormDialog";
import { Snackbar, Alert } from '@mui/material';
import './Employees.css';
import { PageHeader } from '../../../commons/components/PageHeader';
import { EmptyState } from '../../../commons/components/EmptyState';
import { GenericError } from '../../../commons/components/GenericError';

const PROFILE_FILTERS = [
  { id: 'all', label: 'Todos os perfis' },
  { id: 'STORE_ADMIN', label: 'Administrador' },
  { id: 'GARCOM', label: 'Garçom' },
  { id: 'KITCHEN', label: 'Cozinha' },
  { id: 'CASHIER', label: 'Caixa' },
];

function profileMeta(profile) {
  if (profile === 'GARCOM' || profile === 'WAITER') return { label: 'Garçom', tone: 'info' };
  if (profile === 'ADMIN' || profile === 'STORE_ADMIN') return { label: 'Administrador', tone: 'neutral' };
  if (profile === 'COZINHA' || profile === 'KITCHEN') return { label: 'Cozinha', tone: 'warning' };
  if (profile === 'CAIXA' || profile === 'CASHIER') return { label: 'Caixa', tone: 'success' };
  return { label: profile || '—', tone: 'neutral' };
}

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

  // Estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  
  // Toast state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  
  const {
    successSavingEmployee,
    errorSavingEmployee,
    errorSavingEmployeeMessage,
    postEmployee,
    newEmployeeLoading,
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
        emp.name?.toLowerCase().includes(lowerSearch) ||
        emp.email?.toLowerCase().includes(lowerSearch) ||
        (emp.phone || '').includes(lowerSearch) ||
        (emp.profile || '').toLowerCase().includes(lowerSearch)
      );
    }

    // Aplicar filtro de perfil
    if (activeFilter !== 'all') {
      filtered = filtered.filter((emp) => {
        if (activeFilter === 'STORE_ADMIN') {
          return emp.profile === 'STORE_ADMIN' || emp.profile === 'ADMIN';
        }
        return emp.profile === activeFilter;
      });
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
    resetPostState();
    setOpenAddEmployee(false);
    setHandleAddNewEmployee(false);
  };

  const onHandleSaveEmployee = (employee) => {
    setOnAddEmployeeResult({});
    postEmployee(employee);
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
      resetPostState();
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
      setOnAddEmployeeResult({
        ...handleError,
        message: errorSavingEmployeeMessage || handleError.message,
      });
    }
  }, [errorSavingEmployee, errorSavingEmployeeMessage]);

  useEffect(() => {
    if (successSavingEmployee) {
      setOnAddEmployeeResult(handleSuccess);
      fetchEmployees();
      handleToastOpen('Colaborador salvo.', 'success');
    }
  }, [successSavingEmployee]);

  useEffect(() => {
    if (successToDelete) {
      handleToastOpen('Colaborador excluído.', 'success');
    }
  }, [successToDelete]);

  return (
    <div className="employees-container">
      {loading && !loadingToDelete && (
        <Loading loadingMessage={"Carregando colaboradores..."} />
      )}
      {loadingToDelete && !loading && (
        <Loading loadingMessage={"Excluindo colaborador..."} />
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
        saving={newEmployeeLoading}
      />

      <EmployeeFormDialog
        open={openEditEmployee}
        onClose={() => {
          setOpenEditEmployee(false);
          setSelectedEmployee({});
          resetPostState();
          setOnAddEmployeeResult({});
        }}
        onSaveEmployee={onHandleSaveEmployee}
        employee={selectedEmployee}
        saving={newEmployeeLoading}
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
<PageHeader title="Colaboradores" description="Gerencie quem atende, prepara pedidos e administra sua loja." actions={<Button variant="contained" onClick={() => setHandleAddNewEmployee(true)}>Cadastrar colaborador</Button>} />
      {error && <GenericError onTryAgain={fetchEmployees} message="Não foi possível carregar a equipe." />}

      <FilterBar label="Busca de colaboradores">
        <SearchBar onSearch={handleSearch} placeholder="Buscar colaborador" />
        <TextField
          select
          size="small"
          label="Perfil"
          value={activeFilter}
          onChange={(event) => handleFilterChange(event.target.value)}
          sx={{ minWidth: 180 }}
        >
          {PROFILE_FILTERS.map((filter) => (
            <MenuItem key={filter.id} value={filter.id}>{filter.label}</MenuItem>
          ))}
        </TextField>
      </FilterBar>

      {filteredEmployees.length === 0 && !loading && !error && <EmptyState title={searchTerm || activeFilter !== 'all' ? 'Nenhum colaborador encontrado' : 'Monte sua equipe'} description={searchTerm || activeFilter !== 'all' ? 'Tente outro nome ou perfil de acesso.' : 'Cadastre os colaboradores e defina o perfil de acesso de cada pessoa.'} actionLabel={searchTerm || activeFilter !== 'all' ? undefined : 'Cadastrar colaborador'} onAction={() => setHandleAddNewEmployee(true)} />}

      {filteredEmployees.length > 0 && (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid', borderColor: 'divider' }}>
            <Table aria-label="Colaboradores">
              <TableHead>
                <TableRow>
                  <TableCell>Colaborador</TableCell>
                  <TableCell>Contato</TableCell>
                  <TableCell>Perfil</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee) => {
                  const profile = profileMeta(employee.profile);
                  return (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <AvatarWithInitials name={employee.name} size={32} />
                          <Typography fontWeight={600} sx={{ wordBreak: 'break-word' }}>{employee.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ wordBreak: 'break-word' }}>{employee.email || '—'}</Typography>
                        {employee.phone ? (
                          <Typography variant="body2" color="text.secondary">{employee.phone}</Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <StatusBadge label={profile.label} tone={profile.tone} />
                      </TableCell>
                      <TableCell align="right">
                        <RowActions name={employee.name} onEdit={() => handleEdit(employee)} onDelete={() => handleDelete(employee)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: { xs: 'grid', md: 'none' }, gap: 1.5 }}>
            {filteredEmployees.map((employee) => (
              <CardEmployee
                key={employee.id}
                employee={employee}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </Box>
        </>
      )}
    </div>
  );
}