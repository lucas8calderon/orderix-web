import React, { useState, useEffect, useContext, forwardRef } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ComandasContext } from '../provider/ComandasContext';
import { usePostComandas } from '../hook/usePostComandas';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export function ComandaFormDialog({ open, onClose, onSaveComanda }) {
  const { onAddComandaResult } = useContext(ComandasContext);
  const { successSavingComanda } = usePostComandas();

  const [comandaNumber, setComandaNumber] = useState('');
  const [comandaIsAvailable, setComandaIsAvailable] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const dialogProps = useDialogResponsiveProps();

  const handleComandaSave = () => {
    const number = Number(comandaNumber);
    if (!Number.isFinite(number) || number <= 0) {
      return;
    }
    onSaveComanda({
      number,
      isAvailable: Boolean(comandaIsAvailable),
    });
  };

  useEffect(() => {
    if (Object.keys(onAddComandaResult).length) {
      setShowAlert(true);
      const timeout = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [onAddComandaResult]);

  useEffect(() => {
    setComandaNumber('');
    setComandaIsAvailable(true);
    setShowAlert(false);
  }, [successSavingComanda]);

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
          {showAlert && onAddComandaResult?.message && (
            <Alert sx={{ mb: 2 }} severity={onAddComandaResult.severity}>
              {onAddComandaResult.message}
            </Alert>
          )}

          <Typography variant="h6" mb={2}>
            Comanda
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Número da comanda"
                inputProps={{ maxLength: 4 }}
                value={comandaNumber}
                onChange={(e) => setComandaNumber(e.target.value)}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="comanda-available-label">Está disponível?</InputLabel>
                <Select
                  labelId="comanda-available-label"
                  value={comandaIsAvailable}
                  onChange={(e) => setComandaIsAvailable(e.target.value)}
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
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                  mt: 1,
                }}
              >
                <Button
                  sx={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-white)',
                    minHeight: 44,
                    width: { xs: '100%', sm: 'auto' },
                    ':hover': {
                      backgroundColor: 'var(--color-secondary)',
                      color: 'var(--color-black)',
                    },
                  }}
                  startIcon={<AddIcon />}
                  onClick={handleComandaSave}
                  size="large"
                >
                  Nova comanda
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
