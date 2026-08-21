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
import { TablesContext } from "../../tables/provider/TablesContext";
import { usePostTables } from "../../tables/hook/usePostTables";
import { useDialogResponsiveProps } from "../../../../commons/hooks/useResponsive";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export function TableFormDialog({
  open,
  onClose,
  currentTable,
  onSaveTable,
}) {

   const {
      
      onAddTableResult,
      
    } = useContext(TablesContext);
  const { successSavingTable } = usePostTables();
 
 const [tableNumber, setTableNumber ] = useState();
 const [tableCapacity, setTableCapacity] = useState();
 const [tableIsAvailable, setTableIsAvailable] = useState();
 const [showAlert, setShowAlert] = useState();
 const dialogProps = useDialogResponsiveProps();

  const handleTableSave = () => {
    onSaveTable({
      number: tableNumber,
      capacity: tableCapacity,
      isAvailable: tableIsAvailable
    });
  };

  useEffect(() => {
    if (Object.keys(onAddTableResult).length) {
      setShowAlert(true);
      const timeout = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [onAddTableResult]);

  useEffect(() => {
    setTableNumber("");
    setTableCapacity("");
    setTableIsAvailable("");
    setShowAlert(false);
  }, [successSavingTable])

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      maxWidth="sm"
      {...dialogProps}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
        <DialogContentText sx={{ mt: { xs: 1, sm: 3 } }} component="div">
          {showAlert && onAddTableResult?.message && (
            <Alert sx={{ mb: 2 }} severity={onAddTableResult.severity}>
              {onAddTableResult.message}
            </Alert>
          )}

          <Typography variant="h6" mb={2}>
            Mesa
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Número da mesa"
                inputProps={{ maxLength: 4 }}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Capacidade"
                inputProps={{ maxLength: 10 }}
                value={tableCapacity}
                onChange={(e) => setTableCapacity(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="table-available-label">
                  Está disponível?
                </InputLabel>
                <Select
                  labelId="table-available-label" 
                  value={tableIsAvailable}
                  onChange={(e) => setTableIsAvailable(e.target.value)}
                  label="Está disponível?"
                >
                  <MenuItem value={true}>Sim</MenuItem>
                  <MenuItem value={false}>Não</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                  mt: 1
                }}
              >
                <Button
                  sx={{
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-white)",
                    minHeight: 44,
                    width: { xs: "100%", sm: "auto" },
                    ":hover": {
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--color-black)"
                    }
                  }}
                  startIcon={<AddIcon />}
                  onClick={() => handleTableSave(true)}
                  size="large"
                >
                  Nova mesa
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
