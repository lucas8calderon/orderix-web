import React, { useState, useEffect, useContext, forwardRef } from "react";
import {
  Button,
  Box,
  Dialog,
  DialogContent,
  DialogContentText,
  Slide,
  Typography,
  TextField,
  Avatar,
  Grid,
  Divider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";
import { EmployeesContext } from "../provider/EmployeesContext";
import { usePostEmployees } from "../hook/usePostEmployees";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export function EmployeeFormDialog({
  open,
  onClose,
  onSaveEmployee,
  employee = null,
}) {
  const {
    onAddEmployeeResult,
    selectedEmployee,
  } = useContext(EmployeesContext);
  const { successSavingEmployee } = usePostEmployees();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Load employee data when editing or reset when adding new
  useEffect(() => {
    const currentEmployee = employee || selectedEmployee;
    if (open) {
      if (currentEmployee && Object.keys(currentEmployee).length > 0 && currentEmployee.id) {
        // Edição - carregar dados do funcionário
        setName(currentEmployee.name || "");
        setEmail(currentEmployee.email || "");
        setPhone(currentEmployee.phone || "");
        setProfile(currentEmployee.profile || "");
      } else {
        // Novo - limpar campos
        setName("");
        setEmail("");
        setPhone("");
        setProfile("");
      }
    }
  }, [employee, selectedEmployee, open]);

  const handleEmployeeSave = () => {
    console.log('Formulário - Campos preenchidos:', { name, email, phone, profile });
    
    // Validar campos (remover espaços em branco)
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPhone = phone?.trim();
    
    if (!trimmedName || !trimmedEmail || !trimmedPhone || !profile) {
      console.log('Formulário - Validação falhou');
      setShowAlert(true);
      return;
    }

    const currentEmployee = employee || selectedEmployee;
    const employeeData = {
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      profile
    };

    // Add ID if editing
    if (currentEmployee && currentEmployee.id) {
      employeeData.id = currentEmployee.id;
    }

    console.log('Formulário - Dados do funcionário a serem salvos:', employeeData);
    onSaveEmployee(employeeData);
  };

  useEffect(() => {
    if (Object.keys(onAddEmployeeResult).length) {
      setShowAlert(true);
      const timeout = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [onAddEmployeeResult]);

  useEffect(() => {
    if (successSavingEmployee) {
      // Limpar campos após sucesso
      setName("");
      setEmail("");
      setPhone("");
      setProfile("");
      setShowAlert(false);
    }
  }, [successSavingEmployee]);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        <DialogContentText sx={{ mt: 3 }}>
          {(showAlert || onAddEmployeeResult?.message) && onAddEmployeeResult?.message && (
            <Alert sx={{ mb: 2 }} severity={onAddEmployeeResult.severity || 'success'}>
              {onAddEmployeeResult.message}
            </Alert>
          )}

          <Typography variant="h6" mb={2}>
            {employee || selectedEmployee?.id ? 'Editar Funcionário' : 'Cadastro de Funcionário'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="tel"
                label="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel id="profile-label">Perfil</InputLabel>
                <Select
                  labelId="profile-label"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  label="Perfil"
                >
                  <MenuItem value="GARCOM">Garçom</MenuItem>
                  <MenuItem value="COZINHA">Cozinha</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "center",
                mt: 2
              }}
            >
              <Button
                sx={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-white)",
                  ":hover": {
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-black)"
                  }
                }}
                startIcon={<AddIcon />}
                onClick={handleEmployeeSave}
                size="large"
              >
                {employee || selectedEmployee?.id ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
              </Button>
            </Box>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}

