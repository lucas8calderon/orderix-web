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
  Grid,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const isEditing = Boolean((employee || selectedEmployee)?.id);

  useEffect(() => {
    const currentEmployee = employee || selectedEmployee;
    if (open) {
      if (currentEmployee && Object.keys(currentEmployee).length > 0 && currentEmployee.id) {
        setName(currentEmployee.name || "");
        setEmail(currentEmployee.email || "");
        setPassword("");
        setProfile(currentEmployee.profile || "");
      } else {
        setName("");
        setEmail("");
        setPassword("");
        setProfile("");
      }
    }
  }, [employee, selectedEmployee, open]);

  const handleEmployeeSave = () => {
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    if (!trimmedName || !trimmedEmail || !profile) {
      setShowAlert(true);
      return;
    }

    if (!isEditing && (!trimmedPassword || trimmedPassword.length < 6)) {
      setShowAlert(true);
      return;
    }

    if (isEditing && trimmedPassword && trimmedPassword.length < 6) {
      setShowAlert(true);
      return;
    }

    const currentEmployee = employee || selectedEmployee;
    const employeeData = {
      name: trimmedName,
      email: trimmedEmail,
      profile,
    };

    if (trimmedPassword) {
      employeeData.password = trimmedPassword;
    }

    if (currentEmployee && currentEmployee.id) {
      employeeData.id = currentEmployee.id;
    }

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
      setName("");
      setEmail("");
      setPassword("");
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

          {showAlert && !onAddEmployeeResult?.message && (
            <Alert sx={{ mb: 2 }} severity="error">
              {isEditing
                ? 'Preencha nome, e-mail e perfil. Senha, se informada, precisa ter ao menos 6 caracteres.'
                : 'Preencha nome, e-mail, perfil e senha (mínimo 6 caracteres).'}
            </Alert>
          )}

          <Typography variant="h6" mb={2}>
            {isEditing ? 'Editar Funcionário' : 'Cadastro de Funcionário'}
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
                type="password"
                label={isEditing ? 'Nova senha (opcional)' : 'Senha'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                required={!isEditing}
                helperText={isEditing ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 6 caracteres'}
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
                  <MenuItem value="STORE_ADMIN">Administrador</MenuItem>
                  <MenuItem value="GARCOM">Garçom</MenuItem>
                  <MenuItem value="KITCHEN">Cozinha</MenuItem>
                  <MenuItem value="CASHIER">Caixa</MenuItem>
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
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Funcionário'}
              </Button>
            </Box>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
