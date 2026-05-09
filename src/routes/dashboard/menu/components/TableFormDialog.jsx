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
import  {TablesContext}  from "../../tables/provider/TablesContext";
import { usePostTables } from "../../tables/hook/usePostTables";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  width: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
});

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
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        {/* Produto */}
        <DialogContentText sx={{ mt: 3 }}>
          {showAlert && onAddTableResult?.message && (
            <Alert sx={{ mb: 2 }} severity={onAddTableResult.severity}>
              {onAddTableResult.message}
            </Alert>
          )}

          <Typography variant="h6" mb={2}>
            Mesa
          </Typography>
          <Grid container spacing={2} columns={16}>
            <Grid item xs={1}>
              <Avatar sx={{ bgcolor: "red" }} variant="square">
                N
              </Avatar>
            </Grid>
            <Grid item xs={15} sx={{ display: "flex", alignContent: "center" }}>
              <TextField
                sx={{ mr: 2, ml: 3 }}
                type="number"
                label="Número da mesa"
                inputProps={{ maxLength: 4 }}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                variant="outlined"
              />
              <TextField
                sx={{ mr: 2 }}
                label="Capacidade"
                inputProps={{ maxLength: 10 }}
                value={tableCapacity}
                onChange={(e) => setTableCapacity(e.target.value)}
                variant="outlined"
              />
              <FormControl
                sx={{ display: "flex", flexWrap: "wrap", minWidth: 200 }} // largura mínima
                variant="outlined"
              >
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
              onClick={() => handleTableSave(true)}
              size="large"
            >
              Nova mesa
            </Button>
            </Box>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
