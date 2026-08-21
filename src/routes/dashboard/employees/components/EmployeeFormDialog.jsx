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
import { EmployeesContext } from "../provider/EmployeesContext";
import { useDialogResponsiveProps } from "../../../../commons/hooks/useResponsive";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

const PRIMARY_COLOR = "var(--color-primary)";
const DISABLED_PRIMARY = "rgba(139, 92, 246, 0.38)";

export function EmployeeFormDialog({
  open,
  onClose,
  onSaveEmployee,
  employee = null,
  saving = false,
}) {
  const {
    onAddEmployeeResult,
    selectedEmployee,
  } = useContext(EmployeesContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const isEditing = Boolean((employee || selectedEmployee)?.id);
  const dialogProps = useDialogResponsiveProps();
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();
  const hasValidPassword = isEditing
    ? trimmedPassword.length === 0 || trimmedPassword.length >= 6
    : trimmedPassword.length >= 6;
  const isFormValid = Boolean(
    trimmedName && trimmedEmail && profile && hasValidPassword
  );

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
      setShowAlert(false);
    }
  }, [employee, selectedEmployee, open]);

  const handleEmployeeSave = () => {
    if (!isFormValid || saving) {
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

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="md"
      {...dialogProps}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
        <DialogContentText sx={{ mt: 3 }} component="div">
          {(showAlert || onAddEmployeeResult?.message) && onAddEmployeeResult?.message && (
            <Alert sx={{ mb: 2 }} severity={onAddEmployeeResult.severity || 'success'}>
              {onAddEmployeeResult.message}
            </Alert>
          )}

          {showAlert && !onAddEmployeeResult?.message && (
            <Alert sx={{ mb: 2 }} severity="error">
              {isEditing
                ? 'Preencha nome e sobrenome, e-mail e cargo. Senha, se informada, precisa ter ao menos 6 caracteres.'
                : 'Preencha nome e sobrenome, e-mail, cargo e senha (mínimo 6 caracteres).'}
            </Alert>
          )}

          <Typography variant="h6" mb={2}>
            {isEditing ? 'Editar Funcionário' : 'Cadastro de Funcionário'}
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome e sobrenome"
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
                <InputLabel id="profile-label">Cargo</InputLabel>
                <Select
                  labelId="profile-label"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value)}
                  label="Cargo"
                >
                  <MenuItem value="STORE_ADMIN">Administrador</MenuItem>
                  <MenuItem value="GARCOM">Garçom</MenuItem>
                  <MenuItem value="KITCHEN">Cozinha</MenuItem>
                  <MenuItem value="CASHIER">Caixa</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                  mt: 2
                }}
              >
                <Button
                  disabled={!isFormValid || saving}
                  sx={{
                    backgroundColor: PRIMARY_COLOR,
                    color: "var(--color-white)",
                    textTransform: "none",
                    minHeight: 44,
                    width: { xs: "100%", sm: "auto" },
                    px: 3,
                    ":hover": {
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--color-black)"
                    },
                    "&.Mui-disabled": {
                      backgroundColor: DISABLED_PRIMARY,
                      color: "var(--color-white)",
                      opacity: 1,
                    },
                  }}
                  onClick={handleEmployeeSave}
                  size="large"
                >
                  {saving
                    ? (isEditing ? 'Salvando...' : 'Cadastrando...')
                    : (isEditing ? 'Salvar Alterações' : 'Cadastrar colaborador')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
